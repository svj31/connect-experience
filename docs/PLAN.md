# Overlap: Build Plan

AFFECIO HACKS '26, Problem Statement 06: "Make Connection an Experience: Interactive Dating".

## 1. Reading the problem statement

> Conventional dating platforms often revolve around browsing profiles and exchanging messages.
> Build an innovative experience using games, collaborative activities, virtual hangouts, or interactive
> features that help people connect naturally.

What the judges will look for, mapped to the published weights:

| Criterion | Weight | What it means for us | How Overlap answers it |
| --- | --- | --- | --- |
| Technical implementation | 30% | Real, working, non-trivial engineering | Realtime multiplayer server (Socket.IO) with server-authoritative game state, SQLite persistence, auth, rate limiting, three.js scenes, automated unit, integration and end-to-end tests |
| Innovation | 25% | Not "Tinder with a minigame" | Activity-first matching ("Open Tables"), consent-based progressive reveal, a shared 3D constellation you build together, a Common Ground report computed from real answers |
| Impact and usefulness | 20% | Solves the stated pain: browsing and messaging feel flat | Every connection starts with doing something together; conversation starters are generated from what the two of you actually answered |
| UI/UX | 15% | Easy, distinctive, accessible | Light editorial palette, one clear call to action per screen, keyboard and screen reader support, mobile layouts, themed loading states |
| Demo and presentation | 10% | Easy to show in 3 minutes | Seeded demo accounts, two-browser demo script in `docs/DEMO_SCRIPT.md` |

## 2. Name and identity

**Overlap.** Two people, two circles. The part where they overlap is the point of the product: the
things you both enjoy, discovered by doing them together instead of reading about them.

- Logo: two circles (coral and teal) whose shared lens is filled with ink. See `docs/brand/`.
- Tagline: "Meet over something you both enjoy."
- Voice: plain, warm, specific. No hype, no invented numbers.

### Design rules (from the brief, enforced)

- Light palette: warm paper background, ink text, coral and teal accents. No purple, no gradients on UI.
- Buttons are rectangles with a 6px radius. No pill buttons.
- No emoji icons: all icons are hand drawn inline SVG components.
- No em dashes in copy. No vague hero text. No fake reviews, user counts or metrics.
- No AI generated photos: avatars are generated geometric marks from the user's chosen shape and color.
- No cursor effects, no fps counters, scroll animation kept subtle and disabled under `prefers-reduced-motion`.

## 3. Research summary: what people do together online

Formats that work well for remote couples and new acquaintances (from long distance relationship
guides, party game apps and virtual date idea lists):

1. Low pressure question games: Would You Rather, This or That, 36 Questions style prompts.
2. Guessing each other: "how well do you know me" quizzes, Two Truths and a Lie.
3. Co-creation: drawing together, writing a story line by line, building something.
4. Watching or listening together with synced playback.
5. Light competitive games: Connect Four, memory games.
6. Ambient shared presence: being in the same space without pressure to talk.

Common failure points of existing dating apps that we target:

- Profiles are judged in seconds on photos. We reveal progressively and only with consent.
- Chats stall after "hey". We give every chat a shared activity and generated sparks.
- Matching on stated interests is shallow. We match on what you chose to do and how you answered.

## 4. Feature set

### Core loop
1. Sign up with a display name, pronouns, interests and an avatar mark (shape plus color). No photo.
2. Lobby: browse **Open Tables** (public rooms waiting for a second person, labelled by activity and
   topic), use **Quick Match** for an activity, or join a friend with an invite code.
3. Room: a shared 3D scene (two avatar orbs at a table under a sky) with an activity panel and a chat.
4. Do activities. Every finished round adds a "moment" to the pair's shared history.
5. After moments, each person can choose to reveal more of themselves (bio, then handle).
6. Common Ground report: agreement rate from your real answers, topics you matched on, and
   conversation sparks drawn from where you agreed or differed.

### Activities (all realtime, server authoritative)
| Activity | Type | Notes |
| --- | --- | --- |
| Would You Rather | question | both pick in secret, reveal together |
| In Sync | guessing | one answers about themselves, the other guesses |
| Two Truths and a Lie | guessing | one writes three statements, the other picks the lie |
| Draw Together | co-creation | shared canvas, colors, undo own stroke, clear |
| Story Chain | co-creation | alternate lines, saved as a moment |
| Constellation | co-creation, 3D | place stars in a shared three.js sky, lines link them, name it together |
| Connect Four | competitive | turn based, win detection on server |
| Memory Match | cooperative | flip pairs together, shared score |
| Watch Together | hangout | YouTube player with synced play, pause and seek |
| Chat | communication | icebreaker deck, reactions, typing indicator |

### Safety and trust
- Report and block from inside a room. Blocked users never get matched or seated together.
- Progressive reveal is opt in per person and can be lowered at any time.
- Rate limits on auth, chat and forms. Input validation on both client and server.

### Required site checklist (from the brief)
Privacy page, terms page, secrets kept server side, HTTPS redirect plus HSTS in production,
cookie consent banner gating analytics, meta titles and descriptions, social preview image,
favicon, sitemap and robots, alt text, optimised assets (SVG only, no raster images),
contrast checked against WCAG AA, mobile layouts, custom 404, no broken links (tested),
form validation, spam protection (honeypot, minimum fill time, rate limits), first party
analytics (consent gated), one clear call to action, subtle scroll reveal, themed loading animations.

## 5. Architecture

```
web/      Next.js 16 (App Router, TypeScript, Tailwind v4, three.js via @react-three/fiber)
server/   Node 20, Express 5, Socket.IO, better-sqlite3, zod, JWT in httpOnly cookies
docs/     plan, architecture, API, testing, summary, demo script, brand
```

- The browser talks to `/api/*` on the Next origin; Next rewrites it to the server, so the auth
  cookie is first party. Socket.IO connects to the server directly with a short lived ticket.
- Game logic lives in pure modules (`server/src/games/*`) so it is unit tested without sockets.
- SQLite schema: users, rooms, messages, moments, answers, reveals, blocks, reports,
  contact_messages, analytics_events.

## 6. Testing plan
- Server unit tests: every game reducer, validation, matching, common ground scoring.
- Server integration tests: REST endpoints with supertest, Socket.IO flows with two real clients.
- Web unit tests: validation helpers, consent logic, key components.
- End to end (Playwright): page smoke tests, link checker, 404, sign up, two-browser room flow.

## 7. Milestones
1. Server: schema, auth, rooms, sockets, games, tests.
2. Web: design system, landing, auth, lobby, room, activities, legal pages, SEO files.
3. Tests and fixes, Playwright run, docs and summary.
