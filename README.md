#  Overlap

**Meet over something you both enjoy.** An interactive dating app for AFFECIO HACKS '26, Problem Statement 06
("Make Connection an Experience: Interactive Dating").

Two people sit at a live table and play, draw, write or watch together. Profiles open up only as each person
chooses, and Common Ground turns their real answers into things to talk about.

## Quick start

Requires Node 20 or newer.

```bash
npm run install:all                      # installs server and web
cp server/.env.example server/.env       # then set JWT_SECRET to a long random string
cp web/.env.example web/.env.local
npm run seed                             # optional: 4 demo accounts, password overlap123
npm run dev:server                       # API on http://localhost:4000
npm run dev:web                          # in a second terminal, app on http://localhost:3000
```

Demo accounts: `ava@demo.overlap.local`, `rohan@`, `mira@`, `kabir@` (same domain), password `overlap123`.
To try a live table, use two browsers (or one normal and one private window).

## Tests

```bash
npm test            # server unit and integration tests, web unit and component tests
npm run test:e2e    # Playwright end to end tests (starts or reuses both servers)
```

## Layout

```
server/   Express 5, Socket.IO, SQLite (better-sqlite3), zod. Game logic in server/src/games
web/      Next.js 16, React 19, TypeScript, Tailwind v4, three.js via @react-three/fiber
docs/     plan, summary, architecture, testing, demo script, brand assets
```

Start with [docs/SUMMARY.md](docs/SUMMARY.md).
