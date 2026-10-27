import { createServer } from "node:http";
import { createApp } from "./app.js";
import type { DB } from "./db.js";
import { createRealtime } from "./realtime.js";
import { createRepo } from "./repo.js";

/** Wires HTTP, Socket.IO and the database together. Used by the entry point and by tests. */
export function buildServer(db: DB, options: { rateLimits?: boolean } = {}) {
  const repo = createRepo(db);
  const httpServer = createServer();
  const realtime = createRealtime(httpServer, repo);
  const app = createApp({ repo, hub: realtime.hub, rateLimits: options.rateLimits });
  httpServer.on("request", app);
  return { app, httpServer, repo, realtime };
}
