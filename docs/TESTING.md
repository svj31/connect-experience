# Testing

## Results on 28 October 2026

| Suite | Command | Result |
| --- | --- | --- |
| Backend unit and integration (Vitest, supertest, two real Socket.IO clients) | `npm test --prefix backend` | 98 passed |
| Frontend unit and component (Vitest, Testing Library) | `npm test --prefix frontend` | 31 passed |
| End to end (Playwright, Chromium, production build, real API) | `npm run test:e2e` | 27 passed |
| Typecheck (both), ESLint with React Compiler rules, production build | `npm run typecheck`, `npm run lint` | clean |

## What is covered

**Backend.** All 10 activity reducers including Deep Talk; Vibe Match (null when too little to compare, perfect
match, ranking, intent pairs, mutual preference); Bond (streaks, levels, message cap); privacy per section and
unlock hints; suspension expiry; completeness; personalisation (shared interests first, played activities move
down, watch links, question of the day, Would You Rather topic order); chat checks. Integration: full profile
save, under 18 and duplicate prompt rejection, Discover filters, passes and hidden profiles, gender preference
both ways, request with live notification, accept, play invite, connection rooms that do not close, room
suggestions, mutual match, decline, cancel, remove, blocks, dashboard, settings validation, catalog, data export,
report evidence only on opt in, flagged messages, locked tables over sockets, demo sign in, admin access control,
invite code, analytics totals, masked emails, suspend blocks login, reinstate, admins cannot be moderated, audit
log, suspended accounts refused. All earlier tests (auth, rooms, rate limits, headers, realtime) still pass.

**Frontend components.** Planet avatars, field errors, loaders, 10 activities without em dashes, landing demos
(Would You Rather reveal, Vibe preview, Bond explorer, reveal slider), Vibe ring and breakdown, chart tables,
relative times, kindness nudge, safety tip, Deep Talk hidden answers, Connect Four turns, Memory Match labels.

**End to end.** Every public page (title, description, OG image, one h1, labelled SVGs, no em dashes, no console
errors), 404, SEO files, security headers and no secrets in JS, link checker, sign in redirects for member and
admin areas, old address redirects, logo hover animation and theme toggle, phone widths. Journeys: two new people
build profiles, find each other with filters, request with a note, live notification, accept with celebration,
chat from Chats to the room's floating chat with unread badge, kindness nudge, Together hub to Deep Talk with both
answers revealed, Bond and Vibe on the profile; Quick Match on a locked Connect Four table; demo member dashboard
views, Discover stack and galaxy, bond ladder, requests, favourites, privacy, dark mode, safety planner; members
blocked from admin; admin invite code; admin pause, restore and audit log; phone bottom nav and room chat.

## Running

```bash
npm test                     # backend + frontend unit and integration
npm run build --prefix frontend
npm run test:e2e             # starts or reuses both servers (first time: npx playwright install chromium)
```

## Issues found by testing and fixed
1. Zod 4 treats enum keyed records as exhaustive, so a half finished Vibe Quiz was rejected. Now a partial record.
2. Live sockets and pages used two separate connections; requests sent before a page loaded were missed. Now one shared socket per user.
3. Logo marks used as decoration had `role="img"` with an empty label. Decorative copies are now hidden from screen readers.
4. The privacy page still linked to the old `/profile` address. Fixed, and old addresses now redirect (308).
5. `scrollTo` is missing in some environments and crashed the chat. Guarded.
6. React Compiler purity errors in the 3D sparkles (random numbers in render). Replaced with a deterministic hash.
7. The dashboard universe drew bond rings in reverse. Inner rings are now the closest bonds.
8. The cursor heart and ring fought over the same transform. The heart now sits inside the ring.
9. A stale production server served old chunks during testing (500 on CSS). Documented: rebuild with the server stopped.
