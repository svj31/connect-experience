import { readFileSync } from "node:fs";
import { hashPassword } from "./auth.js";
import { saveProfile } from "./profileStore.js";
import type { Repo } from "./repo.js";
import { profileSchema } from "./validation.js";

interface DemoFile {
  password: string;
  domain: string;
  admin: { key: string; displayName: string };
  people: (Record<string, unknown> & { key: string; displayName: string; crowd?: boolean })[];
}

export const DEMO = JSON.parse(readFileSync(new URL("../../demo_data/people.json", import.meta.url), "utf8")) as DemoFile;
export const demoEmail = (key: string) => `${key}@${DEMO.domain}`;

/**
 * Fills the database with demo people, connections and history so every screen has
 * something real to show. Safe to run again: existing demo accounts are updated, and
 * history is only added the first time.
 */
export async function seedDemo(repo: Repo) {
  const hash = await hashPassword(DEMO.password);
  const ids: Record<string, number> = {};

  const admin = repo.userByEmail(demoEmail(DEMO.admin.key)) ?? repo.createUser({ email: demoEmail(DEMO.admin.key), passwordHash: hash, displayName: DEMO.admin.displayName, role: "admin" });
  ids.admin = admin.id;

  // History belongs to the core cast; it is added once, on the first run only. Crowd members
  // (added later to make Discover feel busy) can join an existing database safely.
  const fresh = !repo.userByEmail(demoEmail(DEMO.people[0].key));
  for (const [i, person] of DEMO.people.entries()) {
    const user = repo.userByEmail(demoEmail(person.key)) ?? repo.createUser({ email: demoEmail(person.key), passwordHash: hash, displayName: person.displayName });
    const parsed = profileSchema.parse(person);
    saveProfile(repo, user.id, parsed);
    repo.touch(user.id);
    // Spread crowd activity over the last two days, so not everyone is "active now".
    if (person.crowd) repo.db.prepare(`UPDATE users SET last_active_at = datetime('now', '-${(i * 7) % 48} hours') WHERE id = ?`).run(user.id);
    ids[person.key] = user.id;
  }
  if (!fresh) return ids;

  const db = repo.db;
  const ago = (days: number, hours = 0) => `datetime('now', '-${days} days', '-${hours} hours')`;

  /** A connection with history: messages and moments spread over past days. */
  function connect(a: string, b: string, history: { days: number; from: string; text: string }[], moments: { days: number; activity: string; title: string; data: object }[]) {
    const room = repo.createRoom({ title: `${a} and ${b}`, topic: "", activity: "deeptalk", isPublic: false, hostId: ids[a], guestId: ids[b], kind: "connection" });
    const id = repo.requestConnection(ids[a], ids[b], "");
    repo.acceptConnection(id, room.code);
    db.prepare(`UPDATE connections SET created_at = ${ago(history[0]?.days ?? 1, 2)}, accepted_at = ${ago(history[0]?.days ?? 1, 1)} WHERE id = ?`).run(id);
    for (const m of history) {
      db.prepare(`INSERT INTO messages (room_id, user_id, body, created_at) VALUES (?, ?, ?, ${ago(m.days, Math.floor(Math.random() * 5))})`).run(room.id, ids[m.from], m.text);
    }
    for (const m of moments) {
      db.prepare(`INSERT INTO moments (room_id, activity, title, data, created_at) VALUES (?, ?, ?, ?, ${ago(m.days)})`).run(room.id, m.activity, m.title, JSON.stringify(m.data));
    }
    return room;
  }

  connect("ava", "rohan", [
    { days: 6, from: "rohan", text: "Your Would You Rather picks were chaotic. I respect it." },
    { days: 6, from: "ava", text: "A mountain cabin over a new city is a crime and you know it" },
    { days: 5, from: "rohan", text: "Rematch at Connect Four tonight?" },
    { days: 4, from: "ava", text: "Only if loser picks the next song" },
    { days: 3, from: "rohan", text: "Okay that constellation name was genius" },
    { days: 2, from: "ava", text: "Chai or coffee this weekend?" },
    { days: 1, from: "rohan", text: "Chai. Obviously. Bandra at 5?" },
    { days: 0, from: "ava", text: "Deal. Bring your worst pun." },
  ], [
    { days: 6, activity: "wyr", title: "Would You Rather: agreed on 4 of 5", data: { agreed: 4, total: 5 } },
    { days: 5, activity: "connect4", title: "Connect Four: Ava won", data: { winner: "Ava" } },
    { days: 3, activity: "constellation", title: "The Midnight Chai", data: { name: "The Midnight Chai", stars: [{ x: 0.3, y: 0.4, z: 0.85, uid: ids.ava }, { x: -0.2, y: 0.5, z: 0.84, uid: ids.rohan }, { x: 0.1, y: 0.1, z: 0.99, uid: ids.ava }, { x: -0.4, y: -0.2, z: 0.89, uid: ids.rohan }] } },
    { days: 2, activity: "story", title: "A story you wrote together", data: { opener: "The train stopped in a town that was not on any map.", lines: [{ uid: ids.ava, text: "Everyone on the platform was holding a single orange." }, { uid: ids.rohan, text: "We took one each, because it felt rude not to." }, { uid: ids.ava, text: "Inside mine was a ticket home, dated tomorrow." }] } },
    { days: 1, activity: "deeptalk", title: "Deep Talk: 6 questions, answered honestly", data: { cards: [] } },
  ]);

  connect("ava", "mira", [
    { days: 2, from: "mira", text: "Your drawing of the cafe had a cat in the window. Was that on purpose?" },
    { days: 1, from: "ava", text: "There is always a cat in the window" },
  ], [
    { days: 2, activity: "draw", title: "A drawing made together", data: { strokes: [] } },
  ]);

  connect("rohan", "ishita", [{ days: 1, from: "ishita", text: "Co-op game this weekend?" }], []);

  // Requests waiting for a reply, in both directions.
  repo.requestConnection(ids.kabir, ids.ava, "Your biryani opinions are wrong and I would like to discuss");
  repo.requestConnection(ids.arjun, ids.ava, "Saw you love travel too. Train or plane?");
  repo.requestConnection(ids.ava, ids.zoya, "");

  // Open tables for the Together hub.
  repo.createRoom({ title: "Two truths over coffee", topic: "coffee", activity: "ttl", isPublic: true, hostId: ids.neel });
  repo.createRoom({ title: "Doodle something with me", topic: "art", activity: "draw", isPublic: true, hostId: ids.sara, locked: true });
  repo.createRoom({ title: "Connect Four, best of three", topic: "gaming", activity: "connect4", isPublic: true, hostId: ids.aditya, locked: true });
  repo.createRoom({ title: "Late night deep talk", topic: "books", activity: "deeptalk", isPublic: true, hostId: ids.naina });

  // A few reports so the moderation queue has something to review.
  const r1 = repo.report({ reporterId: ids.mira, reportedId: ids.dev, reason: "harassment", details: "Kept messaging after I said I was not interested." });
  repo.report({ reporterId: ids.ishita, reportedId: ids.dev, reason: "inappropriate", details: "Rude comments in chat." });
  repo.report({ reporterId: ids.naina, reportedId: ids.aditya, reason: "spam", details: "Sent the same link three times." });
  repo.setReportStatus(r1, "reviewing", "Second report about the same person. Looking at both.");
  repo.logAdmin({ adminId: ids.admin, action: "review", targetUserId: ids.dev, reportId: r1, note: "Started review" });

  // Spread sign up dates so the admin chart has a shape.
  DEMO.people.forEach((p, i) => db.prepare(`UPDATE users SET created_at = ${ago(13 - (i % 13), i)} WHERE id = ?`).run(ids[p.key]));
  return ids;
}
