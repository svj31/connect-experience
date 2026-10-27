import { hashPassword } from "./auth.js";
import { config } from "./config.js";
import { openDb } from "./db.js";
import { createRepo } from "./repo.js";

/**
 * Creates demo accounts and a few open tables so a fresh install has something to join.
 * Every seeded account uses the password below and an @demo.overlap.local address.
 */
const PASSWORD = "overlap123";

const PEOPLE = [
  { email: "ava@demo.overlap.local", name: "Ava", pronouns: "she/her", shape: "circle", color: "coral", interests: ["music", "travel", "food", "films"], bio: "Collects train tickets and bad puns.", handle: "@ava.demo", table: { title: "Two truths over coffee", activity: "ttl", topic: "food" } },
  { email: "rohan@demo.overlap.local", name: "Rohan", pronouns: "he/him", shape: "triangle", color: "teal", interests: ["gaming", "science", "music", "outdoors"], bio: "Weekend hiker, weekday debugger.", handle: "@rohan.demo", table: { title: "Connect Four, best of three", activity: "connect4", topic: "gaming" } },
  { email: "mira@demo.overlap.local", name: "Mira", pronouns: "they/them", shape: "star", color: "sun", interests: ["art", "books", "writing", "photography"], bio: "Draws on receipts. Reads on buses.", handle: "@mira.demo", table: { title: "Doodle something with me", activity: "draw", topic: "art" } },
  { email: "kabir@demo.overlap.local", name: "Kabir", pronouns: "he/him", shape: "hexagon", color: "leaf", interests: ["films", "comedy", "food", "tech"], bio: "Will rate any biryani out of ten.", handle: "@kabir.demo", table: { title: "Name a constellation", activity: "constellation", topic: "science" } },
];

const db = openDb(config.databasePath);
const repo = createRepo(db);
const hash = await hashPassword(PASSWORD);

for (const p of PEOPLE) {
  let user = repo.userByEmail(p.email);
  if (!user) user = repo.createUser({ email: p.email, passwordHash: hash, displayName: p.name });
  repo.updateProfile(user.id, { displayName: p.name, pronouns: p.pronouns, bio: p.bio, handle: p.handle, interests: p.interests, avatarShape: p.shape, avatarColor: p.color });
  const hasOpen = repo.myRooms(user.id).some((r) => r.status === "open");
  if (!hasOpen) repo.createRoom({ ...p.table, isPublic: true, hostId: user.id });
}

console.log(`Seeded ${PEOPLE.length} demo accounts. Password for all: ${PASSWORD}`);
for (const p of PEOPLE) console.log(`  ${p.email}`);
db.close();
