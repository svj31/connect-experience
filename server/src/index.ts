import { config } from "./config.js";
import { openDb } from "./db.js";
import { buildServer } from "./server.js";

const db = openDb(config.databasePath);
const { httpServer } = buildServer(db, { rateLimits: config.rateLimits });

httpServer.listen(config.port, () => {
  console.log(`Overlap API listening on http://localhost:${config.port}`);
});

function shutdown() {
  httpServer.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
