# Overlap: Project Summary

AFFECIO HACKS '26, Problem Statement 06, "Make Connection an Experience: Interactive Dating".
Plan: [PLAN.md](PLAN.md). Architecture and API: [ARCHITECTURE.md](ARCHITECTURE.md). Tests: [TESTING.md](TESTING.md).
Demo script: [DEMO_SCRIPT.md](DEMO_SCRIPT.md). Logo files: [brand/](brand/).

## 1. The idea

**Overlap.** Two circles, one for each person; the lens where they meet is the logo and the point of the product.
People meet by doing something together at a live "table" instead of browsing profiles. What you reveal about
yourself grows only when you choose, and conversation starters come from your real answers.

What makes it stand out against the judging criteria:

| Criterion (weight) | What we built |
| --- | --- |
| Technical (30%) | Realtime multiplayer with server authoritative state for 9 activities, per player hidden views, SQLite persistence, auth, rate limits, three.js scenes, 98 automated tests |
| Innovation (25%) | Activity first matching, consent based progressive reveal gated by shared moments, a 3D constellation you build together, a moments "thread" in the 3D table, Common Ground from real answers |
| Impact (20%) | Removes photo judging and dead "hey" chats; safety tools built in; works on phones |
| UI/UX (15%) | Light editorial design, one clear call to action, themed loaders per page, scroll reveal, accessible forms and dialogs, AA contrast |
| Demo (10%) | Seeded demo accounts and a timed script |

## 2. What was built

**Activities (all live, both people):** Would You Rather, In Sync (guess your partner), Two Truths and a Lie,
Draw Together, Story Chain, Constellation (3D), Connect Four, Memory Match (cooperative), Watch Together (synced
YouTube). Plus chat with typing indicator, icebreakers and floating reactions.

**Around the table:** lobby with Open Tables and filters, Quick Match by activity and shared interests, private
tables by code, presence, progressive reveal (bio after 1 moment, handle after 3), Common Ground, Moments gallery
(drawings and constellations re-rendered as SVG), report and block, account deletion.

**Site checklist from the brief:** privacy policy, terms, safety guide, contact form; cookie consent that gates
analytics; first party analytics (event name and path only); meta titles and descriptions; OG and Twitter
images; SVG favicon and manifest; sitemap and robots; alt text and labelled SVGs; custom 404 and error page;
HTTPS redirect and HSTS; secrets kept server side (verified by a test); form validation on client and server;
spam protection (honeypot, minimum fill time, rate limits); mobile layouts; contrast checked; no raster images
at all, so nothing to compress.

**Design rules followed:** light palette (paper, ink, coral, teal), no purple, no gradients, rectangular
6px buttons, inline SVG icons (no emoji), no em dashes, no fake reviews or metrics, no AI photos, no cursor
effects, motion off under reduced motion.

## 3. How to run and test

See [README](../README.md) for setup and [TESTING.md](TESTING.md) for commands, results and a manual script.
Current results: server 60 passed, web unit 19 passed, end to end 19 passed. Typecheck, lint and production
build are clean.

## 4. Before launch (not doable from code)

- Connect a custom domain and set `NEXT_PUBLIC_SITE_URL`, `WEB_ORIGIN`, `NEXT_PUBLIC_SOCKET_URL`.
- Set a real `JWT_SECRET` and `ADMIN_TOKEN`; replace the placeholder contact email in `web/src/lib/site.ts`.
- Host the API somewhere with a persistent disk for SQLite (Render, Railway, Fly) and the web app on Vercel.
- Have the privacy policy and terms reviewed for your jurisdiction. There is no "Made with AI" tag anywhere.
- Disclose AI tool use in the submission as the rules require.

## 5. Suggested improvements

1. **Voice or video rooms** (WebRTC) for a later stage of a connection, unlocked by reveal level.
2. **Email verification and password reset**, needed for a real launch.
3. **Moderation dashboard** for reports, and automatic text filtering in chat.
4. **More content**: question packs by theme, more story openers, a Pictionary style guessing game.
5. **Persist in progress game state** to SQLite so a server restart does not reset an unfinished round
   (finished rounds, answers and moments are already saved).
6. **Redis adapter for Socket.IO** to run more than one API instance.
7. **Scheduled tables** ("Thursday 9pm, film night") and reminders.
8. **Postgres** when usage outgrows SQLite; the repository layer keeps this change contained.
9. **Accessibility audit with a screen reader user**, beyond the automated checks.
10. **Internationalisation**, starting with Hindi.
