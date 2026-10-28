# SaathVerse: High Level Design

Problem Statement 06, "Make Connection an Experience: Interactive Dating". This document records what we took
from the research in [System_Architecture](System_Architecture) (seven system design talks on Tinder, Bumble,
disappearing messages and Instagram) and [UI_Design](UI_Design) (a dating app redesign walkthrough and two
dating UX guides), what we changed because of it, and how the system would grow past a hackathon.
Details of each module are in [LLD.md](LLD.md).

## 1. What the research says, and what we did with it

| Source | Point | Decision in SaathVerse |
| --- | --- | --- |
| Tinder (video 1), Hello Interview (video 2) | Design from features to services to data, not ER first | Services below map one to one onto member features |
| Video 2 | Swipes need strong consistency: two people liking each other at once must give exactly one match. Redis atomic read and write, or a reconciliation job | Swipe and match run in one SQLite transaction (SQLite serialises writers, the same guarantee as a single threaded Redis op). Tested with two simultaneous likes |
| Video 2 | Precompute and cache each user's stack; do not re-rank on every card. Exclude people already swiped (Bloom filter at scale) | Ranked stack cached per member for 3 minutes; a swipe removes one id; the `swipes` table is the seen set |
| Videos 1, 3, 5 | Location matters: shard or index by geography, show distance | City level distance (no precise location stored), distance on every card, maximum distance setting, proximity in ranking |
| Videos 2, 4 | Rate limit and daily caps on likes | 100 likes and 3 super likes per day, plus a per minute limiter on the swipe endpoint |
| Video 4 | Super like as a stronger signal; monitoring | Super likes are marked on the request and sorted first in "Likes you"; admin overview shows the swipe and match funnel |
| Video 5 (Bumble) | Recommendation blends compatibility, activity and newness | Feed score: Vibe Match 45%, proximity 20%, recently active 15%, liked you 10%, newcomer boost 5%, profile completeness 5% |
| Video 6 | Ephemeral data needs TTLs and a cleanup path | Cached stacks expire; unmatching closes the shared room. Disappearing chat is listed as a next step |
| Video 7 (Instagram) | Media on blob storage behind a CDN; feeds are fan out on read for most users | Planet avatars are SVG (no media store needed today); photo reveal with blob store and CDN is the first scale item |
| UI video | Do not reinvent swiping; Hinge keeps swipe semantics as buttons and lets you scroll the profile; anchor actions at the bottom | Swipe deck with drag plus buttons, scrollable Hinge style card, action bar always visible above the phone nav |
| UI video | Keep the distinctive features (badges) and the brand's fun | Vibe ring, reasons and planet avatar stay on the card; "It's a Saath!" celebration on a match |
| Dating UX guides | Clear primary action, few steps to a match, safety visible, likes inbox | "Likes you" tab with "Like back", like with a note on a prompt, undo for accidental passes |

## 2. Requirements

**Functional**
1. Create a dating profile (prompts, interests, lifestyle, planet avatar, privacy per section).
2. Discover people one at a time and swipe: pass, like, super like, like with a note; undo a pass.
3. A mutual like is a match and opens a private shared space.
4. See who liked you and like them back.
5. Do things together in the shared space (10 realtime activities, chat) and grow a Bond that unlocks more of each profile.
6. Safety: block, report with opt in evidence, kindness nudges, quick exit; admin moderation without reading chats.

**Non functional**
- Consistency for swipes and matches; availability for everything else (feeds may be a few minutes stale).
- Discover card in under 200 ms from cache; realtime events in under 100 ms on the same region.
- Privacy by default: no precise location, no photos to judge, sections hidden until the bond allows.
- Abuse resistance: rate limits, daily caps, server authoritative games.

## 3. Services

Today these are modules in one Express process (a modular monolith). Each has its own routes and tables, so
any of them can move out on its own when load requires it.

