import { Router } from "express";
import {
  checkPassword, clearSessionCookie, dummyCheck, hashPassword, looksLikeBot, requireAuth,
  setSessionCookie, signSocketTicket, verifyToken, type AuthedRequest,
} from "../auth.js";
import { config } from "../config.js";
import { selfUser, type Repo } from "../repo.js";
import { fieldErrors, loginSchema, signupSchema } from "../validation.js";

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
    res.status(201).json({ user: selfUser(user) });
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
    setSessionCookie(res, user.id);
    res.json({ user: selfUser(user) });
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
    res.json({ user: selfUser(user) });
  });

  r.post("/socket-ticket", requireAuth, (req: AuthedRequest, res) => {
    res.json({ ticket: signSocketTicket(req.userId!) });
  });

  return r;
}
