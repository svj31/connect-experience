import { describe, expect, it } from "vitest";
import { FeedCache, feedScore, rankFeed, type Candidate } from "../src/feed.js";
import { distanceKm, proximity } from "../src/geo.js";

const base: Candidate = { id: 1, vibe: 60, distanceKm: 0, idleHours: 1, ageDays: 30, completeness: 80, likedYou: false };

describe("geo", () => {
  it("measures city distances and ignores case", () => {
    expect(distanceKm("Mumbai", "mumbai")).toBe(0);
    expect(distanceKm("Mumbai", "Pune")).toBeGreaterThan(110);
    expect(distanceKm("Mumbai", "Pune")).toBeLessThan(140);
    expect(distanceKm("Mumbai", "Atlantis")).toBeNull();
  });

  it("scores proximity from 1 down to 0, with unknown as neutral", () => {
    expect(proximity(0)).toBe(1);
    expect(proximity(3000)).toBe(0);
    expect(proximity(null)).toBeCloseTo(0.4);
  });
});

describe("feed ranking", () => {
  it("prefers higher vibe, closer and more active people", () => {
    expect(feedScore({ ...base, vibe: 90 })).toBeGreaterThan(feedScore(base));
    expect(feedScore(base)).toBeGreaterThan(feedScore({ ...base, distanceKm: 1200 }));
    expect(feedScore(base)).toBeGreaterThan(feedScore({ ...base, idleHours: 200 }));
  });

  it("moves people who already liked you up the stack", () => {
    const ids = rankFeed([{ ...base, id: 1, vibe: 70 }, { ...base, id: 2, vibe: 60, likedYou: true }]);
    expect(ids).toEqual([2, 1]);
  });

  it("is stable for equal scores", () => {
    expect(rankFeed([{ ...base, id: 5 }, { ...base, id: 3 }, { ...base, id: 4 }])).toEqual([3, 4, 5]);
  });
});

describe("feed cache", () => {
  it("expires, removes swiped ids and invalidates", () => {
    let now = 0;
    const cache = new FeedCache(1000, () => now);
    cache.set(1, [10, 11, 12]);
    cache.remove(1, 11);
    expect(cache.get(1)).toEqual([10, 12]);
    now = 2000;
    expect(cache.get(1)).toBeNull();
    cache.set(1, [10]);
    cache.invalidate(1);
    expect(cache.get(1)).toBeNull();
  });
});
