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

# Version 5: Hinge and Instagram patterns, calm brand

Research (Hinge, Bumble, Tinder, Instagram, and the reference repos hinge-clone and instagram-clone-app):

| Pattern | Source | In SaathVerse |
| --- | --- | --- |
| Start on people after sign in, not a dashboard | All dating apps | Sign in and demo land on `/app/discover`; the dashboard is now "Activity" |
| Vertical profile, photos and prompts interleaved, like a specific item with a comment | Hinge | `ProfileFeed`: heart on every photo and prompt, comment dialog, optional super like |
| Standouts and Most Compatible | Hinge | `/app/standouts` and `GET /api/discover/standouts` (top Vibe Match from the ranked pool) |
| Likes You as a photo grid | Hinge, Bumble | Likes tab opens on "Likes you", two columns on phones, super likes first |
| Five tab bottom bar, left rail on desktop | Instagram | Discover, Standouts, Likes, Matches, Profile; rail adds Together, Activity, Moments, Settings, Safety |
| Stories row | Instagram | Matches as rings on Matches and Activity |
| Quiet palette so photos carry colour; serif editorial type | Hinge | Cream, ink, plum, saffron; Newsreader + Inter (see [brand](brand/README.md)) |
| Swipe deck as an option | Tinder | "Cards" view in Discover |

Also: new logo, Hinge style landing (serif hero, photo collage with a prompt card), Galaxy view removed, no floating
buttons over content, layout audit clean at 360 to 1440 px.

# Version 5.1
- **Six demo personas** on the sign in page (`GET /api/auth/demo` lists them, `POST /api/auth/demo {as, key}` signs in).
- **Endless Discover**: when the stack is empty, passes are recycled (`recycled: true` in the feed response, with a toast). 55 demo members.
- **Sidebar** back to the earlier layout (profile header, four big tabs, Matches and Messages panel with photo tiles, shortcuts) in the ink, cream and saffron theme, with a sliding tab indicator, photo zoom and a slow "breathing" dot for new matches.
- **Logo**: an "S" drawn as one thread in two halves (cream and saffron); on hover it redraws itself with a measured line animation.

# Version 5.2: photo and planet, two sides of one person
- The planet artwork from `frontend/design_components/Planet Orbit.svg` is now every member's avatar. `frontend/scripts/generate-planets.py` recolours its surface for the 12 avatar colours (gold ring and plum stars kept), crops it and writes `frontend/public/planets/<colour>.svg`.
- `PhotoPlanet` shows a member's photo and, now and then, their planet: on hover (profiles, Standouts, Likes, Browse, sidebar tiles) after about a second, and on Discover cards when the viewer is idle for a few seconds. The swap is a slow blur and lift (0.8 to 1.1 s), and reduced motion settles instantly. Members without photos simply show their planet.
- Profile editor: the planet section is now a colour picker with live previews (shape, ring, surface and mood pickers removed).
- Every core demo member has 3 to 5 photos (portraits plus lifestyle shots chosen from their interests); crowd members have a portrait each.

# Version 5.3: planet options and photo fixes
- **Why only planets showed:** the backend seeded demo people only into an empty database, so existing databases never got photos. Startup now syncs demo members from `demo_data` every time (history is still added once; `SEED_DEMO=off` skips it).
- **Planet options** on the new artwork (`frontend/src/components/ui/Planet.tsx`): Shape (Classic, Wide, Tilted, Upright, Little, Giant), Design (Original, Bands, Spots, Swirl, Craters, drifting slowly), Face (Smile, Grin, Wink, Calm, Shy, none, with a calm blink), Ring (Classic, Double, Tilted, Moons that orbit), plus 12 colours. Stored values are the existing avatar fields, so old profiles keep working.
- **Demo photos:** each core member has one portrait plus three lifestyle photos from their interests (one person per profile; free photo sets do not offer several shots of the same person).

# Version 5.4: photo that turns over, spin styles, chat that fits
- **Bug:** a stale development stylesheet left the planet layer visible on top of every photo. `PhotoPlanet` now uses inline styles only, so it cannot depend on a stylesheet being fresh.
- **Card flip:** every photo is a card with the member's planet on the back. It turns over (0.9 s, 3D) after about a second of hover and turns back after a few seconds or as soon as the cursor leaves; when the viewer is idle for 4.5 s, cards turn on their own for a short moment, at slightly different times. Reduced motion swaps without the turn.
- **Spin styles** (new planet option, stored in the avatar JSON as `spin`): Steady, Wobble, Float, Slow turn, Breathe. SVG animation, layered over the artwork's own rotating surface.
- **Matches chat** fits the viewport at any size (checked at 360x640 to 1920x1080): only the conversation list and messages scroll; on phones an open conversation takes the whole screen.

