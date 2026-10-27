# Architecture

```
Browser ──HTTPS──> Next.js (web, :3000) ──rewrite /api/*──> Express API (server, :4000) ──> SQLite
   └──────────── Socket.IO (ticket auth) ─────────────────────────┘
```

- **Same origin API.** The browser only calls `/api/*` on the web origin. Next rewrites it to the API, so the
  session cookie is first party and `API_ORIGIN` never reaches the browser.
- **Sessions.** A signed JWT in an httpOnly, SameSite=Lax cookie (`ovl_session`, 14 days, `Secure` in production).
- **Sockets.** The cookie cannot be read by scripts, so the client asks `POST /api/auth/socket-ticket` for a
  2 minute token on every connect and reconnect.
- **Server authoritative games.** Each activity in `server/src/games/` is a pure module with `init`, `reduce` and
  `view`. `view` hides secrets per player (a partner's pick before the reveal, the lie in Two Truths). The realtime
  layer only routes actions, saves events (answers, moments) and sends each socket its own view.
- **Proxy** (`web/src/proxy.ts`): HTTPS redirect in production and an optimistic sign in redirect for app pages.

## Data model (SQLite)

| Table | Purpose |
| --- | --- |
| users | account, profile, avatar |
| rooms | tables: code, host, guest, activity, public flag, status |
| messages | chat |
| answers | game answers used by Common Ground |
| moments | finished activities (drawings, constellations, stories, results) |
| reveals | reveal level per person per table |
| blocks, reports | safety |
| contact_messages, analytics_events | site forms and consent gated analytics |

## REST API

| Method | Path | Notes |
| --- | --- | --- |
| POST | /api/auth/signup, /login, /logout | signup has honeypot and fill time check |
| GET | /api/auth/me | `{ user }` or `{ user: null }` |
| POST | /api/auth/socket-ticket | short lived socket token |
| PUT, DELETE | /api/profile | update, or delete account (`{ confirm: "DELETE" }`) |
| GET | /api/profile/moments | your moments |
| GET | /api/rooms/open, /api/rooms/mine | lobby lists (blocked users hidden) |
| POST | /api/rooms | create a table |
| GET | /api/rooms/:code | details, partner as revealed |
| POST | /api/rooms/:code/join, /leave | |
| GET | /api/rooms/:code/messages, /moments, /common-ground | members only |
| PUT | /api/rooms/:code/reveal | level 0 to 2, gated by moments shared (0, 1, 3) |
| POST | /api/safety/block, /api/safety/report | report also blocks |
| POST | /api/contact, /api/analytics | public, rate limited |
| GET | /api/analytics/summary | needs `x-admin-token` |

## Socket events

Client to server: `room:join`, `room:activity`, `game:action {activity, action}`, `game:restart`, `chat:send`,
`chat:typing`, `reaction`, `match:join {activity}`, `match:leave`.
Server to client: `room:snapshot`, `room:changed`, `room:closed`, `presence`, `chat:message`, `chat:typing`,
`reaction`, `match:found`.
