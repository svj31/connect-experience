import { actionType, isObject, other, shuffle, type GameDef, type UserId } from "./types.js";

export const MEMORY_SYMBOLS = ["sun", "moon", "leaf", "wave", "key", "note", "kite", "cup"];

export interface MemoryState {
  deck: string[];
  matched: boolean[];
  open: number[];
  turn: UserId;
  moves: number;
  pairs: number;
  found: Record<UserId, number>;
  done: boolean;
}

export const memory: GameDef<MemoryState> = {
  id: "memory",
  name: "Memory Match",
  init(players, rand) {
    const deck = shuffle([...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS], rand);
    return { deck, matched: deck.map(() => false), open: [], turn: players[0], moves: 0, pairs: 0, found: {}, done: false };
  },
  reduce(state, userId, action, players) {
    const type = actionType(action);
    if (type === "flip") {
      if (state.done) return { error: "All pairs found" };
      if (userId !== state.turn) return { error: "Your partner is flipping" };
      const index = isObject(action) ? action.index : undefined;
      if (typeof index !== "number" || !Number.isInteger(index) || index < 0 || index >= state.deck.length) return { error: "Bad card" };
      // A pair that did not match stays face up until the next flip.
      const open = state.open.length === 2 ? [] : [...state.open];
      if (state.matched[index] || open.includes(index)) return { error: "That card is already up" };
      open.push(index);
      if (open.length < 2) return { state: { ...state, open } };

      const moves = state.moves + 1;
      const [a, b] = open;
      if (state.deck[a] === state.deck[b]) {
        const matched = [...state.matched];
        matched[a] = matched[b] = true;
        const pairs = state.pairs + 1;
        const found = { ...state.found, [userId]: (state.found[userId] ?? 0) + 1 };
        const done = pairs === MEMORY_SYMBOLS.length;
        // Finding a pair keeps the turn, like the table game.
        return {
          state: { ...state, matched, open: [], moves, pairs, found, done },
          events: done ? [{ type: "moment", title: `Memory Match cleared in ${moves} moves`, data: { moves, found } }] : undefined,
        };
      }
      return { state: { ...state, open, moves, turn: other(players, userId) } };
    }
    if (type === "restart") {
      if (!state.done) return { error: "Finish this board first" };
      return { state: memory.init(players) };
    }
    return { error: "Unknown action" };
  },
  view(state) {
    return {
      cards: state.deck.map((symbol, i) => ({ symbol: state.matched[i] || state.open.includes(i) ? symbol : null, matched: state.matched[i] })),
      open: state.open,
      turn: state.turn,
      moves: state.moves,
      pairs: state.pairs,
      found: state.found,
      done: state.done,
    };
  },
};
