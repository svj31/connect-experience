# SaathVerse: Low Level Design

Companion to [HLD.md](HLD.md). Covers the Discovery, Swipe and Match modules added in this version and the
UI that uses them. Everything else is described in [ARCHITECTURE.md](ARCHITECTURE.md).

## 1. Backend modules

| File | Responsibility |
| --- | --- |
| `backend/src/geo.ts` | City centre coordinates, `distanceKm(cityA, cityB)` (haversine, whole km, null if unknown), `proximity(km)` 1 at 0 km falling to 0 at 1500 km, 0.4 when unknown |
| `backend/src/feed.ts` | Pure ranking: `feedScore(candidate)`, `rankFeed(candidates)` (stable by id on ties), `FeedCache` (per user id list with TTL, `remove`, `invalidate`) |
| `backend/src/routes/swipes.ts` | `/api/discover` routes: feed, swipe, undo, quota. Holds `QUOTAS` |
| `backend/src/routes/people.ts` | Shared helpers now exported: `discoverable(repo, me)` (the candidate pool) and `openSharedSpace(repo, connection)` (accept and create the room). Cards include `distanceKm` |
| `backend/src/repo.ts` | New: `transaction(fn)`, `swipe`, `swipeBetween`, `lastSwipe`, `deleteSwipe`, `swipesToday`, `markSuper`, `swipeStats`. `discoverPool` now keeps people who liked you |

### Feed score

```
score = 0.45 * vibe/100            (Vibe Match, 40 if hidden)
      + 0.20 * proximity(km)
      + 0.15 * max(0, 1 - idleHours/168)   (0.2 if never active)
      + 0.05 * newcomer                    (1 on day 0, 0 from day 7)
      + 0.05 * completeness/100
      + 0.10 * likedYou
```

### Swipe transaction (`POST /api/discover/swipes`)

```
validate body (zod swipeSchema) → 400
target missing, self, admin, not active → 400; blocked → 403
quota exhausted for like / superlike → 429 with quota
BEGIN
  existing = connectionBetween(me, target)
  if existing accepted             → status "connected"
  if decision = pass               → swipes(pass) + passes → "passed"
  if existing pending from target  → openSharedSpace(existing); both swipes matched → "matched"
  else                             → swipes(decision) + pending connection (+ super flag) → "liked"
COMMIT
cache.remove(me, target); on match also cache.remove(target, me)
notify target: connection:accepted (match) or connection:request (like, with super flag)
201 { status, connectionId, roomCode?, match: {person, roomCode} | null, quota }
```

Repeating the same swipe is safe: the swipes primary key upserts, and a second like on a pending request reuses it.

### Undo (`POST /api/discover/swipes/undo`)
Only the most recent swipe, and only if it was a pass (a like may already have notified someone). Deletes the
swipe and pass rows and drops the cached stack so the person returns to the top.

### Data

```sql
CREATE TABLE swipes (
  swiper_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  decision   TEXT NOT NULL,              -- like | pass | superlike
  matched    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (swiper_id, target_id)
);
CREATE INDEX swipes_day ON swipes(swiper_id, created_at);
ALTER TABLE connections ADD COLUMN super INTEGER NOT NULL DEFAULT 0;   -- in place migration
```

Settings gain `maxDistanceKm` (0 means anywhere, validated 0 to 5000).

## 2. Frontend

| File | Responsibility |
| --- | --- |
| `components/app/SwipeDeck.tsx` | The deck. Loads `/discover/feed`, keeps the top three cards rendered, tops up when three or fewer remain |
| `components/app/Discover.tsx` | Views: Swipe (default), Browse (filters and grid), Galaxy. Filters only show for Browse and Galaxy |
| `components/app/Connections.tsx` | "Likes you" tab (was Requests): super likes first with a badge, "Like back" |
| `components/app/Settings.tsx` | Maximum distance slider |

### Deck interaction

| Input | Result |
| --- | --- |
| Drag right past 110 px, right arrow, heart button | like |
| Drag left past 110 px, left arrow, cross button | pass |
| Drag up past 132 px, up arrow, star button | super like (3 a day) |
| Heart on a prompt, chat button | like with a note (opens a dialog) |
| Undo button, Z | undo last pass |

While dragging, LIKE, NOPE or SUPER stamps fade in with distance and the next card scales up. Pointer capture
keeps the drag on the card; `touch-action: pan-y` lets the profile body scroll vertically on phones. Buttons
and links inside the card do not start a drag. Card height is clamped to the viewport so the action bar is
always visible, including above the phone bottom navigation.

### Card anatomy (Hinge style)
Planet portrait on the member's colour with Active now and the Vibe ring; then name and age, city and distance,
pronouns, intent chip; the top two Vibe reasons; the first prompt with a like button; bio; interests (shared ones
in rose); link to the full profile with the Vibe breakdown.

## 3. Tests

| File | Covers |
| --- | --- |
| `backend/test/feed.test.ts` | distance, proximity, score ordering, liked you boost, stable ties, cache expiry and removal |
| `backend/test/swipes.test.ts` | ranked feed with distance and quota, like then like back is a match with a room, simultaneous likes give one match, pass hides and undo restores, super like flag and 429 on quota, bad input |
| `frontend/tests/e2e/journeys.spec.ts` | swipe deck pass, undo, keyboard like, galaxy; "Likes you" tab; Browse view for the two person journey |
