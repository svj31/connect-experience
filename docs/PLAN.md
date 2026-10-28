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

# Version 3: a real dating loop

After reviewing the research in `System_Architecture/` and `UI_Design/` (see [HLD](HLD.md) section 1), the biggest gap
was that Discover worked like a directory of connection requests, not like a dating app. This version adds:

1. **Swipe and Match service**: likes, passes, super likes and likes with a note; a mutual like becomes a match in one transaction; daily quotas; undo a pass.
2. **Discovery service**: a ranked candidate stack (Vibe, distance, activity, liked you, newcomer, completeness), cached per member, that skips anyone already swiped and keeps people who liked you.
3. **Location without tracking**: city to city distance on cards, a maximum distance setting.
4. **UI**: a swipe deck as the default Discover view (drag, stamps, Hinge style scrollable card, action bar anchored above the phone nav), a "Likes you" inbox with super likes first, and match celebrations.
5. **Admin**: swipe and match funnel in the overview data.
6. **Docs**: [HLD](HLD.md) and [LLD](LLD.md).

# Version 4: production dating app redesign

The previous look read as a student dashboard. Using the reference apps (Soulmates, a Tinder clone, Tinder style
card animation, and three Snapchat clones) as a guide to patterns, not code, this version changes:

1. **Brand "Ember"**: new logo (gradient squircle with two hearts), lowercase wordmark, rose to orange gradient, Bricolage Grotesque, pill buttons. Starfield and custom cursor removed. See [brand](brand/README.md).
2. **Photos**: members upload up to six (resized in the browser, https or data URL only, validated server side); the first is used everywhere an avatar appears. Demo members have real portraits. Planets remain the fallback.
3. **Swipe card**: full bleed photo, tap left or right for photos with progress bars, name, age, distance and vibe over a dark fade, info sheet with prompts; classic action colors.
4. **App shell**: desktop sidebar like dating web apps (gradient profile header, Discover, Likes, Together, Chats, then a Matches photo grid and Messages list); phone icon tab bar with gradient active pill.
5. **Landing**: dark hero with animated phone mockup, activity marquee, photo step cards, Vibe demo, activities, Bond, safety, gradient CTA, dark footer.
6. **Sign in and sign up**: split screen photo collage and a clean form with filled inputs.
7. **Match moment**: dark full screen card, both photos collide around a heart, gradient title.
8. **Profiles**: swipeable photo gallery hero; photo first tiles in Browse.

# Version 4.1: consistency pass and a busier demo

- **Design rules applied everywhere** (shadcn style primitives): cards 24 px radius with a hairline border, display headings bold, every selected state uses the Ember gradient, chips and tabs are pills, inputs are filled 2xl fields, modals 28 px. Brand helpers are real Tailwind utilities (`bg-brand`, `text-brand`, `shadow-brand`) so variants such as `peer-checked:` work.
- **Instagram style stories row** of matches on Home and Chats (gradient ring = new match).
- **Tinder and Bumble style landing**: a faint wall of faces behind the hero and a "Real people, one swipe away" photo strip.
- **40 demo members** (14 core plus 26 crowd, `"crowd": true` in `demo_data/people.json`) with photos and varied activity times. Crowd members can be added to an existing database safely.
- **Layout audit** (`frontend/tests/layout-audit.mjs`): no sideways scroll, no clipped button text, no controls covering each other, on every page at four widths. Fixed: grid children forcing sideways scroll, button rows that did not wrap, prompt answers clipped in single line inputs.
