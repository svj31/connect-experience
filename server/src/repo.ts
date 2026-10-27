import { randomInt } from "node:crypto";
import type { DB } from "./db.js";

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  display_name: string;
  pronouns: string;
  bio: string;
  handle: string;
  interests: string;
  avatar_shape: string;
  avatar_color: string;
  created_at: string;
}

export interface RoomRow {
  id: number;
  code: string;
  title: string;
  topic: string;
  activity: string;
  is_public: number;
  host_id: number;
  guest_id: number | null;
  status: "open" | "paired" | "closed";
  created_at: string;
}

export interface PublicUser {
  id: number;
  displayName: string;
  pronouns: string;
  interests: string[];
  avatarShape: string;
  avatarColor: string;
}

/** Moments needed before each reveal level can be chosen. */
export const REVEAL_THRESHOLDS = [0, 1, 3] as const;

export function publicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    displayName: row.display_name,
    pronouns: row.pronouns,
    interests: JSON.parse(row.interests) as string[],
    avatarShape: row.avatar_shape,
    avatarColor: row.avatar_color,
  };
}

export function selfUser(row: UserRow) {
  return { ...publicUser(row), email: row.email, bio: row.bio, handle: row.handle, createdAt: row.created_at };
}

/** What a partner can see, given the reveal level the owner chose. */
export function revealedUser(row: UserRow, level: number) {
  return {
    ...publicUser(row),
    revealLevel: level,
    bio: level >= 1 ? row.bio : null,
    handle: level >= 2 ? row.handle : null,
  };
}

const SHAPES = ["circle", "square", "triangle", "diamond", "hexagon", "star"];
const COLORS = ["coral", "teal", "sun", "leaf", "sky", "ink"];

/** Walks shapes and colors at different rates so neighbouring accounts differ in both. */
export function defaultAvatar(id: number): [string, string] {
  return [SHAPES[id % SHAPES.length], COLORS[(id * 5 + 1) % COLORS.length]];
}

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function makeRoomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

