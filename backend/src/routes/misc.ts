import { Router } from "express";
import { clearSessionCookie, looksLikeBot, requireActive, requireAuth, type AuthedRequest } from "../auth.js";
import { selfProfile } from "../people.js";
import { saveProfile } from "../profileStore.js";
import { config } from "../config.js";
import { ICEBREAKERS } from "../content/questions.js";
import { ACTIVITY_IDS } from "../games/index.js";
import type { Repo } from "../repo.js";
import {
  AVATAR_COLORS, AVATAR_SHAPES, INTERESTS, REPORT_REASONS, analyticsSchema, blockSchema,
  contactSchema, fieldErrors, privacySchema, profileSchema, reportSchema, settingsSchema,
} from "../validation.js";

export function profileRoutes(repo: Repo) {
  const r = Router();
  r.use(requireAuth, requireActive(repo));

  r.put("/", (req: AuthedRequest, res) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) });
      return;
    }
    res.json({ user: selfProfile(saveProfile(repo, req.userId!, parsed.data)) });
  });

  r.put("/privacy", (req: AuthedRequest, res) => {
    const parsed = privacySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please choose a setting for every section" });
      return;
    }
    repo.setProfileFields(req.userId!, { privacy: JSON.stringify(parsed.data) });
    res.json({ user: selfProfile(repo.userById(req.userId!)!) });
  });

  r.put("/settings", (req: AuthedRequest, res) => {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) });
      return;
    }
    repo.setProfileFields(req.userId!, { settings: JSON.stringify(parsed.data) });
    res.json({ user: selfProfile(repo.userById(req.userId!)!) });
  });

  /** Everything we hold about you, as one JSON file. */
  r.get("/export", (req: AuthedRequest, res) => {
    const me = req.userId!;
    const row = repo.userById(me)!;
    res.setHeader("Content-Disposition", 'attachment; filename="saathverse-my-data.json"');
    res.json({
      exportedAt: new Date().toISOString(),
      profile: selfProfile(row),
      connections: repo.connectionsOf(me).map((c) => ({ status: c.status, since: c.accepted_at ?? c.created_at, with: repo.userById(c.requester_id === me ? c.addressee_id : c.requester_id)?.display_name })),
      moments: repo.userMoments(me).map((m) => ({ title: m.title, activity: m.activity, createdAt: m.created_at })),
      messagesSent: repo.db.prepare("SELECT body, created_at FROM messages WHERE user_id = ? ORDER BY id").all(me),
      blocked: repo.blockedBy(me).map((b) => b.display_name),
      reportsMade: repo.reportsBy(me),
    });
  });

  r.delete("/", (req: AuthedRequest, res) => {
    if (req.body?.confirm !== "DELETE") {
      res.status(400).json({ error: "Type DELETE to confirm" });
      return;
    }
    repo.deleteUser(req.userId!);
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  r.get("/moments", (req: AuthedRequest, res) => {
    const me = req.userId!;
    const names = new Map<number, string>();
    const nameOf = (id: number | null) => {
      if (!id) return null;
      if (!names.has(id)) names.set(id, repo.userById(id)?.display_name ?? "Someone");
      return names.get(id)!;
    };
    const favorites = repo.favoriteIds(me);
    const moments = repo.userMoments(me).map((m) => ({
      id: m.id,
      activity: m.activity,
      title: m.title,
      data: JSON.parse(m.data),
      createdAt: m.created_at,
      roomCode: m.code,
      partnerName: nameOf(m.host_id === me ? m.guest_id : m.host_id),
      partnerId: m.host_id === me ? m.guest_id : m.host_id,
      favorite: favorites.has(m.id),
    }));
    res.json({ moments });
  });

  r.post("/moments/:id/favorite", (req: AuthedRequest, res) => {
    const id = Number(req.params.id);
    if (!repo.userMoments(req.userId!).some((m) => m.id === id)) {
      res.status(404).json({ error: "Moment not found" });
      return;
    }
    res.json({ favorite: repo.toggleFavorite(req.userId!, id) });
  });

  return r;
}

export function safetyRoutes(repo: Repo) {
  const r = Router();
  r.use(requireAuth, requireActive(repo));

  r.get("/overview", (req: AuthedRequest, res) => {
    res.json({ blocked: repo.blockedBy(req.userId!), reports: repo.reportsBy(req.userId!) });
  });

  r.delete("/block/:id", (req: AuthedRequest, res) => {
    repo.unblock(req.userId!, Number(req.params.id));
    res.json({ ok: true });
  });

  r.post("/block", (req: AuthedRequest, res) => {
    const parsed = blockSchema.safeParse(req.body);
    if (!parsed.success || parsed.data.userId === req.userId || !repo.userById(parsed.data.userId)) {
      res.status(400).json({ error: "Unknown user" });
      return;
    }
    repo.block(req.userId!, parsed.data.userId);
    res.json({ ok: true });
  });

  r.post("/report", (req: AuthedRequest, res) => {
    const parsed = reportSchema.safeParse(req.body);
    if (!parsed.success || parsed.data.userId === req.userId || !repo.userById(parsed.data.userId)) {
      res.status(400).json({ error: "Please choose a reason", fields: parsed.success ? {} : fieldErrors(parsed.error) });
      return;
    }
    // Messages are attached only when the reporter chose to, and only from a conversation they were part of.
    let evidence: unknown[] = [];
    if (parsed.data.includeMessages && parsed.data.roomCode) {
      const room = repo.roomByCode(parsed.data.roomCode);
      if (room && (room.host_id === req.userId || room.guest_id === req.userId)) {
        evidence = repo.recentMessagesBetween(room.code).map((m) => ({ from: m.user_id === req.userId ? "reporter" : "reported", body: m.body, at: m.created_at }));
      }
    }
    repo.report({ reporterId: req.userId!, reportedId: parsed.data.userId, reason: parsed.data.reason, details: parsed.data.details, roomCode: parsed.data.roomCode, evidence });
    // Reporting someone also blocks them, so you never meet again by accident.
    repo.block(req.userId!, parsed.data.userId);
    res.json({ ok: true });
  });

  return r;
}

export function publicRoutes(repo: Repo) {
  const r = Router();

  r.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  r.get("/meta", (_req, res) => {
    res.json({ interests: INTERESTS, avatarShapes: AVATAR_SHAPES, avatarColors: AVATAR_COLORS, activities: ACTIVITY_IDS, reportReasons: REPORT_REASONS, icebreakers: ICEBREAKERS, demoLogin: config.demoLogin });
  });

  r.post("/contact", (req, res) => {
    if (looksLikeBot(req.body ?? {})) {
      res.status(400).json({ error: "We could not verify this message. Please try again." });
      return;
    }
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) });
      return;
    }
    repo.addContact(parsed.data);
    res.status(201).json({ ok: true });
  });

  r.post("/analytics", (req, res) => {
    const parsed = analyticsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Bad event" });
      return;
    }
    repo.addEvent(parsed.data.name, parsed.data.path);
    res.status(204).end();
  });

  r.get("/analytics/summary", (req, res) => {
    if (!config.adminToken || req.get("x-admin-token") !== config.adminToken) {
      res.status(401).json({ error: "Admin token required" });
      return;
    }
    res.json({ events: repo.eventSummary() });
  });

  return r;
}
