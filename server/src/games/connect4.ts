import { actionType, isObject, other, type GameDef, type UserId } from "./types.js";

export const ROWS = 6;
export const COLS = 7;

export interface Connect4State {
  board: UserId[][]; // board[row][col], row 0 is the top, 0 means empty
  turn: UserId;
  winner: UserId | null;
  line: [number, number][] | null;
  draw: boolean;
  wins: Record<UserId, number>;
  starter: UserId;
}

const empty = () => Array.from({ length: ROWS }, () => Array<UserId>(COLS).fill(0));

/** Returns the four winning cells that include (row, col), or null. */
export function findLine(board: UserId[][], row: number, col: number): [number, number][] | null {
  const who = board[row][col];
  if (!who) return null;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of directions) {
    const cells: [number, number][] = [[row, col]];
    for (const sign of [1, -1]) {
      let r = row + dr * sign, c = col + dc * sign;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === who) {
        cells.push([r, c]);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (cells.length >= 4) return cells;
  }
  return null;
}

export const connect4: GameDef<Connect4State> = {
  id: "connect4",
  name: "Connect Four",
  init(players) {
    return { board: empty(), turn: players[0], winner: null, line: null, draw: false, wins: {}, starter: players[0] };
  },
  reduce(state, userId, action, players) {
    const type = actionType(action);
    if (type === "drop") {
      if (state.winner || state.draw) return { error: "Round over. Start a rematch." };
      if (userId !== state.turn) return { error: "Not your turn" };
      const col = isObject(action) ? action.col : undefined;
      if (typeof col !== "number" || !Number.isInteger(col) || col < 0 || col >= COLS) return { error: "Bad column" };
      let row = -1;
      for (let r = ROWS - 1; r >= 0; r--) if (!state.board[r][col]) { row = r; break; }
      if (row === -1) return { error: "Column is full" };
      const board = state.board.map((r) => [...r]);
      board[row][col] = userId;
      const line = findLine(board, row, col);
      if (line) {
        const wins = { ...state.wins, [userId]: (state.wins[userId] ?? 0) + 1 };
        return {
          state: { ...state, board, winner: userId, line, wins },
          events: [{ type: "moment", title: "Connect Four round", data: { winner: userId, wins } }],
        };
      }
      const draw = board[0].every(Boolean);
      return { state: { ...state, board, draw, turn: draw ? state.turn : other(players, userId) } };
    }
    if (type === "rematch") {
      if (!state.winner && !state.draw) return { error: "Finish the round first" };
      const starter = other(players, state.starter);
      return { state: { ...state, board: empty(), turn: starter, starter, winner: null, line: null, draw: false } };
    }
    return { error: "Unknown action" };
  },
  view(state) {
    return state;
  },
};
