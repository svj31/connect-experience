import { config } from "./config.js";
import { openDb } from "./db.js";
import { seedDemo } from "./demo.js";
import { buildServer } from "./server.js";

const db = openDb(config.databasePath);
const { httpServer, repo } = buildServer(db, { rateLimits: config.rateLimits });

// Demo people are kept in sync with demo_data on every start (new members, photos, profiles), so an
// older database picks up changes too. History is only added the first time. SEED_DEMO=off skips it.
if (config.seedDemo) {
  const fresh = repo.countUsers() === 0;
  await seedDemo(repo);
  console.log(fresh ? "Empty database: added demo people." : "Demo people synced with demo_data.", "Run with SEED_DEMO=off to skip this.");
}

httpServer.listen(config.port, () => {
  console.log(`SaathVerse API listening on http://localhost:${config.port}`);
});

function shutdown() {
  httpServer.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
