# SaathVerse brand: Saath (v5)

**Name.** Saath (Hindi for together) + Verse. **Tagline:** Don't just match. Do something together.

**Principle.** Calm and editorial, like Hinge and Instagram: people's photos are the colour, the interface stays quiet.

**Mark.** An ink tile with an "S" drawn as one thread in two halves: cream above, saffron below, meeting in the middle (two stories becoming one). On hover the thread redraws itself, top half first, in a calm 1.1 s line animation.
Files: [logo-mark.svg](logo-mark.svg), [logo-wordmark.svg](logo-wordmark.svg), `frontend/src/app/icon.svg`.
**Wordmark.** Lowercase serif `saath` + italic plum `verse`.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| Paper | #fbf9f6 | #0f0e0d | Background |
| Surface | #ffffff | #1c1a18 | Cards |
| Ink | #161412 | #f4f1ec | Text and primary buttons (`bg-brand` flips per theme) |
| Plum (`--violet`) | #5b3a8c | #c4a8f0 | Links, selected text, Vibe Match |
| Saffron | #f2a900 | #f2a900 | Super likes, Standouts, the spark |
| Muted | #6b645c | #a9a198 | Secondary text |

**Type.** Display: Newsreader (serif, weight 500, slight negative tracking). Body: Inter.
**Shape.** Pill buttons and chips, 20 to 24 px card radius, hairline borders, soft shadows only on floating cards.
**Layout.** Desktop: left rail navigation (Instagram). Phone: five tabs (Discover, Standouts, Likes, Matches, Profile).
**Rule.** Nothing floats over content: actions live in bars or at the end of a section.

**Planet avatar.** Source art: `frontend/design_components/Planet Orbit.svg` (a rotating planet, gold ring, two plum stars). Regenerate the colour set with `python3 frontend/scripts/generate-planets.py`. It appears alongside photos (hover or idle) and alone when a member has no photo.
Options are layered over the art in `Planet.tsx` (shape, design, face, ring); the planet body is a circle at (1019, 1101), r 288, in the files' viewBox `455 530 1140 1140`.
