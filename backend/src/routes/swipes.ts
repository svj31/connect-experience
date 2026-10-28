import { Router } from "express";
import { requireActive, requireAuth, type AuthedRequest } from "../auth.js";
import { FeedCache, rankFeed } from "../feed.js";
import { distanceKm } from "../geo.js";
import { ageOf, avatarOf, completeness, effectiveStatus, settingsOf } from "../people.js";
import type { Repo, UserRow } from "../repo.js";
import { swipeSchema } from "../validation.js";
import { discoverable, openSharedSpace, relations } from "./people.js";
import type { RoomHub } from "./rooms.js";

/** Daily limits, as in most dating apps: they slow down mass liking and make a like mean more. */
export const QUOTAS = { like: 100, superlike: 3 };

const hoursSince = (iso: string | null) => (iso ? (Date.now() - Date.parse(iso + "Z")) / 3_600_000 : null);

/**
 * Discover as a swipe deck: a ranked, cached stack (GET /feed) and one endpoint that records a
 * decision and, for likes, checks for a mutual match inside the same transaction (POST /swipes).
 */
export function swipeRoutes(repo: Repo, hub: RoomHub, cache = new FeedCache()) {
  const r = Router();
  r.use(requireAuth, requireActive(repo));
  const rel = relations(repo, hub);

  function stackFor(me: UserRow, refresh: boolean): number[] {
    const cached = refresh ? null : cache.get(me.id);
    if (cached) return cached;
    const settings = settingsOf(me);
    const likedMe = new Set(repo.connectionsOf(me.id).filter((c) => c.status === "pending" && c.addressee_id === me.id).map((c) => c.requester_id));
    const candidates = discoverable(repo, me)
      .filter((u) => {
        const age = ageOf(u);
        if (age !== null && (age < settings.ageMin || age > settings.ageMax)) return false;
        const km = distanceKm(me.city, u.city);
        return !settings.maxDistanceKm || km === null || km <= settings.maxDistanceKm;
      })
      .map((u) => ({
        id: u.id,
        vibe: rel.vibeFor(me, u).score,
        distanceKm: distanceKm(me.city, u.city),
        idleHours: hoursSince(u.last_active_at),
        ageDays: (hoursSince(u.created_at) ?? 0) / 24,
        completeness: completeness(u).percent,
        likedYou: likedMe.has(u.id),
      }));
    const ids = rankFeed(candidates);
    cache.set(me.id, ids);
    return ids;
  }

  const quota = (userId: number) => {
    const used = repo.swipesToday(userId);
    return { likesLeft: Math.max(0, QUOTAS.like - used.like), superlikesLeft: Math.max(0, QUOTAS.superlike - used.superlike) };
  };

  r.get("/feed", (req: AuthedRequest, res) => {
    const me = repo.userById(req.userId!)!;
    const limit = Math.min(20, Math.max(1, Number(req.query.limit ?? 10) || 10));
    const ids = stackFor(me, req.query.refresh === "1");
    const people = [];
    for (const id of ids) {
      if (people.length >= limit) break;
      const row = repo.userById(id);
      // The stack can be a few minutes old: skip anyone who left, got blocked or was swiped since.
      if (!row || effectiveStatus(row) !== "active" || repo.isBlocked(me.id, id) || repo.swipeBetween(me.id, id)) continue;
      people.push(rel.card(me, row));
    }
    res.json({ people, remaining: ids.length, quota: quota(me.id) });
  });

  r.get("/swipes/quota", (req: AuthedRequest, res) => {
    res.json(quota(req.userId!));
  });

  r.post("/swipes", (req: AuthedRequest, res) => {
    const parsed = swipeSchema.safeParse(req.body);
    const me = repo.userById(req.userId!)!;
    const target = parsed.success ? repo.userById(parsed.data.targetId) : undefined;
    if (!parsed.success || !target || target.id === me.id || target.role !== "user" || effectiveStatus(target) !== "active") {
      res.status(400).json({ error: "You cannot swipe on this person" });
      return;
    }
    if (repo.isBlocked(me.id, target.id)) {
      res.status(403).json({ error: "You cannot swipe on this person" });
      return;
    }
    const { decision, note } = parsed.data;
    const left = quota(me.id);
    if ((decision === "like" && left.likesLeft === 0) || (decision === "superlike" && left.superlikesLeft === 0)) {
      res.status(429).json({ error: decision === "like" ? "You are out of likes for today" : "You are out of super likes for today", quota: left });
      return;
    }

    // Read their like and write ours in one transaction, so two people liking each other at the
    // same moment always produce exactly one match (the race the Tinder design calls out).
    const outcome = repo.transaction(() => {
      const existing = repo.connectionBetween(me.id, target.id);
      if (existing?.status === "accepted") return { status: "connected" as const, roomCode: existing.room_code, connectionId: existing.id };
      if (decision === "pass") {
        repo.swipe(me.id, target.id, "pass");
        repo.pass(me.id, target.id);
        return { status: "passed" as const };
      }
      if (existing?.status === "pending" && existing.requester_id === target.id) {
        const roomCode = openSharedSpace(repo, existing);
        repo.swipe(me.id, target.id, decision, true);
        repo.swipe(target.id, me.id, repo.swipeBetween(target.id, me.id)?.decision ?? "like", true);
        return { status: "matched" as const, roomCode, connectionId: existing.id };
      }
      repo.swipe(me.id, target.id, decision);
      const connectionId = existing?.status === "pending" ? existing.id : repo.requestConnection(me.id, target.id, note);
      if (decision === "superlike") repo.markSuper(connectionId);
      return { status: "liked" as const, connectionId };
    });

    cache.remove(me.id, target.id);
    if (outcome.status === "matched") {
      cache.remove(target.id, me.id);
      hub.notify(target.id, "connection:accepted", { id: outcome.connectionId, name: me.display_name, avatar: avatarOf(me), roomCode: outcome.roomCode, mutual: true });
    } else if (outcome.status === "liked") {
      hub.notify(target.id, "connection:request", { id: outcome.connectionId, name: me.display_name, note, super: decision === "superlike" });
    }
    res.status(outcome.status === "passed" ? 200 : 201).json({
      ...outcome,
      match: outcome.status === "matched" ? { person: rel.card(me, target), roomCode: outcome.roomCode } : null,
      quota: quota(me.id),
    });
  });

  /** Undo your last pass, so a slip of the thumb is not final. Likes are not undone: the other person may already know. */
  r.post("/swipes/undo", (req: AuthedRequest, res) => {
    const me = repo.userById(req.userId!)!;
    const last = repo.lastSwipe(me.id);
    const row = last ? repo.userById(last.target_id) : undefined;
    if (!last || last.decision !== "pass" || !row) {
      res.status(400).json({ error: "There is no pass to undo" });
      return;
    }
    repo.deleteSwipe(me.id, last.target_id);
    cache.invalidate(me.id);
    res.json({ person: rel.card(me, row) });
  });

  return r;
}
