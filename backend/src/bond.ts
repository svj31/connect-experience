/**
 * Bond: how much two connected people have actually done together.
 * Points come only from real activity at their shared space, so the number
 * can always be explained: moments finished, answers given, messages, active days.
 */

export const BOND_LEVELS = [
  { level: 1, name: "Stardust", min: 0, unlock: "Chat, play and watch together" },
  { level: 2, name: "Spark", min: 30, unlock: "Work and education can be shared" },
  { level: 3, name: "Orbit", min: 90, unlock: "Socials can be shared" },
  { level: 4, name: "Constellation", min: 200, unlock: "A named constellation badge for the two of you" },
  { level: 5, name: "Galaxy", min: 400, unlock: "Your own shared universe on the dashboard" },
] as const;

export interface PairStats {
  moments: number;
  messages: number;
  answers: number;
  /** Distinct calendar days (UTC, YYYY-MM-DD) with any message or moment. */
  activeDays: string[];
}

export interface Bond {
  level: number;
  name: string;
  points: number;
  nextName: string | null;
  /** Points still needed for the next level, or 0 at the top. */
  toNext: number;
  /** 0 to 1 progress inside the current level. */
  progress: number;
  streak: number;
  breakdown: { label: string; points: number }[];
}

export function bondPoints(stats: PairStats) {
  const breakdown = [
    { label: "Moments finished together", points: stats.moments * 12 },
    { label: "Answers in games", points: stats.answers * 2 },
    { label: "Messages", points: Math.min(stats.messages, 200) },
    { label: "Days you showed up", points: new Set(stats.activeDays).size * 6 },
  ];
  return { points: breakdown.reduce((s, b) => s + b.points, 0), breakdown };
}

/**
 * Consecutive days with activity, ending today or yesterday (so a streak is not lost
 * before the day is over). Dates are YYYY-MM-DD strings.
 */
export function streakDays(days: string[], today = new Date()): number {
  const set = new Set(days);
  const day = (offset: number) => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset)).toISOString().slice(0, 10);
  let start = set.has(day(0)) ? 0 : set.has(day(1)) ? 1 : -1;
  if (start < 0) return 0;
  let count = 0;
  while (set.has(day(start + count))) count++;
  return count;
}

export function computeBond(stats: PairStats, today = new Date()): Bond {
  const { points, breakdown } = bondPoints(stats);
  let index = 0;
  for (let i = 0; i < BOND_LEVELS.length; i++) if (points >= BOND_LEVELS[i].min) index = i;
  const current = BOND_LEVELS[index];
  const next = BOND_LEVELS[index + 1];
  return {
    level: current.level,
    name: current.name,
    points,
    nextName: next?.name ?? null,
    toNext: next ? next.min - points : 0,
    progress: next ? (points - current.min) / (next.min - current.min) : 1,
    streak: streakDays(stats.activeDays, today),
    breakdown,
  };
}
