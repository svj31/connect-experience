export interface QueueEntry {
  userId: number;
  socketId: string;
  activity: string;
  interests: string[];
  joinedAt: number;
}

/**
 * Picks the best waiting partner for a seeker: same activity (or either chose "any"),
 * never blocked in either direction, most shared interests first, then whoever waited longest.
 */
export function pickPartner(
  seeker: QueueEntry,
  queue: QueueEntry[],
  isBlocked: (a: number, b: number) => boolean,
): QueueEntry | null {
  let best: QueueEntry | null = null;
  let bestShared = -1;
  for (const candidate of queue) {
    if (candidate.userId === seeker.userId) continue;
    const activityOk = candidate.activity === seeker.activity || candidate.activity === "any" || seeker.activity === "any";
    if (!activityOk || isBlocked(seeker.userId, candidate.userId)) continue;
    const shared = candidate.interests.filter((i) => seeker.interests.includes(i)).length;
    if (shared > bestShared || (shared === bestShared && best && candidate.joinedAt < best.joinedAt)) {
      best = candidate;
      bestShared = shared;
    }
  }
  return best;
}
