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
  databasePath: process.env.DATABASE_PATH ?? "./data/overlap.db",
  adminToken: process.env.ADMIN_TOKEN ?? "",
  /** Set RATE_LIMITS=off only for local end to end test runs. Ignored in production. */
  rateLimits: isProd || process.env.RATE_LIMITS !== "off",
  sessionCookie: "ovl_session",
  sessionDays: 14,
  /** Forms submitted faster than this are treated as bots. */
  minFormFillMs: 1500,
};
