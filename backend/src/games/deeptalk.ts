import { DEEP_TALK } from "../content/questions.js";
import { actionType, isObject, shuffle, type GameDef, type UserId } from "./types.js";

export interface DeepTalkState {
  /** Indexes into DEEP_TALK, two cards from each depth, light to deep. */
  order: number[];
  round: number;
  answers: Record<UserId, string>;
  revealed: boolean;
  history: { questionId: string; text: string; answers: Record<UserId, string> }[];
  done: boolean;
}

/**
 * Deep Talk: one question card at a time, getting a little deeper each round.
 * Both people write an answer in secret and the two answers turn over together.
 */
export const deeptalk: GameDef<DeepTalkState> = {
  id: "deeptalk",
  name: "Deep Talk",
  init(_players, rand) {
    const pick = (level: number) =>
      shuffle(DEEP_TALK.map((q, i) => ({ q, i })).filter(({ q }) => q.level === level), rand).slice(0, 2).map(({ i }) => i);
    return { order: [...pick(1), ...pick(2), ...pick(3)], round: 0, answers: {}, revealed: false, history: [], done: false };
  },
  reduce(state, userId, action, players) {
    if (state.done) return { error: "This deck is finished" };
    const type = actionType(action);
    const card = DEEP_TALK[state.order[state.round]];

    if (type === "answer") {
      const text = isObject(action) && typeof action.text === "string" ? action.text.trim() : "";
      if (text.length < 2 || text.length > 280) return { error: "Write 2 to 280 characters" };
      if (state.revealed) return { error: "Answers are already showing" };
      if (state.answers[userId]) return { error: "You already answered this one" };
      const answers = { ...state.answers, [userId]: text };
      if (!players.every((p) => answers[p])) return { state: { ...state, answers } };
      return {
        state: { ...state, answers, revealed: true, history: [...state.history, { questionId: card.id, text: card.text, answers }] },
        events: players.map((p) => ({ type: "answer" as const, questionId: card.id, userId: p, answer: answers[p] })),
      };
    }

    if (type === "next") {
      if (!state.revealed) return { error: "Both of you answer first" };
      const round = state.round + 1;
      if (round >= state.order.length) {
        return {
          state: { ...state, done: true },
          events: [{ type: "moment", title: `Deep Talk: ${state.history.length} questions, answered honestly`, data: { cards: state.history.map((h) => ({ text: h.text, answers: Object.values(h.answers) })) } }],
        };
      }
      return { state: { ...state, round, answers: {}, revealed: false } };
    }
    return { error: "Unknown action" };
  },
  view(state, userId) {
    const card = DEEP_TALK[state.order[Math.min(state.round, state.order.length - 1)]];
    const partnerEntry = Object.entries(state.answers).find(([id]) => Number(id) !== userId);
    return {
      round: state.round,
      total: state.order.length,
      card: { id: card.id, level: card.level, text: card.text },
      myAnswer: state.answers[userId] ?? null,
      partnerAnswered: Boolean(partnerEntry),
      partnerAnswer: state.revealed && partnerEntry ? partnerEntry[1] : null,
      revealed: state.revealed,
      done: state.done,
    };
  },
};
