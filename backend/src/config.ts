import { existsSync } from "node:fs";

if (existsSync(".env") && process.env.NODE_ENV !== "test") {
  process.loadEnvFile(".env");
}

const isProd = process.env.NODE_ENV === "production";

function secret(): string {
  const value = process.env.JWT_SECRET;
  if (value && value.length >= 32) return value;
  if (isProd) {
    throw new Error("JWT_SECRET must be set to at least 32 characters in production");
  }
  return "dev-only-secret-not-for-production-use-0123456789";
}

export const config = {
  isProd,
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: secret(),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  databasePath: process.env.DATABASE_PATH ?? "./data/saathverse.db",
  adminToken: process.env.ADMIN_TOKEN ?? "",
  /**
   * Needed to create an admin account from the sign up page. In production it must be
   * set explicitly, otherwise admin sign up is switched off.
   */
  adminInviteCode: process.env.ADMIN_INVITE_CODE ?? (isProd ? "" : "SAATH-ADMIN-2026"),
  /** One click demo sign in for judges and demos. Set DEMO_LOGIN=off to remove it. */
  demoLogin: process.env.DEMO_LOGIN !== "off",
  /** Fill an empty database with demo people on start. Set SEED_DEMO=off to skip. */
  seedDemo: process.env.SEED_DEMO !== "off",
  /** Set RATE_LIMITS=off only for local end to end test runs. Ignored in production. */
  rateLimits: isProd || process.env.RATE_LIMITS !== "off",
  sessionCookie: "sv_session",
  sessionDays: 14,
  /** Forms submitted faster than this are treated as bots. */
  minFormFillMs: 1500,
};
