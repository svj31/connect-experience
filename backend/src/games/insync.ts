import { IN_SYNC } from "../content/questions.js";
import { actionType, isObject, other, shuffle, type GameDef, type UserId } from "./types.js";

export interface InSyncState {
  order: number[];
  round: number;
  total: number;
  subject: UserId;
  answer: number | null;
  guess: number | null;
  revealed: boolean;
  score: number;
  done: boolean;
}

const validOption = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 4;

export const insync: GameDef<InSyncState> = {
  id: "insync",
  name: "In Sync",
  init(players, rand) {
    const order = shuffle(IN_SYNC.map((_, i) => i), rand).slice(0, 6);
    return { order, round: 0, total: order.length, subject: players[0], answer: null, guess: null, revealed: false, score: 0, done: false };
  },
  reduce(state, userId, action, players) {
    if (state.done) return { error: "Game finished" };
    const type = actionType(action);
    const option = isObject(action) ? action.option : undefined;
    const question = IN_SYNC[state.order[state.round]];

    if (type === "answer") {
      if (userId !== state.subject) return { error: "Your partner is answering this one" };
      if (state.answer !== null) return { error: "Already answered" };
      if (!validOption(option)) return { error: "Pick one of the options" };
      return {
        state: { ...state, answer: option },
        events: [{ type: "answer", questionId: question.id, userId, answer: question.options[option] }],
      };
    }

    if (type === "guess") {
      if (userId === state.subject) return { error: "You are the one being guessed" };
      if (state.answer === null) return { error: "Wait for your partner to answer" };
      if (state.guess !== null) return { error: "Already guessed" };
      if (!validOption(option)) return { error: "Pick one of the options" };
      const score = state.score + (option === state.answer ? 1 : 0);
      return { state: { ...state, guess: option, revealed: true, score } };
    }

    if (type === "next") {
      if (!state.revealed) return { error: "Finish this round first" };
      const round = state.round + 1;
      if (round >= state.total) {
        return {
          state: { ...state, done: true },
          events: [{ type: "moment", title: `In Sync: ${state.score} of ${state.total} guessed right`, data: { score: state.score, total: state.total } }],
        };
      }
      return { state: { ...state, round, subject: other(players, state.subject), answer: null, guess: null, revealed: false } };
    }
    return { error: "Unknown action" };
  },
  view(state, userId) {
    const question = IN_SYNC[state.order[Math.min(state.round, state.total - 1)]];
    const isSubject = userId === state.subject;
    return {
      round: state.round,
      total: state.total,
      question: { id: question.id, prompt: question.prompt, options: question.options },
      role: isSubject ? "subject" : "guesser",
      subject: state.subject,
      answered: state.answer !== null,
      answer: isSubject || state.revealed ? state.answer : null,
      guess: state.guess,
      revealed: state.revealed,
      score: state.score,
      done: state.done,
    };
  },
};
