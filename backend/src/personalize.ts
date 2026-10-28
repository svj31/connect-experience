import { DEEP_TALK, DRAW_PROMPTS, WATCH_PICKS } from "./content/questions.js";
import type { ActivityId } from "./games/index.js";

/** Which interests make each activity a good pick. */
const ACTIVITY_INTERESTS: Record<ActivityId, string[]> = {
  deeptalk: ["books", "writing", "poetry", "podcasts", "volunteering", "yoga"],
  wyr: ["travel", "food", "comedy", "coffee", "cooking"],
  insync: ["music", "films", "pets", "coffee"],
  ttl: ["comedy", "theatre", "writing", "startups"],
  draw: ["art", "photography", "fashion", "anime"],
  story: ["writing", "books", "poetry", "theatre", "anime"],
  constellation: ["astronomy", "science", "outdoors", "travel"],
  connect4: ["gaming", "board games", "tech", "cricket", "football"],
  memory: ["board games", "gaming", "pets", "science"],
  watch: ["films", "music", "anime", "comedy", "dance", "podcasts"],
};

/** Gentle defaults by what someone is looking for, so a new profile still gets ideas. */
const INTENT_PICKS: Record<string, ActivityId[]> = {
  "long-term": ["deeptalk", "insync"],
  "long-term-open": ["insync", "wyr"],
  "short-term-fun": ["ttl", "connect4"],
  "new-friends": ["memory", "story"],
  "not-sure": ["wyr", "draw"],
};

export interface ActivitySuggestion {
  id: ActivityId;
  reason: string;
  score: number;
}

/**
 * Ranks activities for one person, or for a pair when a partner is given.
 * Interests both people share count three times as much as one person's own.
 */
export function suggestActivities(
  me: { interests: string[]; intent: string },
  partner?: { name: string; interests: string[]; intent: string },
  played: Partial<Record<string, number>> = {},
): ActivitySuggestion[] {
  const shared = partner ? me.interests.filter((i) => partner.interests.includes(i)) : [];
  const out: ActivitySuggestion[] = [];
  for (const [id, tags] of Object.entries(ACTIVITY_INTERESTS) as [ActivityId, string[]][]) {
    const sharedHits = shared.filter((i) => tags.includes(i));
    const myHits = me.interests.filter((i) => tags.includes(i));
    const theirHits = partner ? partner.interests.filter((i) => tags.includes(i) && !sharedHits.includes(i)) : [];
    let score = sharedHits.length * 3 + myHits.length + theirHits.length;
    if (INTENT_PICKS[me.intent]?.includes(id)) score += 1;
    if (partner && INTENT_PICKS[partner.intent]?.includes(id)) score += 1;
    // Nudge towards things not tried yet, so suggestions do not repeat forever.
    score -= Math.min(played[id] ?? 0, 3) * 0.5;

    let reason: string;
    if (sharedHits.length) reason = `You both like ${sharedHits[0]}`;
    else if (partner && theirHits.length) reason = `${partner.name} is into ${theirHits[0]}`;
    else if (myHits.length) reason = `Because you like ${myHits[0]}`;
    else if (INTENT_PICKS[me.intent]?.includes(id)) reason = "Good for what you are looking for";
    else reason = "A good warm up for anyone";
    out.push({ id, reason, score });
  }
  return out.sort((a, b) => b.score - a.score);
}

export function watchPicks(interests: string[], limit = 4) {
  return [...WATCH_PICKS]
    .map((p, i) => ({ ...p, score: p.tags.filter((t) => interests.includes(t)).length * 10 - i }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ id, title, mood }) => ({ id, title, mood, url: `https://www.youtube.com/watch?v=${id}` }));
}

export function drawPrompts(interests: string[], limit = 3) {
  return [...DRAW_PROMPTS]
    .map((p, i) => ({ text: p.text, score: p.tags.filter((t) => interests.includes(t)).length * 10 - i }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((p) => p.text);
}

/** Same question for everyone on a given day, so friends can compare answers. */
export function questionOfTheDay(date = new Date()) {
  const light = DEEP_TALK.filter((q) => q.level < 3);
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  return light[dayNumber % light.length].text;
}
