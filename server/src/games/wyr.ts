import { WOULD_YOU_RATHER } from "../content/questions.js";
import { actionType, isObject, shuffle, type GameDef, type UserId } from "./types.js";

export interface WyrState {
  order: number[];
  round: number;
  total: number;
  picks: Record<UserId, "a" | "b">;
  revealed: boolean;
  results: { questionId: string; same: boolean }[];
  done: boolean;
}

export const wyr: GameDef<WyrState> = {
  id: "wyr",
  name: "Would You Rather",
  init(_players, rand) {
    const order = shuffle(WOULD_YOU_RATHER.map((_, i) => i), rand).slice(0, 5);
    return { order, round: 0, total: order.length, picks: {}, revealed: false, results: [], done: false };
  },
  reduce(state, userId, action, players) {
    const type = actionType(action);
    if (state.done) return { error: "Game finished" };
    const question = WOULD_YOU_RATHER[state.order[state.round]];

    if (type === "pick") {
      const choice = isObject(action) ? action.choice : undefined;
      if (choice !== "a" && choice !== "b") return { error: "Choose a or b" };
      if (state.revealed) return { error: "Round already revealed" };
      if (state.picks[userId]) return { error: "Already picked" };
      const picks: Record<UserId, "a" | "b"> = { ...state.picks, [userId]: choice };
      const bothPicked = players.every((p) => picks[p]);
      if (!bothPicked) return { state: { ...state, picks } };
      const same = picks[players[0]] === picks[players[1]];
      return {
        state: { ...state, picks, revealed: true, results: [...state.results, { questionId: question.id, same }] },
        events: players.map((p) => ({ type: "answer" as const, questionId: question.id, userId: p, answer: picks[p] })),
      };
    }

    if (type === "next") {
      if (!state.revealed) return { error: "Both players need to pick first" };
      const round = state.round + 1;
      if (round >= state.total) {
        const agreed = state.results.filter((r) => r.same).length;
        return {
          state: { ...state, done: true },
          events: [{ type: "moment", title: `Would You Rather: agreed on ${agreed} of ${state.total}`, data: { agreed, total: state.total } }],
        };
      }
      return { state: { ...state, round, picks: {}, revealed: false } };
    }
    return { error: "Unknown action" };
  },
  view(state, userId) {
    const question = WOULD_YOU_RATHER[state.order[Math.min(state.round, state.total - 1)]];
    const partnerEntry = Object.entries(state.picks).find(([id]) => Number(id) !== userId);
    return {
      round: state.round,
      total: state.total,
      question: { id: question.id, a: question.a, b: question.b },
      myPick: state.picks[userId] ?? null,
      partnerPicked: Boolean(partnerEntry),
      partnerPick: state.revealed && partnerEntry ? partnerEntry[1] : null,
      revealed: state.revealed,
      agreed: state.results.filter((r) => r.same).length,
      done: state.done,
    };
  },
};
