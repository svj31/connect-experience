import { actionType, isObject, other, type GameDef, type UserId } from "./types.js";

export interface StoryState {
  opener: string;
  lines: { uid: UserId; text: string }[];
  turn: UserId;
  max: number;
  done: boolean;
}

export const STORY_OPENERS = [
  "The train stopped in a town that was not on any map.",
  "We found a note tucked inside a second hand book.",
  "The power went out right as the cake came out of the oven.",
  "Every clock in the city started running backwards.",
  "A dog walked into the cafe carrying a small envelope.",
];

export const story: GameDef<StoryState> = {
  id: "story",
  name: "Story Chain",
  init(players, rand = Math.random) {
    const opener = STORY_OPENERS[Math.floor(rand() * STORY_OPENERS.length)];
    return { opener, lines: [], turn: players[0], max: 10, done: false };
  },
  reduce(state, userId, action, players) {
    if (state.done) return { error: "Story finished" };
    const type = actionType(action);
    if (type === "add") {
      if (userId !== state.turn) return { error: "It is your partner's turn" };
      const text = isObject(action) && typeof action.text === "string" ? action.text.trim() : "";
      if (text.length < 2 || text.length > 160) return { error: "Write 2 to 160 characters" };
      const lines = [...state.lines, { uid: userId, text }];
      if (lines.length >= state.max) {
        return {
          state: { ...state, lines, done: true },
          events: [{ type: "moment", title: "A story you wrote together", data: { opener: state.opener, lines } }],
        };
      }
      return { state: { ...state, lines, turn: other(players, userId) } };
    }
    if (type === "finish") {
      if (state.lines.length < 2) return { error: "Write at least two lines first" };
      return {
        state: { ...state, done: true },
        events: [{ type: "moment", title: "A story you wrote together", data: { opener: state.opener, lines: state.lines } }],
      };
    }
    return { error: "Unknown action" };
  },
  view(state) {
    return state;
  },
};