export function createRepo(db: DB) {
  const q = {
    userById: db.prepare<[number], UserRow>("SELECT * FROM users WHERE id = ?"),
    userByEmail: db.prepare<[string], UserRow>("SELECT * FROM users WHERE email = ?"),
    roomByCode: db.prepare<[string], RoomRow>("SELECT * FROM rooms WHERE code = ?"),
    isBlocked: db.prepare<[number, number, number, number], { n: number }>(
      "SELECT COUNT(*) AS n FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)",
    ),
    momentCount: db.prepare<[number], { n: number }>("SELECT COUNT(*) AS n FROM moments WHERE room_id = ?"),
    revealLevel: db.prepare<[number, number], { level: number }>("SELECT level FROM reveals WHERE room_id = ? AND user_id = ?"),
  };

  return {
    db,
    userById: (id: number) => q.userById.get(id),
    userByEmail: (email: string) => q.userByEmail.get(email),

    createUser(input: { email: string; passwordHash: string; displayName: string }) {
      const info = db
        .prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)")
        .run(input.email, input.passwordHash, input.displayName);
      const id = Number(info.lastInsertRowid);
      // Start everyone on a different shape and color. People change it on the profile page.
      const [shape, color] = defaultAvatar(id);
      db.prepare("UPDATE users SET avatar_shape = ?, avatar_color = ? WHERE id = ?").run(shape, color, id);
      return q.userById.get(id)!;
    },

    updateProfile(id: number, p: { displayName: string; pronouns: string; bio: string; handle: string; interests: string[]; avatarShape: string; avatarColor: string }) {
      db.prepare(
        `UPDATE users SET display_name = ?, pronouns = ?, bio = ?, handle = ?, interests = ?, avatar_shape = ?, avatar_color = ? WHERE id = ?`,
      ).run(p.displayName, p.pronouns, p.bio, p.handle, JSON.stringify(p.interests), p.avatarShape, p.avatarColor, id);
      return q.userById.get(id)!;
    },

    /** Removes the account. Rooms they host, their messages, answers and reveals cascade with it. */
    deleteUser(id: number) {
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
    },

    roomByCode: (code: string) => q.roomByCode.get(code.toUpperCase()),

    createRoom(input: { title: string; topic: string; activity: string; isPublic: boolean; hostId: number; guestId?: number }) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = makeRoomCode();
        if (q.roomByCode.get(code)) continue;
        db.prepare(
          "INSERT INTO rooms (code, title, topic, activity, is_public, host_id, guest_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        ).run(code, input.title, input.topic, input.activity, input.isPublic ? 1 : 0, input.hostId, input.guestId ?? null, input.guestId ? "paired" : "open");
        return q.roomByCode.get(code)!;
      }
      throw new Error("Could not allocate a room code");
    },

    seatGuest(roomId: number, guestId: number) {
      db.prepare("UPDATE rooms SET guest_id = ?, status = 'paired' WHERE id = ? AND guest_id IS NULL").run(guestId, roomId);
    },

    setRoomStatus(roomId: number, status: RoomRow["status"], clearGuest = false) {
      db.prepare(`UPDATE rooms SET status = ?${clearGuest ? ", guest_id = NULL" : ""} WHERE id = ?`).run(status, roomId);
    },

    setRoomActivity(roomId: number, activity: string) {
      db.prepare("UPDATE rooms SET activity = ? WHERE id = ?").run(activity, roomId);
    },

    openRooms(viewerId: number) {
      return db
        .prepare<[number, number, number], RoomRow & { host_name: string; host_shape: string; host_color: string; host_interests: string }>(
          `SELECT r.*, u.display_name AS host_name, u.avatar_shape AS host_shape, u.avatar_color AS host_color, u.interests AS host_interests
           FROM rooms r JOIN users u ON u.id = r.host_id
           WHERE r.status = 'open' AND r.is_public = 1 AND r.guest_id IS NULL AND r.host_id != ?
             AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id = ? AND b.blocked_id = r.host_id) OR (b.blocker_id = r.host_id AND b.blocked_id = ?))
           ORDER BY r.id DESC LIMIT 50`,
        )
        .all(viewerId, viewerId, viewerId);
    },

    myRooms(userId: number) {
      return db
        .prepare<[number, number], RoomRow>(
          "SELECT * FROM rooms WHERE (host_id = ? OR guest_id = ?) AND status != 'closed' ORDER BY id DESC LIMIT 30",
        )
        .all(userId, userId);
    },

    isBlocked: (a: number, b: number) => q.isBlocked.get(a, b, b, a)!.n > 0,

    block(blocker: number, blocked: number) {
      db.prepare("INSERT OR IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)").run(blocker, blocked);
    },

    report(input: { reporterId: number; reportedId: number; reason: string; details: string; roomCode?: string }) {
      db.prepare("INSERT INTO reports (reporter_id, reported_id, room_code, reason, details) VALUES (?, ?, ?, ?, ?)").run(
        input.reporterId, input.reportedId, input.roomCode ?? null, input.reason, input.details,
      );
    },

    addMessage(roomId: number, userId: number, body: string) {
      const info = db.prepare("INSERT INTO messages (room_id, user_id, body) VALUES (?, ?, ?)").run(roomId, userId, body);
      return db
        .prepare<[number], { id: number; user_id: number; body: string; created_at: string }>("SELECT id, user_id, body, created_at FROM messages WHERE id = ?")
        .get(Number(info.lastInsertRowid))!;
    },

    messages(roomId: number, limit = 100) {
      return db
        .prepare<[number, number], { id: number; user_id: number; body: string; created_at: string }>(
          "SELECT * FROM (SELECT id, user_id, body, created_at FROM messages WHERE room_id = ? ORDER BY id DESC LIMIT ?) ORDER BY id ASC",
        )
        .all(roomId, limit);
    },

    addMoment(roomId: number, activity: string, title: string, data: unknown) {
      const info = db.prepare("INSERT INTO moments (room_id, activity, title, data) VALUES (?, ?, ?, ?)").run(roomId, activity, title, JSON.stringify(data));
      return Number(info.lastInsertRowid);
    },

    momentCount: (roomId: number) => q.momentCount.get(roomId)!.n,

    roomMoments(roomId: number) {
      return db
        .prepare<[number], { id: number; activity: string; title: string; data: string; created_at: string }>(
          "SELECT id, activity, title, data, created_at FROM moments WHERE room_id = ? ORDER BY id DESC",
        )
        .all(roomId);
    },

    userMoments(userId: number) {
      return db
        .prepare<[number, number], { id: number; activity: string; title: string; data: string; created_at: string; code: string; host_id: number; guest_id: number | null }>(
          `SELECT m.id, m.activity, m.title, m.data, m.created_at, r.code, r.host_id, r.guest_id
           FROM moments m JOIN rooms r ON r.id = m.room_id
           WHERE r.host_id = ? OR r.guest_id = ? ORDER BY m.id DESC LIMIT 100`,
        )
        .all(userId, userId);
    },

    addAnswer(roomId: number, game: string, questionId: string, userId: number, answer: string) {
      db.prepare("INSERT INTO answers (room_id, game, question_id, user_id, answer) VALUES (?, ?, ?, ?, ?)").run(roomId, game, questionId, userId, answer);
    },

    answers(roomId: number) {
      return db
        .prepare<[number], { game: string; question_id: string; user_id: number; answer: string }>(
          "SELECT game, question_id, user_id, answer FROM answers WHERE room_id = ? ORDER BY id",
        )
        .all(roomId);
    },

    revealLevel: (roomId: number, userId: number) => q.revealLevel.get(roomId, userId)?.level ?? 0,

    setRevealLevel(roomId: number, userId: number, level: number) {
      db.prepare(
        "INSERT INTO reveals (room_id, user_id, level) VALUES (?, ?, ?) ON CONFLICT(room_id, user_id) DO UPDATE SET level = excluded.level",
      ).run(roomId, userId, level);
    },

    addContact(input: { name: string; email: string; topic: string; message: string }) {
      db.prepare("INSERT INTO contact_messages (name, email, topic, message) VALUES (?, ?, ?, ?)").run(input.name, input.email, input.topic, input.message);
    },

    addEvent(name: string, path: string) {
      db.prepare("INSERT INTO analytics_events (name, path) VALUES (?, ?)").run(name, path);
    },

    eventSummary() {
      return db
        .prepare<[], { name: string; path: string; count: number }>(
          "SELECT name, path, COUNT(*) AS count FROM analytics_events WHERE created_at >= datetime('now', '-30 days') GROUP BY name, path ORDER BY count DESC LIMIT 200",
        )
        .all();
    },
  };
}

export type Repo = ReturnType<typeof createRepo>;
