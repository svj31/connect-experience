import { Router, type Response } from "express";
import { requireActive, requireAuth, type AuthedRequest } from "../auth.js";
import { BOND_LEVELS, computeBond, type Bond } from "../bond.js";
import { INTENT_LABELS, PROMPTS, QUIZ } from "../content/profile.js";
import {
  ageOf, avatarOf, cardFor, completeness, effectiveStatus, interestsOf, privacyOf, profileFor, settingsOf, vibeProfile, type Access,
} from "../people.js";
import { drawPrompts, questionOfTheDay, suggestActivities, watchPicks } from "../personalize.js";
import type { ConnectionRow, Repo, UserRow } from "../repo.js";
import { distanceKm } from "../geo.js";
import { computeVibe, mutualFit } from "../vibe.js";
import { connectSchema, peopleQuerySchema, playSchema } from "../validation.js";
import type { RoomHub } from "./rooms.js";

const ONLINE_WINDOW_MS = 5 * 60_000;

/** Accepts a connection and opens the pair's private space. Returns the room code. */
export function openSharedSpace(repo: Repo, conn: ConnectionRow) {
  const a = repo.userById(conn.requester_id)!;
  const b = repo.userById(conn.addressee_id)!;
  const room = repo.createRoom({ title: `${a.display_name} and ${b.display_name}`, topic: "", activity: "deeptalk", isPublic: false, hostId: a.id, guestId: b.id, kind: "connection" });
  repo.acceptConnection(conn.id, room.code);
  return room.code;
}

/** People this viewer could meet, after privacy, blocks, swipes and mutual preference. */
export function discoverable(repo: Repo, me: UserRow) {
  const meFit = { gender: me.gender, lookingFor: me.looking_for };
  return repo
    .discoverPool(me.id)
    .filter((u) => effectiveStatus(u) === "active" && privacyOf(u).discoverable && mutualFit(meFit, { gender: u.gender, lookingFor: u.looking_for }));
}

/** Shared helpers for anything that shows one person to another. */
export function relations(repo: Repo, hub: RoomHub) {
  const bondOf = (conn: ConnectionRow | undefined): Bond | null =>
    conn?.status === "accepted" ? computeBond(repo.pairStats(conn.room_code)) : null;

  function access(viewerId: number, target: UserRow): { access: Access; connection: ConnectionRow | undefined; bond: Bond | null } {
    if (viewerId === target.id) return { access: { self: true, connected: true, bondLevel: 5 }, connection: undefined, bond: null };
    const connection = repo.connectionBetween(viewerId, target.id);
    const bond = bondOf(connection);
    return { access: { self: false, connected: connection?.status === "accepted", bondLevel: bond?.level ?? 0 }, connection, bond };
  }

  const isOnline = (row: UserRow) =>
    hub.isOnline(row.id) || (row.last_active_at ? Date.now() - Date.parse(row.last_active_at + "Z") < ONLINE_WINDOW_MS : false);

  /** Vibe between two people, hidden when the other person turned it off. */
  function vibeFor(me: UserRow, other: UserRow) {
    const vibe = computeVibe(vibeProfile(me), vibeProfile(other));
    return privacyOf(other).showVibe && privacyOf(me).showVibe ? vibe : { ...vibe, score: null, parts: [] };
  }

  function card(viewer: UserRow, row: UserRow) {
    const { access: a } = access(viewer.id, row);
    const vibe = vibeFor(viewer, row);
    return {
      ...cardFor(row, a, isOnline(row)),
      distanceKm: distanceKm(viewer.city, row.city),
      vibe: { score: vibe.score, reasons: vibe.reasons, sharedInterests: vibe.sharedInterests },
    };
  }

  return { access, bondOf, isOnline, vibeFor, card };
}

