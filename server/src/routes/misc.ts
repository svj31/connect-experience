import { Router } from "express";
import { clearSessionCookie, looksLikeBot, requireAuth, type AuthedRequest } from "../auth.js";
import { config } from "../config.js";
import { ICEBREAKERS } from "../content/questions.js";
import { ACTIVITY_IDS } from "../games/index.js";
import { selfUser, type Repo } from "../repo.js";
import {
  AVATAR_COLORS, AVATAR_SHAPES, INTERESTS, REPORT_REASONS, analyticsSchema, blockSchema,
  contactSchema, fieldErrors, profileSchema, reportSchema,
} from "../validation.js";

export function profileRoutes(repo: Repo) {
  const r = Router();
  r.use(requireAuth);

  r.put("/", (req: AuthedRequest, res) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) });
      return;
    }
    res.json({ user: selfUser(repo.updateProfile(req.userId!, parsed.data)) });
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
    const moments = repo.userMoments(me).map((m) => ({
      id: m.id,
      activity: m.activity,
      title: m.title,
      data: JSON.parse(m.data),
      createdAt: m.created_at,
      roomCode: m.code,
      partnerName: nameOf(m.host_id === me ? m.guest_id : m.host_id),
    }));
    res.json({ moments });
  });

  return r;
}

export function safetyRoutes(repo: Repo) {
  const r = Router();
  r.use(requireAuth);

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
    repo.report({ reporterId: req.userId!, reportedId: parsed.data.userId, reason: parsed.data.reason, details: parsed.data.details, roomCode: parsed.data.roomCode });
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
    res.json({ interests: INTERESTS, avatarShapes: AVATAR_SHAPES, avatarColors: AVATAR_COLORS, activities: ACTIVITY_IDS, reportReasons: REPORT_REASONS, icebreakers: ICEBREAKERS });
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
