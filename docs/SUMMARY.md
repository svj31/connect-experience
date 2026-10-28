# SaathVerse: Project Summary

AFFECIO HACKS '26, Problem Statement 06, "Make Connection an Experience: Interactive Dating".
See also: [PLAN](PLAN.md), [ARCHITECTURE](ARCHITECTURE.md), [TESTING](TESTING.md), [DEMO_SCRIPT](DEMO_SCRIPT.md),
[brand](brand/README.md), and the walkthroughs in [../instructions](../instructions).

## 1. The idea
**SaathVerse** (Saath means together) is a dating and friendship app where two people get to know each other by
*doing* things together. Vibe Match explains how well two profiles line up; Bond shows how much two people have
actually shared, level by level, with streaks. Profiles open up section by section as the bond grows.

| Criterion (weight) | What we built |
| --- | --- |
| Technical (30%) | Realtime server authoritative activities (10), one shared socket with live notifications, roles and moderation, privacy engine, explainable matching, SQLite with in place migrations, 156 automated tests |
| Innovation (25%) | Bond levels that unlock profile sections, Vibe Match with reasons, personalised games (questions from shared interests), planet avatars instead of photos, 3D constellation, Deep Talk |
| Impact (20%) | No photo judging, no dead chats, consent based reveal, kindness nudges, opt in report evidence, quick exit, date check-in planner, data export and deletion |
| UI/UX (15%) | Playful violet and rose theme, light and dark, animated logo, themed cursor, starfield, loaders per page, celebrations, multiple views per page, mobile bottom nav, AA contrast |
| Demo (10%) | One click member and admin demo accounts with a week of seeded history, walkthrough and script |

## 2. What was built

**Landing page:** problem with animated illustrations, the idea with a live planet builder and Vibe preview,
activity categories with a playable Would You Rather round, Bond level explorer, reveal slider, safety features,
and member and admin sign in (plus demos) in the header and at the end.

**Member app:**
- *Home*: question of the day, profile completeness, stats, your universe (Orbit, Cards, Timeline), picks for you, try next, weekly chart, activity mix.
- *Discover*: filters (age, intent, gender, city, interests, minimum vibe, online, name), sort, Stack, Grid and Galaxy views, connect with a note, pass.
- *Profile pages*: Vibe breakdown, Bond orbit and points, sections locked with "unlocks at" hints, suggested activities, report or block.
- *Connections*: connections, requests, sent; List, Cards and Bond ladder views; do something menu; remove.
- *Chats*: conversation list with streaks, live chat, icebreakers from shared interests, activity chips, safety.
- *Together*: what (Talk, Play, Create, Watch, "for you" badges), who (connection, Quick Match or open table, invite code), locked or free.
- *Room*: 3D table, grouped activity switcher with suggestions, floating chat with unread badge, ideas, Common Ground, reveal, safety, bond level up celebrations.
- *Moments*: Gallery, Timeline, By person; favourites; drawings and constellations rendered.
- *My profile*: planet builder, basics, about, interests, prompts, lifestyle, work, Vibe Quiz, preview as stranger to Orbit.
- *Settings*: theme, cursor, motion, discovery toggles, age range, visibility per section, data export, delete account.
- *Safety centre*: quick exit, date check-in planner, tips, your reports and their status, blocked list.

**Admin console:** overview analytics (sign ups, chat hours, activities, bond levels, intents, site events),
report queue with opt in evidence and actions, members with masked emails and status, audit log, admin profile.

**Activities:** Deep Talk (new), Would You Rather (personalised), In Sync, Two Truths and a Lie, Connect Four,
Memory Match, Draw Together (prompt ideas), Story Chain, Constellation (3D), Watch Together (picks).

**Checklist from the brief:** privacy, terms, safety, contact; cookie consent gating analytics; meta tags, OG and
Twitter images, favicon, manifest, sitemap and robots; alt text and labelled SVGs; custom 404 and error pages; HTTPS
redirect and HSTS; secrets server side; form validation on both sides; spam protection (honeypot, fill time, rate
limits); mobile layouts; AA contrast in both themes; themed loaders; subtle scroll reveal; no raster images.

## 3. Changes to earlier design rules, at your request
You asked for cursor animations and a violet based logo palette, so this version adds an optional themed cursor
(switchable in Settings, off for touch and reduced motion) and a violet, lilac and rose palette. Still no gradients
in the UI, no pill buttons, no emoji, no em dashes, no fake numbers (every score is computed from real data).

## 4. How to run and test
See [SETUP_INSTRUCTIONS](../SETUP_INSTRUCTIONS.md) and [TESTING](TESTING.md).
Results: backend 98, frontend 31, end to end 27, all passing. Typecheck, lint and build clean.

## 5. Before launch (not doable from code)
- Domain, hosting (backend with a persistent disk; frontend on Vercel), and the URLs in env files.
- Real `JWT_SECRET` and `ADMIN_INVITE_CODE`; set `DEMO_LOGIN=off` and `SEED_DEMO=off`.
- Replace the placeholder contact email in `frontend/src/lib/site.ts`; legal review of privacy and terms.
- Disclose AI tool use in the submission.

## 6. Suggested improvements
1. Photo verification (selfie match) and a verified badge, with photos revealed only at a chosen bond level.
2. Voice and video rooms (WebRTC) unlocked at Orbit bond.
3. Email verification, password reset and two factor sign in for admins.
4. Push notifications and scheduled dates ("Thursday 9 pm, film night") with reminders.
5. Persist in progress game state so a restart does not reset an unfinished round.
6. Learn Vibe Match weights from which connections reach Spark, with a fairness review.
7. Redis adapter for Socket.IO and Postgres for scale.
8. More content: question packs, Pictionary, music quiz, regional language prompts.
9. Moderator tooling: assignment, SLA timers, appeals.
10. Internationalisation, starting with Hindi.