export function peopleRoutes(repo: Repo, hub: RoomHub) {
  const r = Router();
  r.use(requireAuth, requireActive(repo));
  const rel = relations(repo, hub);

  const pool = (me: UserRow) => discoverable(repo, me);

  r.get("/", (req: AuthedRequest, res) => {
    const parsed = peopleQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Those filters do not look right" });
      return;
    }
    const f = parsed.data;
    const me = repo.userById(req.userId!)!;
    const settings = settingsOf(me);
    const minAge = f.minAge ?? settings.ageMin;
    const maxAge = f.maxAge ?? settings.ageMax;
    let people = pool(me)
      .filter((u) => {
        const age = ageOf(u);
        if (age !== null && (age < minAge || age > maxAge)) return false;
        if (f.intent && u.intent !== f.intent) return false;
        if (f.gender && u.gender !== f.gender) return false;
        if (f.city && u.city.toLowerCase() !== f.city.toLowerCase()) return false;
        if (f.interests?.length && !f.interests.some((i) => interestsOf(u).includes(i))) return false;
        if (f.q && !u.display_name.toLowerCase().includes(f.q.toLowerCase())) return false;
        if (f.online && !rel.isOnline(u)) return false;
        return true;
      })
      .map((u) => ({ row: u, card: rel.card(me, u) }));
    if (f.minVibe) people = people.filter((p) => (p.card.vibe.score ?? 0) >= f.minVibe!);
    if (f.sort === "vibe") people.sort((a, b) => (b.card.vibe.score ?? -1) - (a.card.vibe.score ?? -1));
    if (f.sort === "active") people.sort((a, b) => (b.row.last_active_at ?? "").localeCompare(a.row.last_active_at ?? ""));
    if (f.sort === "recent") people.sort((a, b) => b.row.created_at.localeCompare(a.row.created_at));
    res.json({ people: people.slice(0, 60).map((p) => p.card), total: people.length, cities: [...new Set(pool(me).map((u) => u.city).filter(Boolean))].sort() });
  });

  /** Top picks from Vibe Match, with the reasons shown on each card. */
  r.get("/suggestions", (req: AuthedRequest, res) => {
    const me = repo.userById(req.userId!)!;
    const cards = pool(me).map((u) => rel.card(me, u)).sort((a, b) => (b.vibe.score ?? -1) - (a.vibe.score ?? -1));
    res.json({ people: cards.slice(0, 8) });
  });

  r.delete("/passes", (req: AuthedRequest, res) => {
    res.json({ cleared: repo.clearPasses(req.userId!) });
  });

  r.get("/:id", (req: AuthedRequest, res) => {
    const me = repo.userById(req.userId!)!;
    const target = repo.userById(Number(req.params.id));
    if (!target || target.role !== "user" || effectiveStatus(target) === "banned" || (target.id !== me.id && repo.isBlocked(me.id, target.id))) {
      res.status(404).json({ error: "This profile is not available" });
      return;
    }
    const { access, connection, bond } = rel.access(me.id, target);
    // Hidden profiles can still be opened by people already connected to them.
    if (!access.self && !access.connected && !privacyOf(target).discoverable) {
      res.status(404).json({ error: "This profile is not available" });
      return;
    }
    const vibe = rel.vibeFor(me, target);
    res.json({
      profile: { ...profileFor(target, access), online: privacyOf(target).showOnline ? rel.isOnline(target) : null },
      vibe,
      bond,
      connection: connection
        ? { id: connection.id, status: connection.status, outgoing: connection.requester_id === me.id, roomCode: connection.room_code, note: connection.note }
        : null,
      suggestions: suggestActivities(
        { interests: interestsOf(me), intent: me.intent },
        { name: target.display_name, interests: interestsOf(target), intent: target.intent },
      ).slice(0, 3),
    });
  });

  r.post("/:id/pass", (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    if (!repo.userById(id) || id === req.userId) {
      res.status(404).json({ error: "Unknown person" });
      return;
    }
    repo.pass(req.userId!, id);
    res.json({ ok: true });
  });

  return r;
}

