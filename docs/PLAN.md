# Plan: SaathVerse (version 2)

AFFECIO HACKS '26, Problem Statement 06, "Make Connection an Experience: Interactive Dating".
Judging: Technical 30%, Innovation 25%, Impact 20%, UI/UX 15%, Demo 10%.

## Goals for this version
1. Rebrand to **SaathVerse** (Shared Orbit logo, violet, lilac, rose) with a playful, romantic feel, light and dark.
2. A landing page that explains the problem and the idea with visuals and interactive demos, and offers member and admin sign in plus one click demos.
3. A clear member app: Dashboard, Discover, Connections, Chats, Together, Moments, Profile, Settings, Safety.
4. A separated "doing together" flow: what (Talk, Play, Create, Watch), who (connection, someone new, code), and whether the activity is locked.
5. Scores people can understand: Vibe Match (profile compatibility, with reasons) and Bond (what you actually did together, with levels and streaks).
6. Personalisation everywhere: people, activities, questions, watch picks, draw prompts, icebreakers.
7. An admin module with analytics, report moderation, members, audit log and profile, without exposing private chats.
8. Themed animation: logo hover, cursor, starfield, loaders per page, celebrations, scroll reveals; all respect reduced motion.

## Ideas borrowed from dating and social apps
| App | Idea | How SaathVerse uses it |
| --- | --- | --- |
| Hinge | Prompts and replying to a prompt | 12 prompts, connect notes can reply to one |
| Hinge, OkCupid | Compatibility | Vibe Match with a visible breakdown |
| Bumble | Basics and lifestyle chips, Private Detector | Lifestyle pickers, kindness nudge on unkind words |
| Tinder | It's a Match, Are You Sure | "It's a Saath!" celebration, send anyway prompt |
| Shaadi | Express interest and accept | Connection requests with notes |
| Instagram | Requests tab, follow lists | Connections with Requests and Sent tabs |
| Snapchat | Streaks | Bond streak flame, best streak on the dashboard |
| Safety apps | Check-ins, quick exit | Date check-in planner, quick exit button |

## Build order
1. Repo restructure (`backend/`, `frontend/`, `docs/`, `scripts/`, `demo_data/`, `instructions/`).
2. Backend: schema migration, profile catalog, Vibe, Bond, privacy, personalisation, Deep Talk, connections, Discover, dashboard, admin, moderation, demo seed. Tests.
3. Frontend: design tokens and dark mode, logo, cursor, sky, loaders, celebration, landing, auth, app shell, every page, admin. Tests.
4. Screenshots of every page in both themes and on a phone; fix what looks wrong.
5. Docs, setup scripts, git command plan.
