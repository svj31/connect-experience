import bcrypt from "bcryptjs";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

export interface AuthedRequest extends Request {
  userId?: number;
}

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const checkPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

// Used when an email is unknown, so login takes the same time either way.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);
export const dummyCheck = (password: string) => bcrypt.compare(password, DUMMY_HASH);

export function signSession(userId: number): string {
  return jwt.sign({ sub: String(userId), kind: "session" }, config.jwtSecret, { expiresIn: `${config.sessionDays}d` });
}

/** Short lived token the browser hands to Socket.IO, since the session cookie is httpOnly. */
export function signSocketTicket(userId: number): string {
  return jwt.sign({ sub: String(userId), kind: "socket" }, config.jwtSecret, { expiresIn: "2m" });
}

export function verifyToken(token: string, kind: "session" | "socket"): number | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    if (payload.kind !== kind) return null;
    const id = Number(payload.sub);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, userId: number) {
  res.cookie(config.sessionCookie, signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProd,
    maxAge: config.sessionDays * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(config.sessionCookie, { path: "/" });
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[config.sessionCookie];
  const userId = typeof token === "string" ? verifyToken(token, "session") : null;
  if (!userId) {
    res.status(401).json({ error: "Please sign in" });
    return;
  }
  req.userId = userId;
  next();
}

/** Rejects forms filled faster than a person could, or with the hidden honeypot field set. */
export function looksLikeBot(body: { website?: string; startedAt?: number }, now = Date.now()): boolean {
  if (body.website) return true;
  if (typeof body.startedAt !== "number") return true;
  const elapsed = now - body.startedAt;
  return elapsed < config.minFormFillMs || elapsed > 24 * 60 * 60 * 1000;
}