export function connectionRoutes(repo: Repo, hub: RoomHub) {
  const r = Router();
  r.use(requireAuth, requireActive(repo));
  const rel = relations(repo, hub);

  const openSpace = (conn: ConnectionRow) => openSharedSpace(repo, conn);

  function loadMine(req: AuthedRequest, res: Response) {
    const conn = repo.connectionById(Number(req.params.id));
    if (!conn || (conn.requester_id !== req.userId && conn.addressee_id !== req.userId)) {
      res.status(404).json({ error: "Connection not found" });
      return null;
    }
    return conn;
  }

  r.get("/", (req: AuthedRequest, res) => {
    const me = repo.userById(req.userId!)!;
    const all = repo.connectionsOf(me.id);
    const view = (c: ConnectionRow) => {
      const otherId = c.requester_id === me.id ? c.addressee_id : c.requester_id;
      const other = repo.userById(otherId)!;
      const last = repo.lastMessage(c.room_code);
      return {
        id: c.id,
        status: c.status,
        outgoing: c.requester_id === me.id,
        note: c.note,
        superLike: Boolean(c.super),
        roomCode: c.room_code,
        since: c.accepted_at ?? c.created_at,
        person: rel.card(me, other),
        bond: rel.bondOf(c),
        lastMessage: last ? { mine: last.user_id === me.id, body: last.body, at: last.created_at } : null,
      };
    };
    const live = all.filter((c) => !repo.isBlocked(c.requester_id, c.addressee_id));
    res.json({
      connections: live.filter((c) => c.status === "accepted").map(view),
      incoming: live.filter((c) => c.status === "pending" && c.addressee_id === me.id).map(view),
      outgoing: live.filter((c) => c.status === "pending" && c.requester_id === me.id).map(view),
      levels: BOND_LEVELS,
    });
  });

  r.post("/", (req: AuthedRequest, res) => {
    const parsed = connectSchema.safeParse(req.body);
    const me = repo.userById(req.userId!)!;
    const target = parsed.success ? repo.userById(parsed.data.userId) : undefined;
    if (!parsed.success || !target || target.id === me.id || target.role !== "user" || effectiveStatus(target) !== "active") {
      res.status(400).json({ error: "You cannot connect with this person" });
      return;
    }
    if (repo.isBlocked(me.id, target.id)) {
      res.status(403).json({ error: "You cannot connect with this person" });
      return;
    }
    const existing = repo.connectionBetween(me.id, target.id);
    if (existing?.status === "accepted") {
      res.status(409).json({ error: "You are already connected" });
      return;
    }
    // They already asked you: this is a mutual match, so open the shared space now.
    if (existing?.status === "pending" && existing.requester_id === target.id) {
      const roomCode = openSpace(existing);
      hub.notify(target.id, "connection:accepted", { id: existing.id, name: me.display_name, avatar: avatarOf(me), roomCode, mutual: true });
      res.status(201).json({ status: "accepted", mutual: true, id: existing.id, roomCode });
      return;
    }
    if (existing?.status === "pending") {
      res.status(409).json({ error: "Request already sent" });
      return;
    }
    const id = repo.requestConnection(me.id, target.id, parsed.data.note);
    hub.notify(target.id, "connection:request", { id, name: me.display_name, note: parsed.data.note });
    res.status(201).json({ status: "pending", mutual: false, id });
  });

  r.post("/:id/accept", (req: AuthedRequest, res) => {
    const conn = loadMine(req, res);
    if (!conn) return;
    if (conn.addressee_id !== req.userId || conn.status !== "pending") {
      res.status(400).json({ error: "There is no request to accept" });
      return;
    }
    const roomCode = openSpace(conn);
    const me = repo.userById(req.userId!)!;
    hub.notify(conn.requester_id, "connection:accepted", { id: conn.id, name: me.display_name, avatar: avatarOf(me), roomCode, mutual: false });
    res.json({ status: "accepted", roomCode });
  });

  r.post("/:id/decline", (req: AuthedRequest, res) => {
    const conn = loadMine(req, res);
    if (!conn) return;
    if (conn.addressee_id !== req.userId || conn.status !== "pending") {
      res.status(400).json({ error: "There is no request to decline" });
      return;
    }
    repo.declineConnection(conn.id);
    res.json({ ok: true });
  });

  /** Cancels a request you sent, or removes an existing connection. */
  r.delete("/:id", (req: AuthedRequest, res) => {
    const conn = loadMine(req, res);
    if (!conn) return;
    if (conn.room_code) {
      const room = repo.roomByCode(conn.room_code);
      if (room) {
        repo.setRoomStatus(room.id, "closed");
        hub.roomClosed(room.code);
      }
    }
    repo.removeConnection(conn.id);
    res.json({ ok: true });
  });

  /** Opens an activity in your shared space and invites the other person. */
  r.post("/:id/play", (req: AuthedRequest, res) => {
    const conn = loadMine(req, res);
    if (!conn) return;
    const parsed = playSchema.safeParse(req.body);
    if (conn.status !== "accepted" || !conn.room_code || !parsed.success) {
      res.status(400).json({ error: "Connect first, then pick an activity" });
      return;
    }
    hub.setActivity(conn.room_code, parsed.data.activity);
    const otherId = conn.requester_id === req.userId ? conn.addressee_id : conn.requester_id;
    hub.notify(otherId, "room:invite", { roomCode: conn.room_code, activity: parsed.data.activity, name: repo.userById(req.userId!)!.display_name });
    res.json({ roomCode: conn.room_code });
  });

  return r;
}

