export type UserId = number;
export type Rand = () => number;

/** Side effects a reducer asks the realtime layer to persist. */
export type GameEvent =
  | { type: "moment"; title: string; data: Record<string, unknown> }
  | { type: "answer"; questionId: string; userId: UserId; answer: string };

export type GameResult<S> = { state: S; events?: GameEvent[] } | { error: string };

/** What the realtime layer knows about the pair, used to personalise a new game. */
export interface GameContext {
  /** Interests both players listed, most relevant first. */
  topics?: string[];
}

export interface GameDef<S> {
  id: string;
  name: string;
  init(players: [UserId, UserId], rand?: Rand, context?: GameContext): S;
  reduce(state: S, userId: UserId, action: unknown, players: [UserId, UserId]): GameResult<S>;
  /** What one player is allowed to see. Hides secrets such as the partner's pick. */
  view(state: S, userId: UserId): unknown;
}

export function shuffle<T>(items: T[], rand: Rand = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function other(players: [UserId, UserId], userId: UserId): UserId {
  return players[0] === userId ? players[1] : players[0];
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function actionType(action: unknown): string | undefined {
  return isObject(action) && typeof action.type === "string" ? action.type : undefined;
}
