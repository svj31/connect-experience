import { proximity } from "./geo.js";

/**
 * The recommendation step of Discover. The candidate pool (who you may see at all) is
 * decided by privacy, blocks, mutual preference and what you already swiped. This module
 * only orders that pool, and it is pure so it can be unit tested and later moved into a
 * background job that precomputes stacks.
 */
export interface Candidate {
  id: number;
  vibe: number | null;
  distanceKm: number | null;
  /** Hours since they were last active. */
  idleHours: number | null;
  /** Days since they joined. */
  ageDays: number;
  completeness: number;
  likedYou: boolean;
}

export const FEED_WEIGHTS = { vibe: 0.45, proximity: 0.2, activity: 0.15, newcomer: 0.05, completeness: 0.05, likedYou: 0.1 };

export function feedScore(c: Candidate): number {
  const w = FEED_WEIGHTS;
  const vibe = (c.vibe ?? 40) / 100;
  // Active today counts fully; a week away counts for little.
  const activity = c.idleHours === null ? 0.2 : Math.max(0, 1 - c.idleHours / 168);
  // New members get a short boost so they are seen while they are still deciding to stay.
  const newcomer = c.ageDays < 7 ? 1 - c.ageDays / 7 : 0;
  return (
    w.vibe * vibe +
    w.proximity * proximity(c.distanceKm) +
    w.activity * activity +
    w.newcomer * newcomer +
    w.completeness * (c.completeness / 100) +
    w.likedYou * (c.likedYou ? 1 : 0)
  );
}

/** Best first. Ties keep a stable order by id so the stack does not reshuffle. */
export function rankFeed(candidates: Candidate[]): number[] {
  return candidates
    .map((c) => ({ id: c.id, s: feedScore(c) }))
    .sort((a, b) => b.s - a.s || a.id - b.id)
    .map((c) => c.id);
}

/**
 * Per member stack of ranked ids, kept for a few minutes so swiping does not re-rank the
 * whole pool on every card. A swipe removes one id; profile or settings changes drop the
 * stack. In production this is a Redis list per user with the same TTL.
 */
export class FeedCache {
  private stacks = new Map<number, { ids: number[]; expires: number }>();
  constructor(private ttlMs = 3 * 60_000, private now = () => Date.now()) {}

  get(userId: number): number[] | null {
    const entry = this.stacks.get(userId);
    if (!entry || entry.expires < this.now()) {
      this.stacks.delete(userId);
      return null;
    }
    return entry.ids;
  }

  set(userId: number, ids: number[]) {
    this.stacks.set(userId, { ids, expires: this.now() + this.ttlMs });
  }

  remove(userId: number, targetId: number) {
    const entry = this.stacks.get(userId);
    if (entry) entry.ids = entry.ids.filter((id) => id !== targetId);
  }

  invalidate(userId: number) {
    this.stacks.delete(userId);
  }
}