export function homeRoutes(repo: Repo, hub: RoomHub) {
  const r = Router();
  r.use(requireAuth, requireActive(repo));
  const rel = relations(repo, hub);

  r.get("/dashboard", (req: AuthedRequest, res) => {
    const me = repo.userById(req.userId!)!;
    const conns = repo.connectionsOf(me.id).filter((c) => !repo.isBlocked(c.requester_id, c.addressee_id));
    const accepted = conns.filter((c) => c.status === "accepted");
    const counts = repo.userCounts(me.id);
    const played = Object.fromEntries(counts.activities.map((a) => [a.activity, a.n]));

    const people = accepted
      .map((c) => {
        const other = repo.userById(c.requester_id === me.id ? c.addressee_id : c.requester_id)!;
        return { connectionId: c.id, roomCode: c.room_code, person: rel.card(me, other), bond: rel.bondOf(c)! };
      })
      .sort((a, b) => b.bond.points - a.bond.points);

    const suggestions = repo
      .discoverPool(me.id)
      .filter((u) => effectiveStatus(u) === "active" && privacyOf(u).discoverable && mutualFit({ gender: me.gender, lookingFor: me.looking_for }, { gender: u.gender, lookingFor: u.looking_for }))
      .map((u) => rel.card(me, u))
      .sort((a, b) => (b.vibe.score ?? -1) - (a.vibe.score ?? -1))
      .slice(0, 4);

    const moments = repo.userMoments(me.id).slice(0, 6).map((m) => {
      const otherId = m.host_id === me.id ? m.guest_id : m.host_id;
      return { id: m.id, activity: m.activity, title: m.title, createdAt: m.created_at, partnerName: otherId ? repo.userById(otherId)?.display_name ?? null : null };
    });

    res.json({
      greetingName: me.display_name,
      completeness: completeness(me),
      stats: {
        connections: accepted.length,
        requests: conns.filter((c) => c.status === "pending" && c.addressee_id === me.id).length,
        moments: counts.moments,
        messages: counts.messages,
        bestStreak: Math.max(0, ...people.map((p) => p.bond.streak)),
        topBond: people[0]?.bond.name ?? null,
      },
      people,
      weekly: repo.weeklyActivity(me.id),
      activityMix: counts.activities,
      moments,
      suggestions: {
        people: suggestions,
        activities: suggestActivities({ interests: interestsOf(me), intent: me.intent }, undefined, played).slice(0, 4),
        question: questionOfTheDay(),
        watch: watchPicks(interestsOf(me), 2),
      },
      levels: BOND_LEVELS,
    });
  });

  /** Ideas for what to do next, alone or with one connection. */
  r.get("/suggestions", (req: AuthedRequest, res) => {
    const me = repo.userById(req.userId!)!;
    const withId = Number(req.query.with ?? 0);
    const partner = withId ? repo.userById(withId) : undefined;
    const usable = partner && rel.access(me.id, partner).access.connected ? partner : undefined;
    const pairInterests = usable ? [...new Set([...interestsOf(me).filter((i) => interestsOf(usable).includes(i)), ...interestsOf(me)])] : interestsOf(me);
    res.json({
      activities: suggestActivities(
        { interests: interestsOf(me), intent: me.intent },
        usable ? { name: usable.display_name, interests: interestsOf(usable), intent: usable.intent } : undefined,
      ),
      watch: watchPicks(pairInterests),
      draw: drawPrompts(pairInterests),
      question: questionOfTheDay(),
    });
  });

  /** Option lists for the profile builder and filters. */
  r.get("/catalog", (_req, res) => {
    res.json({ prompts: PROMPTS, quiz: QUIZ, intents: INTENT_LABELS, levels: BOND_LEVELS });
  });

  return r;
}