# Version 5.5: fit to screen, planets in orbits, light by default
- **Discover** (Profiles, Cards, Browse) is exactly one screen tall at every size; the profile, the deck and the Browse results scroll inside their own panels.
- **Matches chat**: slim one line header (name, bond, streak, quick activities), stories row only on phones; the message area is now 274 to 710 px depending on the screen (was much smaller).
- **Orbits use planets**: Bond orbits (Likes, Matches cards, profiles) show both people's planets travelling the bond ring around a beating heart; Activity "Your universe" shows everyone as planets.
- **Sidebar match tiles** flip to the planet on hover only.
- **Light theme by default** for the site and the app (dark and "match my device" remain in Settings).

# Version 5.6: landing page scroll motion (landing only, nothing removed)
Following the scroll-craft approach (one rAF loop, one scroll value, transforms only, one peak, an ending that resolves,
reduced motion respected), `frontend/src/components/landing/ScrollMotion.tsx` adds:
- Hero: the collage separates into depth planes (photos, prompt card, match chip) and the copy lifts away as you leave.
- Activity marquee and "Near you" faces drift sideways with the scroll, on top of their own loops.
- Section headings reveal word by word (same text; static without JavaScript or with reduced motion).
- How it works: step photos settle from a slight zoom.
- The peak: the dark "Earn the reveal" panel opens from a rounded inset card to full bleed as you arrive.
- The ending: the final call to action settles into place; a thin plum reading line tracks progress.

# Version 5.7: pinned scroll acts inspired by gracefashion.ai (added, nothing removed)
`frontend/src/components/landing/PinnedActs.tsx` adds two sticky, scroll-driven acts to the landing page:
- **Word sandwich** (after the hero, 360vh): "Meet people the way you'd want to be met." gives way to three beats where the
  line splits and an image grows between the words: "Real [portrait] people.", "Honest [prompt grid] prompts.",
  "Shared [moment] moments."; the last image opens to fill the screen.
- **Fan out** (before Activities, 300vh, dark ink): an "It's a Saath!" match in the centre; activity cards fly out around
  it and land, then "One match. Ten ways to meet." On screens under 1024 px the match rises and the cards fill a two
  column grid. Checked at 360x640 to 1440x900 for overlaps with each other, the caption, the match card and the header.
Both render as still sections with reduced motion, and the page never scrolls sideways.

# Version 5.8: scroll motion for every remaining landing section (nothing removed)
`frontend/src/components/landing/SectionMotion.tsx`, plus `BondExplorer autoplay`:
1. **How it works** (the one new pinned act, 300vh): the three steps come to the front one at a time, the others dim and
   lean aside; a bar fills under "Step 1, 2, 3". Cards scale to the room between heading and bar on any screen.
2. **Near you**: a curved row tied to the scroll; the middle profile stands upright, the sides lean back.
3. **Vibe Match**: a score ring that fills and counts to 92% with its reasons stepping in (added beside the existing demo).
4. **Together**: the four category cards start as a deck in the middle and deal out into the row; their activity pills follow.
5. **Bond levels**: the explorer steps from Stardust to Galaxy as it scrolls through the screen; a click hands control back.
6. **Safety**: each card's icon turns in and a check lands, one after another.
7. **Final call to action**: a soft saffron light follows the pointer on desktop and "game." underlines itself.
Still with reduced motion, intact without JavaScript, no sideways scroll, layout audit clean.

# Version 5.9: Likes and Moments fit the screen
Likes (Likes you, Matches, Sent) and Moments are one screen tall like Discover and Matches: the title, tabs and filters stay
in place and only the cards scroll. On phones the subtitle hides (`PageHeader compact`) to give the cards more room.

# Version 5.10: one grid for the app shell
Measured, then fixed: the top bar was 64 px against the sidebar's 72 px header (8 px step at the seam), the logo sat 16 px
left of the page titles, pages used four different widths (4xl to 7xl) so titles moved between pages and drifted from the
logo on wide screens, and Matches used a smaller title. Now the top bar is 72 px and shares the content column
(`max-w-6xl`, same side padding); every page uses that column (narrow pages limit only their content); every title is the
same size and position. Verified on 10 pages at 1440, 1920 and 390 px: seam 0, logo to title 0, right edges 0.

# Version 6.0: Together as a small solar system; titles rise on every page
- `frontend/src/components/app/TogetherSystem.tsx`: a night sky stage (the landing page's ink and plum) with you at the
  centre and four worlds on a tilted orbit, drawn with the planet art: Talk (violet, floats), Play (coral, wobbles),
  Create (mint, breathes), Watch (sky, moons). Front planets are larger and brighter; the system rests while the pointer
  is over it, so nobody chases a moving target. Choosing a world brings it to the centre and its activities appear as
  moons (saffron ring for "for you"); a panel on the right guides step 1 (world), 2 (activity, with a description of the
  moon you point at) and 3 (who with: a match, someone new, or a code; same flows as before).
- Layout is computed, not guessed: moons sit on an ellipse sized to the stage, the ring turns to whichever rotation
  leaves the planet the most room, and the planet scales to clear every moon; under 560 px the planet rises and moons
  form a two column grid. Checked all four worlds at 360x640 to 1920x1080: no clipping, no overlaps.
- Reduced motion: still orbits (the end to end tests use it, which also covers that setting).
- `TitleWords`: every app page title rises word by word on open (0.7 s), with a plain copy for screen readers.
