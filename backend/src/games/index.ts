import { connect4 } from "./connect4.js";
import { deeptalk } from "./deeptalk.js";
import { constellation } from "./constellation.js";
import { draw } from "./draw.js";
import { insync } from "./insync.js";
import { memory } from "./memory.js";
import { story } from "./story.js";
import { ttl } from "./ttl.js";
import type { GameDef } from "./types.js";
import { watch } from "./watch.js";
import { wyr } from "./wyr.js";

export const ACTIVITY_IDS = ["deeptalk", "wyr", "insync", "ttl", "draw", "story", "constellation", "connect4", "memory", "watch"] as const;
export type ActivityId = (typeof ACTIVITY_IDS)[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GAMES: Record<ActivityId, GameDef<any>> = { deeptalk, wyr, insync, ttl, draw, story, constellation, connect4, memory, watch };

export function isActivity(value: unknown): value is ActivityId {
  return typeof value === "string" && (ACTIVITY_IDS as readonly string[]).includes(value);
}
