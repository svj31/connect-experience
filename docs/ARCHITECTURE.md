# Architecture

```
Browser ──HTTPS──> Next.js frontend (:3000) ──rewrite /api/*──> Express backend (:4000) ──> SQLite
   └──────────── one Socket.IO connection (ticket auth) ──────────────────┘
```

- **Same origin API.** The browser only calls `/api/*` on the frontend origin; Next rewrites it to the backend,
  so the session cookie (`sv_session`, httpOnly, SameSite=Lax) is first party.
- **One socket per signed in user** (`frontend/src/lib/live.tsx`). It carries app wide events (requests,
  matches, invites, warnings) and every page that needs a room joins it through `useRoom`.
- **Roles.** `users.role` is `user` or `admin`. `requireActive` rejects suspended or banned accounts on every
  request and socket; `requireAdmin` guards `/api/admin`.
- **Server authoritative activities.** Each of the 10 activities in `backend/src/games/` is a pure module with
  `init(players, rand, context)`, `reduce` and `view`. `context.topics` (shared interests) personalises new games.
- **Connections own a space.** Accepting a request creates a private room of kind `connection`. Chat, games and
  moments for that pair live there, so Bond points add up in one place. Tables (`table`) and Quick Match
  rooms (`match`) can be locked to one activity.

## Algorithms (pure, unit tested)

| Module | What it does |
| --- | --- |
| `vibe.ts` | Vibe Match 0 to 100 from interests (30), intent (20), Vibe Quiz (20), lifestyle (15), social energy (5), love language (5), city (5). Only parts both people answered count; weights rescale. Returns parts and reasons. `mutualFit` filters Discover by both people's preferences. |
| `bond.ts` | Bond points = moments x12 + answers x2 + messages (capped at 200) + active days x6. Levels Stardust 0, Spark 30, Orbit 90, Constellation 200, Galaxy 400. Streak = consecutive active days ending today or yesterday. |
| `people.ts` | Privacy per section (`everyone`, `connections`, `spark`, `orbit`, `private`), profile views per viewer, completeness. |
| `personalize.ts` | Activity ranking for a person or pair, watch picks and draw prompts by interest, question of the day. |
| `moderation.ts` | Flags unkind chat (counted for admins) and returns a safety tip when contact details are shared. |

## Data model (SQLite, migrated in place)

| Table | Purpose |
| --- | --- |
| users | account, role, status, dating profile, avatar, privacy and settings JSON |
| connections | requests and accepted connections, with their room code |
| passes, favorites | Discover passes, favourite moments |
| rooms | spaces: kind, locked, host, guest, activity |
| messages | chat, with a `flagged` marker |
| answers, moments, reveals | game answers, finished activities, reveal level at tables |
| blocks, reports | safety; reports carry status, admin note and opt in evidence |
| admin_actions | audit log |
| contact_messages, analytics_events | site form and consent based analytics |

## REST API (all under /api)

| Area | Endpoints |
| --- | --- |
| Auth | `POST auth/signup`, `auth/login`, `auth/logout`, `auth/admin-signup` (invite code), `auth/demo`; `GET auth/me`, `auth/demo`; `POST auth/socket-ticket` |
| Profile | `PUT profile`, `profile/privacy`, `profile/settings`; `DELETE profile`; `GET profile/export`, `profile/moments`; `POST profile/moments/:id/favorite` |
| People | `GET people` (filters: minAge, maxAge, intent, gender, city, interests, minVibe, online, sort, q), `people/suggestions`, `people/:id`; `POST people/:id/pass`; `DELETE people/passes` |
| Connections | `GET connections`; `POST connections`, `connections/:id/accept`, `/decline`, `/play`; `DELETE connections/:id` |
| Me | `GET me/dashboard`, `me/suggestions?with=id`, `me/catalog` |
| Rooms | `GET rooms/open`, `rooms/mine`, `rooms/:code`, `/messages`, `/moments`, `/common-ground`, `/suggestions`; `POST rooms`, `/join`, `/leave`; `PUT /reveal` |
| Safety | `POST safety/block`, `safety/report`; `GET safety/overview`; `DELETE safety/block/:id` |
| Admin | `GET admin/overview`, `admin/users?q=`, `admin/reports?status=`, `admin/audit`, `admin/me`; `PUT admin/reports/:id`; `POST admin/users/:id/action` |

## Socket events
Client to server: `room:join`, `room:activity`, `game:action`, `game:restart`, `chat:send`, `chat:typing`,
`reaction`, `match:join {activity, locked}`, `match:leave`.
Server to client: `room:snapshot`, `room:changed`, `room:closed`, `presence`, `chat:message`, `chat:typing`,
`reaction`, `match:found`, `connection:request`, `connection:accepted`, `room:invite`, `account:warning`, `account:status`.

## Frontend map
`frontend/src/app`: `(site)` public pages, `app/` member area, `admin/` console.
`components/`: `app` (dashboard, discover, connections, chats, together, profile, settings, safety), `admin`,
`room`, `activities`, `landing`, `fx` (cursor, sky, burst, celebration), `three`, `ui`, `site`, `brand`.
