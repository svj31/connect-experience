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
  role: "user" | "admin";
  status: "active" | "suspended" | "banned";
  suspended_until: string | null;
  birth_year: number | null;
  gender: string;
  looking_for: string;
  intent: string;
  city: string;
  job: string;
  education: string;
  height_cm: number | null;
  star_sign: string;
  languages: string;
  lifestyle: string;
  love_language: string;
  personality: string;
  prompts: string;
  quiz: string;
  avatar: string;
  privacy: string;
  settings: string;
  last_active_at: string | null;
}

export interface ConnectionRow {
  id: number;
  requester_id: number;
  addressee_id: number;
  status: "pending" | "accepted" | "declined";
  note: string;
  room_code: string | null;
  created_at: string;
  accepted_at: string | null;
}

export interface ReportRow {
  id: number;
  reporter_id: number;
  reported_id: number;
  room_code: string | null;
  reason: string;
  details: string;
  created_at: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  evidence: string;
  admin_note: string;
  resolved_at: string | null;
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
  kind: "table" | "match" | "connection";
  locked: number;
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
const COLORS = ["violet", "rose", "mint", "sun", "sky", "plum"];

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
  return { ...baseRepo(db), ...extendRepo(db) };
}

function baseRepo(db: DB) {
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

    createUser(input: { email: string; passwordHash: string; displayName: string; role?: "user" | "admin" }) {
      const info = db
        .prepare("INSERT INTO users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)")
        .run(input.email, input.passwordHash, input.displayName, input.role ?? "user");
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

    createRoom(input: { title: string; topic: string; activity: string; isPublic: boolean; hostId: number; guestId?: number; kind?: RoomRow["kind"]; locked?: boolean }) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = makeRoomCode();
        if (q.roomByCode.get(code)) continue;
        db.prepare(
          "INSERT INTO rooms (code, title, topic, activity, is_public, host_id, guest_id, status, kind, locked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ).run(code, input.title, input.topic, input.activity, input.isPublic ? 1 : 0, input.hostId, input.guestId ?? null, input.guestId ? "paired" : "open", input.kind ?? (input.guestId ? "match" : "table"), input.locked ? 1 : 0);
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
           WHERE r.status = 'open' AND r.is_public = 1 AND r.guest_id IS NULL AND r.host_id != ? AND r.kind = 'table'
             AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id = ? AND b.blocked_id = r.host_id) OR (b.blocker_id = r.host_id AND b.blocked_id = ?))
           ORDER BY r.id DESC LIMIT 50`,
        )
        .all(viewerId, viewerId, viewerId);
    },

    myRooms(userId: number) {
      return db
        .prepare<[number, number], RoomRow>(
          "SELECT * FROM rooms WHERE (host_id = ? OR guest_id = ?) AND status != 'closed' AND kind != 'connection' ORDER BY id DESC LIMIT 30",
        )
        .all(userId, userId);
    },

    isBlocked: (a: number, b: number) => q.isBlocked.get(a, b, b, a)!.n > 0,

    block(blocker: number, blocked: number) {
      db.prepare("INSERT OR IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)").run(blocker, blocked);
    },

    report(input: { reporterId: number; reportedId: number; reason: string; details: string; roomCode?: string; evidence?: unknown[] }) {
      const info = db.prepare("INSERT INTO reports (reporter_id, reported_id, room_code, reason, details, evidence) VALUES (?, ?, ?, ?, ?, ?)").run(
        input.reporterId, input.reportedId, input.roomCode ?? null, input.reason, input.details, JSON.stringify(input.evidence ?? []),
      );
      return Number(info.lastInsertRowid);
    },

    addMessage(roomId: number, userId: number, body: string, flagged = false) {
      const info = db.prepare("INSERT INTO messages (room_id, user_id, body, flagged) VALUES (?, ?, ?, ?)").run(roomId, userId, body, flagged ? 1 : 0);
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

/** Today in UTC as YYYY-MM-DD, the unit streaks and active days are counted in. */
const day = (sql: string) => sql.slice(0, 10);

/**
 * Queries for profiles, connections, Discover and the admin area. Kept apart from the
 * table and chat queries above so each half stays readable.
 */
export function extendRepo(db: DB) {
  const connectionBetween = db.prepare<[number, number, number, number], ConnectionRow>(
    "SELECT * FROM connections WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)",
  );

  return {
    setProfileFields(id: number, fields: Record<string, string | number | null>) {
      const keys = Object.keys(fields);
      if (!keys.length) return;
      db.prepare(`UPDATE users SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`).run(...keys.map((k) => fields[k]), id);
    },

    touch(id: number) {
      db.prepare("UPDATE users SET last_active_at = datetime('now') WHERE id = ?").run(id);
    },

    countUsers: () => db.prepare<[], { n: number }>("SELECT COUNT(*) AS n FROM users").get()!.n,

    /** Everyone Discover could show. Filtering by privacy, fit and age happens in code. */
    discoverPool(viewerId: number) {
      return db
        .prepare<[number, number, number, number, number, number], UserRow>(
          `SELECT u.* FROM users u
           WHERE u.id != ? AND u.role = 'user' AND u.status != 'banned'
             AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id = ? AND b.blocked_id = u.id) OR (b.blocker_id = u.id AND b.blocked_id = ?))
             AND NOT EXISTS (SELECT 1 FROM connections c WHERE ((c.requester_id = ? AND c.addressee_id = u.id) OR (c.requester_id = u.id AND c.addressee_id = ?)) AND c.status != 'declined')
             AND NOT EXISTS (SELECT 1 FROM passes p WHERE p.user_id = ? AND p.target_id = u.id)
           ORDER BY u.id DESC LIMIT 500`,
        )
        .all(viewerId, viewerId, viewerId, viewerId, viewerId, viewerId);
    },

    pass(userId: number, targetId: number) {
      db.prepare("INSERT OR IGNORE INTO passes (user_id, target_id) VALUES (?, ?)").run(userId, targetId);
    },
    clearPasses(userId: number) {
      return db.prepare("DELETE FROM passes WHERE user_id = ?").run(userId).changes;
    },

    connectionBetween: (a: number, b: number) => connectionBetween.get(a, b, b, a),
    connectionById: (id: number) => db.prepare<[number], ConnectionRow>("SELECT * FROM connections WHERE id = ?").get(id),
    connectionByRoom: (code: string) => db.prepare<[string], ConnectionRow>("SELECT * FROM connections WHERE room_code = ?").get(code),

    requestConnection(from: number, to: number, note: string) {
      db.prepare("DELETE FROM connections WHERE requester_id = ? AND addressee_id = ? AND status = 'declined'").run(from, to);
      const info = db.prepare("INSERT INTO connections (requester_id, addressee_id, note) VALUES (?, ?, ?)").run(from, to, note);
      return Number(info.lastInsertRowid);
    },

    acceptConnection(id: number, roomCode: string) {
      db.prepare("UPDATE connections SET status = 'accepted', room_code = ?, accepted_at = datetime('now') WHERE id = ?").run(roomCode, id);
    },

    declineConnection(id: number) {
      db.prepare("UPDATE connections SET status = 'declined' WHERE id = ?").run(id);
    },

    removeConnection(id: number) {
      db.prepare("DELETE FROM connections WHERE id = ?").run(id);
    },

    connectionsOf(userId: number) {
      return db
        .prepare<[number, number], ConnectionRow>(
          "SELECT * FROM connections WHERE (requester_id = ? OR addressee_id = ?) AND status != 'declined' ORDER BY COALESCE(accepted_at, created_at) DESC",
        )
        .all(userId, userId);
    },

    /** Raw counts for the Bond between two people at their shared space. */
    pairStats(roomCode: string | null) {
      const room = roomCode ? db.prepare<[string], RoomRow>("SELECT * FROM rooms WHERE code = ?").get(roomCode) : undefined;
      if (!room) return { moments: 0, messages: 0, answers: 0, activeDays: [] as string[] };
      const n = (sql: string) => db.prepare<[number], { n: number }>(sql).get(room.id)!.n;
      const days = db
        .prepare<[number, number], { d: string }>(
          "SELECT DISTINCT substr(created_at, 1, 10) AS d FROM messages WHERE room_id = ? UNION SELECT DISTINCT substr(created_at, 1, 10) FROM moments WHERE room_id = ?",
        )
        .all(room.id, room.id)
        .map((r) => day(r.d));
      return {
        moments: n("SELECT COUNT(*) AS n FROM moments WHERE room_id = ?"),
        messages: n("SELECT COUNT(*) AS n FROM messages WHERE room_id = ?"),
        answers: n("SELECT COUNT(*) AS n FROM answers WHERE room_id = ?"),
        activeDays: days,
      };
    },

    lastMessage(roomCode: string | null) {
      if (!roomCode) return undefined;
      return db
        .prepare<[string], { user_id: number; body: string; created_at: string }>(
          "SELECT m.user_id, m.body, m.created_at FROM messages m JOIN rooms r ON r.id = m.room_id WHERE r.code = ? ORDER BY m.id DESC LIMIT 1",
        )
        .get(roomCode);
    },

    /** Messages and moments per day over the last week, for the dashboard chart. */
    weeklyActivity(userId: number) {
      return db
        .prepare<[number, number, number], { d: string; messages: number; moments: number }>(
          `WITH days(d) AS (SELECT date('now', '-' || n || ' days') FROM (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6))
           SELECT d,
             (SELECT COUNT(*) FROM messages m WHERE m.user_id = ? AND substr(m.created_at, 1, 10) = d) AS messages,
             (SELECT COUNT(*) FROM moments mo JOIN rooms r ON r.id = mo.room_id WHERE (r.host_id = ? OR r.guest_id = ?) AND substr(mo.created_at, 1, 10) = d) AS moments
           FROM days ORDER BY d`,
        )
        .all(userId, userId, userId);
    },

    userCounts(userId: number) {
      const n = (sql: string, ...args: number[]) => db.prepare(sql).get(...args) as { n: number };
      return {
        messages: n("SELECT COUNT(*) AS n FROM messages WHERE user_id = ?", userId).n,
        moments: n("SELECT COUNT(*) AS n FROM moments m JOIN rooms r ON r.id = m.room_id WHERE r.host_id = ? OR r.guest_id = ?", userId, userId).n,
        activities: db
          .prepare<[number, number], { activity: string; n: number }>(
            "SELECT m.activity, COUNT(*) AS n FROM moments m JOIN rooms r ON r.id = m.room_id WHERE r.host_id = ? OR r.guest_id = ? GROUP BY m.activity ORDER BY n DESC",
          )
          .all(userId, userId),
      };
    },

    toggleFavorite(userId: number, momentId: number) {
      const exists = db.prepare("SELECT 1 FROM favorites WHERE user_id = ? AND moment_id = ?").get(userId, momentId);
      if (exists) db.prepare("DELETE FROM favorites WHERE user_id = ? AND moment_id = ?").run(userId, momentId);
      else db.prepare("INSERT INTO favorites (user_id, moment_id) VALUES (?, ?)").run(userId, momentId);
      return !exists;
    },
    favoriteIds: (userId: number) =>
      new Set(db.prepare<[number], { moment_id: number }>("SELECT moment_id FROM favorites WHERE user_id = ?").all(userId).map((r) => r.moment_id)),

    blockedBy(userId: number) {
      return db
        .prepare<[number], { id: number; display_name: string; created_at: string }>(
          "SELECT u.id, u.display_name, b.created_at FROM blocks b JOIN users u ON u.id = b.blocked_id WHERE b.blocker_id = ? ORDER BY b.created_at DESC",
        )
        .all(userId);
    },
    unblock(blocker: number, blocked: number) {
      db.prepare("DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?").run(blocker, blocked);
    },
    reportsBy(userId: number) {
      return db
        .prepare<[number], { id: number; reason: string; status: string; created_at: string; display_name: string }>(
          "SELECT r.id, r.reason, r.status, r.created_at, u.display_name FROM reports r JOIN users u ON u.id = r.reported_id WHERE r.reporter_id = ? ORDER BY r.id DESC",
        )
        .all(userId);
    },
    recentMessagesBetween(roomCode: string, limit = 20) {
      return db
        .prepare<[string, number], { user_id: number; body: string; created_at: string }>(
          "SELECT m.user_id, m.body, m.created_at FROM messages m JOIN rooms r ON r.id = m.room_id WHERE r.code = ? ORDER BY m.id DESC LIMIT ?",
        )
        .all(roomCode, limit)
        .reverse();
    },

    // Admin

    adminTotals() {
      const n = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
      return {
        users: n("SELECT COUNT(*) AS n FROM users WHERE role = 'user'"),
        newThisWeek: n("SELECT COUNT(*) AS n FROM users WHERE role = 'user' AND created_at >= datetime('now', '-7 days')"),
        activeToday: n("SELECT COUNT(*) AS n FROM users WHERE role = 'user' AND last_active_at >= datetime('now', '-1 day')"),
        connections: n("SELECT COUNT(*) AS n FROM connections WHERE status = 'accepted'"),
        pendingRequests: n("SELECT COUNT(*) AS n FROM connections WHERE status = 'pending'"),
        liveTables: n("SELECT COUNT(*) AS n FROM rooms WHERE status != 'closed' AND kind != 'connection'"),
        moments: n("SELECT COUNT(*) AS n FROM moments"),
        messages: n("SELECT COUNT(*) AS n FROM messages"),
        openReports: n("SELECT COUNT(*) AS n FROM reports WHERE status IN ('open', 'reviewing')"),
        flaggedMessages: n("SELECT COUNT(*) AS n FROM messages WHERE flagged = 1"),
        suspended: n("SELECT COUNT(*) AS n FROM users WHERE status IN ('suspended', 'banned')"),
      };
    },

    signupsByDay(days = 14) {
      return db
        .prepare<[number], { d: string; n: number }>(
          "SELECT substr(created_at, 1, 10) AS d, COUNT(*) AS n FROM users WHERE role = 'user' AND created_at >= date('now', '-' || ? || ' days') GROUP BY d ORDER BY d",
        )
        .all(days - 1);
    },
    momentsByActivity: () => db.prepare<[], { activity: string; n: number }>("SELECT activity, COUNT(*) AS n FROM moments GROUP BY activity ORDER BY n DESC").all(),
    usersByIntent: () => db.prepare<[], { intent: string; n: number }>("SELECT intent, COUNT(*) AS n FROM users WHERE role = 'user' GROUP BY intent ORDER BY n DESC").all(),
    messagesByHour: () =>
      db.prepare<[], { h: string; n: number }>("SELECT strftime('%H', created_at) AS h, COUNT(*) AS n FROM messages WHERE created_at >= datetime('now', '-7 days') GROUP BY h").all(),
    acceptedConnections: () => db.prepare<[], ConnectionRow>("SELECT * FROM connections WHERE status = 'accepted'").all(),

    adminUsers(search: string) {
      const like = `%${search.replace(/[%_]/g, "")}%`;
      return db
        .prepare<[string, string], UserRow & { reports_against: number; connection_count: number }>(
          `SELECT u.*,
             (SELECT COUNT(*) FROM reports r WHERE r.reported_id = u.id) AS reports_against,
             (SELECT COUNT(*) FROM connections c WHERE (c.requester_id = u.id OR c.addressee_id = u.id) AND c.status = 'accepted') AS connection_count
           FROM users u WHERE u.display_name LIKE ? OR u.email LIKE ? ORDER BY u.id DESC LIMIT 200`,
        )
        .all(like, like);
    },

    reports(status: string) {
      const where = status === "all" ? "" : status === "active" ? "WHERE r.status IN ('open', 'reviewing')" : "WHERE r.status = ?";
      const stmt = db.prepare(
        `SELECT r.*, a.display_name AS reporter_name, b.display_name AS reported_name, b.status AS reported_status,
           (SELECT COUNT(*) FROM reports x WHERE x.reported_id = r.reported_id) AS reported_total
         FROM reports r JOIN users a ON a.id = r.reporter_id JOIN users b ON b.id = r.reported_id ${where} ORDER BY r.id DESC LIMIT 200`,
      );
      return (where.includes("?") ? stmt.all(status) : stmt.all()) as (ReportRow & { reporter_name: string; reported_name: string; reported_status: string; reported_total: number })[];
    },
    reportById: (id: number) => db.prepare<[number], ReportRow>("SELECT * FROM reports WHERE id = ?").get(id),
    setReportStatus(id: number, status: ReportRow["status"], note: string) {
      db.prepare(
        "UPDATE reports SET status = ?, admin_note = ?, resolved_at = CASE WHEN ? IN ('resolved', 'dismissed') THEN datetime('now') ELSE NULL END WHERE id = ?",
      ).run(status, note, status, id);
    },
    setUserStatus(id: number, status: UserRow["status"], until: string | null) {
      db.prepare("UPDATE users SET status = ?, suspended_until = ? WHERE id = ?").run(status, until, id);
    },
    logAdmin(input: { adminId: number; action: string; targetUserId?: number | null; reportId?: number | null; note?: string }) {
      db.prepare("INSERT INTO admin_actions (admin_id, action, target_user_id, report_id, note) VALUES (?, ?, ?, ?, ?)").run(
        input.adminId, input.action, input.targetUserId ?? null, input.reportId ?? null, input.note ?? "",
      );
    },
    adminLog(limit = 100, adminId?: number) {
      return db
        .prepare(
          `SELECT l.*, a.display_name AS admin_name, t.display_name AS target_name FROM admin_actions l
           LEFT JOIN users a ON a.id = l.admin_id LEFT JOIN users t ON t.id = l.target_user_id
           ${adminId ? "WHERE l.admin_id = ?" : ""} ORDER BY l.id DESC LIMIT ${Math.min(limit, 500)}`,
        )
        .all(...(adminId ? [adminId] : [])) as { id: number; action: string; note: string; created_at: string; admin_name: string | null; target_name: string | null; report_id: number | null }[];
    },
  };
}
