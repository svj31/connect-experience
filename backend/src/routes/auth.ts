import { Router } from "express";
import {
  checkPassword, clearSessionCookie, dummyCheck, hashPassword, looksLikeBot, requireAuth,
  setSessionCookie, signSocketTicket, verifyToken, type AuthedRequest,
} from "../auth.js";
import { config } from "../config.js";
import { DEMO, DEMO_PERSONAS, demoEmail } from "../demo.js";
import { effectiveStatus, selfProfile } from "../people.js";
import type { Repo } from "../repo.js";
import { adminSignupSchema, fieldErrors, loginSchema, signupSchema } from "../validation.js";

const STATUS_MESSAGE = {
  suspended: "This account is paused for now. Please try again later or contact us.",
  banned: "This account has been removed for breaking the community rules.",
};

export function authRoutes(repo: Repo) {
  const r = Router();

  r.post("/signup", async (req, res) => {
    if (looksLikeBot(req.body ?? {})) {
      res.status(400).json({ error: "We could not verify this sign up. Please try again." });
      return;
    }
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) });
      return;
    }
    const { email, password, displayName } = parsed.data;
    if (repo.userByEmail(email)) {
      res.status(409).json({ error: "An account with this email already exists", fields: { email: "Already registered. Try signing in." } });
      return;
    }
    const user = repo.createUser({ email, passwordHash: await hashPassword(password), displayName });
    setSessionCookie(res, user.id);
    res.status(201).json({ user: selfProfile(user) });
  });

  r.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Enter your email and password", fields: fieldErrors(parsed.error) });
      return;
    }
    const user = repo.userByEmail(parsed.data.email);
    const ok = user ? await checkPassword(parsed.data.password, user.password_hash) : await dummyCheck(parsed.data.password);
    if (!user || !ok) {
      res.status(401).json({ error: "Email or password is incorrect" });
      return;
    }
    const status = effectiveStatus(user);
    if (status !== "active") {
      res.status(403).json({ error: STATUS_MESSAGE[status] });
      return;
    }
    setSessionCookie(res, user.id);
    res.json({ user: selfProfile(user) });
  });

  /** Admin accounts need the invite code the team shares privately. */
  r.post("/admin-signup", async (req, res) => {
    if (looksLikeBot(req.body ?? {})) {
      res.status(400).json({ error: "We could not verify this sign up. Please try again." });
      return;
    }
    const parsed = adminSignupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) });
      return;
    }
    if (!config.adminInviteCode || parsed.data.inviteCode !== config.adminInviteCode) {
      res.status(403).json({ error: "That invite code is not valid", fields: { inviteCode: "Ask your team lead for the current code" } });
      return;
    }
    if (repo.userByEmail(parsed.data.email)) {
      res.status(409).json({ error: "An account with this email already exists", fields: { email: "Already registered" } });
      return;
    }
    const user = repo.createUser({ email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password), displayName: parsed.data.displayName, role: "admin" });
    setSessionCookie(res, user.id);
    res.status(201).json({ user: selfProfile(user) });
  });

  /** One click sign in to a seeded demo account, for judges and live demos. */
  r.post("/demo", (req, res) => {
    const as = req.body?.as === "admin" ? "admin" : "user";
    // Members can pick any core demo persona; anything else falls back to Ava.
    const key = typeof req.body?.key === "string" && DEMO_PERSONAS.some((p) => p.key === req.body.key) ? req.body.key : "ava";
    const user = config.demoLogin ? repo.userByEmail(demoEmail(as === "admin" ? DEMO.admin.key : key)) : undefined;
    if (!user) {
      res.status(404).json({ error: "Demo accounts are not available here. Run npm run seed first." });
      return;
    }
    setSessionCookie(res, user.id);
    res.json({ user: selfProfile(user) });
  });

  r.get("/demo", (_req, res) => {
    res.json({
      enabled: config.demoLogin,
      password: config.demoLogin ? DEMO.password : null,
      user: demoEmail("ava"),
      admin: demoEmail(DEMO.admin.key),
      personas: config.demoLogin ? DEMO_PERSONAS.map((p) => ({ ...p, email: demoEmail(p.key) })) : [],
    });
  });

  r.post("/logout", (_req, res) => {
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  // Signed out is a normal state for this endpoint, so it answers 200 with user: null.
  r.get("/me", (req, res) => {
    const token = req.cookies?.[config.sessionCookie];
    const userId = typeof token === "string" ? verifyToken(token, "session") : null;
    const user = userId ? repo.userById(userId) : undefined;
    if (!user) {
      if (token) clearSessionCookie(res);
      res.json({ user: null });
      return;
    }
    res.json({ user: selfProfile(user) });
  });

  r.post("/socket-ticket", requireAuth, (req: AuthedRequest, res) => {
    res.json({ ticket: signSocketTicket(req.userId!) });
  });

  return r;
}