```
                         ┌──────────────── Next.js web (SSR, same origin /api proxy) ───────────────┐
 Browser / phone ───────►│ Landing · Discover deck · Likes you · Chats · Together · Room · Admin    │
                         └───────────────┬──────────────────────────────────┬───────────────────────┘
                                         │ REST /api/*                      │ Socket.IO (ticket auth)
 ┌────────────┬────────────┬─────────────┼─────────────┬──────────────┬─────┴──────────┬────────────┐
 │ Auth &     │ Profile    │ Discovery   │ Swipe &     │ Connection   │ Realtime rooms │ Safety &   │
 │ sessions   │ & privacy  │ (feed rank, │ Match       │ & Bond       │ (chat, 10      │ Admin      │
 │            │            │ cache, geo) │ (atomic)    │              │ activities)    │            │
 └─────┬──────┴─────┬──────┴──────┬──────┴──────┬──────┴──────┬───────┴───────┬────────┴─────┬──────┘
       └────────────┴─────────────┴─────── SQLite (WAL) ─────┴───────────────┴──────────────┘
                                         Feed cache (in memory, TTL)
```

| Service | Owns | Main endpoints |
| --- | --- | --- |
| Auth | users (credentials, role, status) | `/api/auth/*` |
| Profile | profile columns, privacy, settings | `/api/profile/*` |
| Discovery | ranking, feed cache, distance | `GET /api/discover/feed`, `GET /api/people` (browse with filters) |
| Swipe and Match | swipes, passes, pending connections | `POST /api/discover/swipes`, `POST /api/discover/swipes/undo`, `GET /api/discover/swipes/quota` |
| Connection and Bond | connections, bond computation | `/api/connections/*`, `/api/me/dashboard` |
| Realtime rooms | rooms, messages, answers, moments | `/api/rooms/*`, Socket.IO events |
| Safety and Admin | blocks, reports, admin_actions | `/api/safety/*`, `/api/admin/*` |

## 4. Key flows

**Swipe right that becomes a match**
1. Client posts `{targetId, decision: "like"}`.
2. Server checks quota and blocks, then opens a transaction: reads the connection between the two.
3. If the other person already liked us, it accepts that connection, creates the shared room, and marks both swipes matched. Otherwise it writes our swipe and a pending connection (the other person's "Likes you").
4. After commit: remove the card from our cached stack and notify the other person over their socket (`connection:accepted` or `connection:request`).
5. Client shows "It's a Saath!" with a button into the shared space.

**Opening Discover**
1. `GET /discover/feed?refresh=1` builds the candidate pool (active, discoverable, not blocked, not swiped, mutual gender preference, inside age and distance limits).
2. Each candidate gets a score (section 1), the ranked id list is cached, and the first 10 cards are returned.
3. The client keeps three cards rendered and asks for more before it runs out.

## 5. Data

| Table | Notes |
| --- | --- |
| `swipes` (new) | one row per (swiper, target): decision, matched flag, time. Primary key gives idempotent swipes and the seen set; index on (swiper, created_at) for quotas |
| `connections` | pending is a like, accepted is a match; `super` marks super likes |
| `passes` | kept for Browse view and "reset passes" |
| users, rooms, messages, answers, moments, reveals, blocks, reports, admin_actions | unchanged, see [ARCHITECTURE.md](ARCHITECTURE.md) |

## 6. Scaling path (when it is needed, not before)

| Pressure | Change |
| --- | --- |
| Many concurrent swipes | Postgres with the same transaction, or Redis `SET` plus a Lua check for the reverse like, with a reconciliation job (video 2) |
| Feed ranking cost | A background worker precomputes stacks into Redis lists per user; the API only pops ids |
| Seen set size | Bloom filter per user in Redis in front of the `swipes` table |
| Location | Geohash prefix per user, sharded by region (videos 1 and 3); search via Elasticsearch geo queries |
| Realtime fan out | Socket.IO Redis adapter, sticky sessions, rooms pinned by code |
| Photos | Upload to object storage with signed URLs, CDN delivery, blurred until a chosen Bond level |
| Notifications | Outbox table and a worker for push and email |
| Ephemeral chat | `expires_at` on messages and a sweeper, or a TTL index (video 6) |
