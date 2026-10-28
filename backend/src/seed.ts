import { config } from "./config.js";
import { openDb } from "./db.js";
import { DEMO, demoEmail, seedDemo } from "./demo.js";
import { createRepo } from "./repo.js";

const db = openDb(config.databasePath);
await seedDemo(createRepo(db));
console.log(`Seeded ${DEMO.people.length} demo people and one admin. Password for all: ${DEMO.password}`);
console.log(`  user:  ${demoEmail("ava")}`);
console.log(`  admin: ${demoEmail(DEMO.admin.key)}`);
db.close();
