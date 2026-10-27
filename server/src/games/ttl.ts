import { actionType, isObject, other, type GameDef, type UserId } from "./types.js";

export interface TtlState {
  round: number;
  total: number;
  author: UserId;
  statements: string[] | null;
  lie: number | null;
  guess: number | null;
  revealed: boolean;
  score: number;
  done: boolean;
}

export const ttl: GameDef<TtlState> = {
  id: "ttl",
  name: "Two Truths and a Lie",
  init(players) {
    return { round: 0, total: 2, author: players[0], statements: null, lie: null, guess: null, revealed: false, score: 0, done: false };
  },
  reduce(state, userId, action, players) {
    if (state.done) return { error: "Game finished" };
    const type = actionType(action);

    if (type === "submit") {
      if (userId !== state.author) return { error: "Your partner is writing this round" };
      if (state.statements) return { error: "Already submitted" };
      const raw = isObject(action) ? action.statements : undefined;
      const lie = isObject(action) ? action.lie : undefined;
      if (!Array.isArray(raw) || raw.length !== 3) return { error: "Write exactly three statements" };
      const statements = raw.map((s) => (typeof s === "string" ? s.trim() : ""));
      if (statements.some((s) => s.length < 3 || s.length > 120)) return { error: "Each statement needs 3 to 120 characters" };
      if (typeof lie !== "number" || !Number.isInteger(lie) || lie < 0 || lie > 2) return { error: "Mark which one is the lie" };
      return { state: { ...state, statements, lie } };
    }

    if (type === "guess") {
      if (userId === state.author) return { error: "You wrote these" };
      if (!state.statements) return { error: "Wait for your partner to write" };
      if (state.guess !== null) return { error: "Already guessed" };
      const index = isObject(action) ? action.index : undefined;
      if (typeof index !== "number" || !Number.isInteger(index) || index < 0 || index > 2) return { error: "Pick a statement" };
      const score = state.score + (index === state.lie ? 1 : 0);
      return { state: { ...state, guess: index, revealed: true, score } };
    }

    if (type === "next") {
      if (!state.revealed) return { error: "Finish this round first" };
      const round = state.round + 1;
      if (round >= state.total) {
        return {
          state: { ...state, done: true },
          events: [{ type: "moment", title: `Two Truths and a Lie: ${state.score} of ${state.total} lies caught`, data: { score: state.score } }],
        };
      }
      return { state: { ...state, round, author: other(players, state.author), statements: null, lie: null, guess: null, revealed: false } };
    }
    return { error: "Unknown action" };
  },
  view(state, userId) {
    const isAuthor = userId === state.author;
    return {
      round: state.round,
      total: state.total,
      role: isAuthor ? "author" : "guesser",
      statements: state.statements,
      lie: isAuthor || state.revealed ? state.lie : null,
      guess: state.guess,
      revealed: state.revealed,
      score: state.score,
      done: state.done,
    };
  },
};
