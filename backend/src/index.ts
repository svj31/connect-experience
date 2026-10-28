import { config } from "./config.js";
import { openDb } from "./db.js";
import { seedDemo } from "./demo.js";
import { buildServer } from "./server.js";

const db = openDb(config.databasePath);
const { httpServer, repo } = buildServer(db, { rateLimits: config.rateLimits });

// A fresh install gets demo people so every screen has something to show.
if (config.seedDemo && repo.countUsers() === 0) {
  await seedDemo(repo);
  console.log("Empty database: added demo people. Run with SEED_DEMO=off to skip this.");
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
