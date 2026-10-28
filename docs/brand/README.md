# SaathVerse brand: Saath (v5)

**Name.** Saath (Hindi for together) + Verse. **Tagline:** Don't just match. Do something together.

**Principle.** Calm and editorial, like Hinge and Instagram: people's photos are the colour, the interface stays quiet.

**Mark.** Shared Orbit on the ink tile: two worlds (a cream planet and a saffron planet) on crossing orbits, one dashed lilac and one solid plum, with a plum heart where the paths meet and a saffron spark above. On hover the two orbits swing a full turn in opposite directions, the heart beats and the spark twinkles; on loaders and the 404 page (`live`) the orbits sway gently back and forth. Source idea: the Shared Orbit SVG, recoloured from violet and rose to the site's plum, lilac, cream and saffron so it sits on the ink tile in both themes.
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
