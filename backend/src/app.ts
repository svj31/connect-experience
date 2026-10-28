import { togetherRoutes } from "./routes/together.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config.js";
import type { Repo } from "./repo.js";
import { adminRoutes } from "./routes/admin.js";
import { authRoutes } from "./routes/auth.js";
import { profileRoutes, publicRoutes, safetyRoutes } from "./routes/misc.js";
import { connectionRoutes, homeRoutes, peopleRoutes } from "./routes/people.js";
import { roomRoutes, type RoomHub } from "./routes/rooms.js";
import { swipeRoutes } from "./routes/swipes.js";

export interface AppOptions {
  repo: Repo;
  hub: RoomHub;
  /** Turn off in tests that fire many requests from one address. */
  rateLimits?: boolean;
}

export function createApp({ repo, hub, rateLimits = true }: AppOptions) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: config.webOrigin, credentials: true }));
  // Profiles can carry a few resized photos; everything else stays small.
  app.use("/api/profile", express.json({ limit: "3mb" }));
  app.use(express.json({ limit: "64kb" }));
  app.use(cookieParser());

  // HTTPS is enforced by the web app's proxy, which receives the public request.
  // This server only sees the internal hop from Next.js, so it must not redirect.

  const limiter = (windowMs: number, limit: number) =>
    rateLimits
      ? rateLimit({ windowMs, limit, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many requests. Please wait a moment." } })
      : (_req: Request, _res: Response, next: NextFunction) => next();

  app.use("/api/auth/signup", limiter(15 * 60_000, 10));
  app.use("/api/auth/login", limiter(15 * 60_000, 20));
  app.use("/api/auth/admin-signup", limiter(15 * 60_000, 5));
  app.use("/api/contact", limiter(60 * 60_000, 5));
  app.use("/api/analytics", limiter(60_000, 120));
  app.use("/api/discover/swipes", limiter(60_000, 120));
  app.use("/api", limiter(60_000, 600));

  app.use("/api/auth", authRoutes(repo));
  app.use("/api/rooms", roomRoutes(repo, hub));
  app.use("/api/profile", profileRoutes(repo));
  app.use("/api/safety", safetyRoutes(repo));
  app.use("/api/people", peopleRoutes(repo, hub));
  app.use("/api/connections", connectionRoutes(repo, hub));
  app.use("/api/admin", adminRoutes(repo, hub));
  app.use("/api/me", homeRoutes(repo, hub));
  app.use("/api/discover", swipeRoutes(repo, hub));
  app.use("/api/together", togetherRoutes(repo, hub));
  app.use("/api", publicRoutes(repo));

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    if (err.type === "entity.parse.failed") {
      res.status(400).json({ error: "Malformed JSON" });
      return;
    }
    if (err.type === "entity.too.large") {
      res.status(413).json({ error: "Request too large" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong on our side" });
  });

  return app;
}
