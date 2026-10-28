# SaathVerse

**Two worlds. One connection.** An interactive dating and friendship app for AFFECIO HACKS '26,
Problem Statement 06 ("Make Connection an Experience: Interactive Dating").

People meet by doing things together (Deep Talk, games, drawing, a shared 3D constellation, watching together),
see *why* they might click (Vibe Match), watch their **Bond** grow from Stardust to Galaxy, and reveal their
profile section by section as it does. An admin console handles safety and analytics without reading private chats.

## Quick start

```bash
npm run setup     # installs both apps, creates env files with a random secret
npm run demo      # backend on :4000, frontend on http://localhost:3000
```

| Demo account | Email | Password |
| --- | --- | --- |
| Member (Ava) | ava@saathverse.test | saathverse123 |
| Admin (Asha) | admin@saathverse.test | saathverse123 |

Or press **Try the live demo** / **Admin demo** on the site. Admin sign up invite code (development): `SAATH-ADMIN-2026`.
Full instructions: [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md). Judge walkthrough: [instructions/JUDGE_WALKTHROUGH.md](instructions/JUDGE_WALKTHROUGH.md).

## Repository layout

```
backend/         Express 5, Socket.IO, SQLite (better-sqlite3), zod
  src/           app, routes, realtime, games (10 activities), vibe, bond, people, personalize, moderation, demo seed
  test/          unit, integration and realtime tests (Vitest)
frontend/        Next.js 16, React 19, TypeScript, Tailwind v4, three.js
  src/app/       (site) public pages, app/ member area, admin/ console
  src/components app, admin, room, activities, landing, fx, three, ui
  tests/         unit (Vitest) and end to end (Playwright)
demo_data/       demo people loaded on first start
docs/            plan, summary, architecture, testing, demo script, brand
instructions/    judge walkthrough, admin guide
scripts/         setup, demo, reset-db
GIT_COMMANDS.md  suggested commits and push commands
```

## Tests

```bash
npm test          # backend 98 + frontend 31
npm run test:e2e  # 27 end to end tests in Chromium
```

Start with [docs/SUMMARY.md](docs/SUMMARY.md).
