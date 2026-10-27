# Testing

## Automated

| Suite | Command | What it covers | Result on 27 Oct 2026 |
| --- | --- | --- | --- |
| Server unit | `npm test --prefix server` | all 9 game reducers, Common Ground scoring, matchmaking, validation, tokens, bot checks, default avatars | 60 passed (all server files) |
| Server integration | same command | REST via supertest (auth, profile, rooms, reveal gating, safety, contact, analytics, headers, rate limit, account deletion) and Socket.IO with two real clients (hidden picks, moments, chat limits, reactions, table closing, Quick Match) | included above |
| Web unit and component | `npm test --prefix web` | client validation, consent gating of analytics, safe redirects, accessible fields, activity components | 19 passed |
| End to end | `npm run test:e2e --prefix web` | see below | 19 passed |

End to end tests run in Chromium against the production build and the real API:

- Every public page: 200, title, description, OG image, one h1, `lang`, alt text, no em dashes, no console errors.
- Custom 404, robots, sitemap, favicon, OG image, manifest, security headers, no secrets in shipped JavaScript.
- Link checker over every internal link on public pages.
- Phone width has no sideways scroll. Cookie banner choice persists.
- Signup and contact form validation, including the bot check (the test waits past the minimum fill time).
- **Two browser date:** sign up, profile, host a table, guest finds it in the lobby (with shared interests shown),
  Would You Rather with hidden picks, chat, Connect Four turns, Watch Together link validation, a 3D
  constellation placed by clicking the canvas and named, reveal level 1 unlocking and the bio appearing for the
  partner, Common Ground with real counts, sending a spark to chat, reactions, and Moments.
- Quick Match pairing two people. A phone sized room with private table join by code and chat tab unread badge.

## Running end to end locally

```bash
npm run build --prefix web
RATE_LIMITS=off DATABASE_PATH=./data/e2e.db npm start --prefix server   # RATE_LIMITS=off only for tests
npm start --prefix web
npm run test:e2e --prefix web
```

Playwright starts both servers itself if they are not already running. First run: `npx playwright install chromium`.

## Manual checks done

- Visual review of landing, signup, 404, lobby, room (desktop and phone), constellation.
- WCAG contrast computed for every text and background pair: all at least 4.5:1 (lowest: coral on white, 5.02).

## Issues found by testing and fixed

1. Production HTTPS redirect also fired on localhost, making `next start` unusable locally. Local hosts are now exempt.
2. Room header buttons on phones lost their accessible names (text hidden with `display:none`). Now `sr-only`.
3. All new users had the same coral circle avatar, so both seats looked identical. Defaults now vary.
4. Pages showing a spinner forever when a session cookie had expired. Added a redirect to sign in.
5. `/auth/me` returned 401 for signed out visitors, filling the console with errors. Now `{ user: null }`.
6. Placeholder text was 4.38:1 contrast. Raised to full muted color.
7. 17 React Compiler lint errors (impure calls in render, state set in effects, refs read in render),
   all fixed properly, none suppressed.

## Manual test script for judges or teammates

1. Open the app in a normal window and a private window. Sign up as two people.
2. Window A: start a public table. Window B: sit down from the lobby.
3. Play a Would You Rather round, switch to Draw Together and draw at the same time, then Constellation.
4. Name the constellation, open Reveal in A and choose level 1. B's Reveal panel now shows A's bio.
5. Open Common Ground and press Use on a spark. Open Moments in either window.
