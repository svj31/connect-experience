import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export type DB = Database.Database;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  pronouns      TEXT NOT NULL DEFAULT '',
  bio           TEXT NOT NULL DEFAULT '',
  handle        TEXT NOT NULL DEFAULT '',
  interests     TEXT NOT NULL DEFAULT '[]',
  avatar_shape  TEXT NOT NULL DEFAULT 'circle',
  avatar_color  TEXT NOT NULL DEFAULT 'coral',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rooms (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  code       TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  topic      TEXT NOT NULL DEFAULT '',
  activity   TEXT NOT NULL,
  is_public  INTEGER NOT NULL DEFAULT 1,
  host_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status     TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS rooms_open ON rooms(status, is_public);

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id    INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS messages_room ON messages(room_id, id);

CREATE TABLE IF NOT EXISTS moments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id    INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  activity   TEXT NOT NULL,
  title      TEXT NOT NULL,
  data       TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS moments_room ON moments(room_id);

CREATE TABLE IF NOT EXISTS answers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id     INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  game        TEXT NOT NULL,
  question_id TEXT NOT NULL,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answer      TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS answers_room ON answers(room_id, game);

CREATE TABLE IF NOT EXISTS reveals (
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_code   TEXT,
  reason      TEXT NOT NULL,
  details     TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  topic      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  path       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS connections (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending',
  note         TEXT NOT NULL DEFAULT '',
  room_code    TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  accepted_at  TEXT,
  UNIQUE (requester_id, addressee_id)
);
CREATE INDEX IF NOT EXISTS connections_addressee ON connections(addressee_id, status);

CREATE TABLE IF NOT EXISTS passes (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, target_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moment_id INTEGER NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, moment_id)
);

CREATE TABLE IF NOT EXISTS admin_actions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action         TEXT NOT NULL,
  target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  report_id      INTEGER REFERENCES reports(id) ON DELETE SET NULL,
  note           TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

/**
 * Columns added after the first release. Each is added only when missing, so an
 * existing database upgrades in place on the next start without losing data.
 */
const ADDED_COLUMNS: Record<string, [string, string][]> = {
  users: [
    ["role", "TEXT NOT NULL DEFAULT 'user'"],
    ["status", "TEXT NOT NULL DEFAULT 'active'"],
    ["suspended_until", "TEXT"],
    ["birth_year", "INTEGER"],
    ["gender", "TEXT NOT NULL DEFAULT ''"],
    ["looking_for", "TEXT NOT NULL DEFAULT 'everyone'"],
    ["intent", "TEXT NOT NULL DEFAULT 'not-sure'"],
    ["city", "TEXT NOT NULL DEFAULT ''"],
    ["job", "TEXT NOT NULL DEFAULT ''"],
    ["education", "TEXT NOT NULL DEFAULT ''"],
    ["height_cm", "INTEGER"],
    ["star_sign", "TEXT NOT NULL DEFAULT ''"],
    ["languages", "TEXT NOT NULL DEFAULT '[]'"],
    ["lifestyle", "TEXT NOT NULL DEFAULT '{}'"],
    ["love_language", "TEXT NOT NULL DEFAULT ''"],
    ["personality", "TEXT NOT NULL DEFAULT ''"],
    ["prompts", "TEXT NOT NULL DEFAULT '[]'"],
    ["quiz", "TEXT NOT NULL DEFAULT '{}'"],
    ["avatar", "TEXT NOT NULL DEFAULT '{}'"],
    ["privacy", "TEXT NOT NULL DEFAULT '{}'"],
    ["settings", "TEXT NOT NULL DEFAULT '{}'"],
    ["last_active_at", "TEXT"],
  ],
  rooms: [
    ["kind", "TEXT NOT NULL DEFAULT 'table'"],
    ["locked", "INTEGER NOT NULL DEFAULT 0"],
  ],
  messages: [["flagged", "INTEGER NOT NULL DEFAULT 0"]],
  reports: [
    ["status", "TEXT NOT NULL DEFAULT 'open'"],
    ["evidence", "TEXT NOT NULL DEFAULT '[]'"],
    ["admin_note", "TEXT NOT NULL DEFAULT ''"],
    ["resolved_at", "TEXT"],
  ],
};

function migrate(db: Database.Database) {
  for (const [table, columns] of Object.entries(ADDED_COLUMNS)) {
    const existing = new Set((db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name));
    for (const [name, type] of columns) {
      if (!existing.has(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
    }
  }
}

export function openDb(path: string): DB {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  migrate(db);
  return db;
}
