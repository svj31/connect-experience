import { actionType, isObject, type GameDef, type UserId } from "./types.js";

export interface Stroke {
  id: number;
  uid: UserId;
  color: string;
  size: number;
  points: [number, number][];
}

export interface DrawState {
  strokes: Stroke[];
  nextId: number;
  saved: number;
}

export const DRAW_COLORS = ["#1f1d1a", "#c2452d", "#1e6b66", "#d99a1e", "#3d7a3a", "#2f5f9e", "#ffffff"];
export const MAX_STROKES = 400;
export const MAX_POINTS = 600;

function parsePoints(value: unknown): [number, number][] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_POINTS) return null;
  const out: [number, number][] = [];
  for (const p of value) {
    if (!Array.isArray(p) || p.length !== 2) return null;
    const [x, y] = p;
    if (typeof x !== "number" || typeof y !== "number" || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    out.push([Math.min(1, Math.max(0, Math.round(x * 1000) / 1000)), Math.min(1, Math.max(0, Math.round(y * 1000) / 1000))]);
  }
  return out;
}

export const draw: GameDef<DrawState> = {
  id: "draw",
  name: "Draw Together",
  init() {
    return { strokes: [], nextId: 1, saved: 0 };
  },
  reduce(state, userId, action) {
    const type = actionType(action);
    if (type === "stroke") {
      if (!isObject(action)) return { error: "Bad stroke" };
      const points = parsePoints(action.points);
      if (!points) return { error: "Bad stroke" };
      const color = typeof action.color === "string" && DRAW_COLORS.includes(action.color) ? action.color : DRAW_COLORS[0];
      const size = typeof action.size === "number" ? Math.min(24, Math.max(1, Math.round(action.size))) : 4;
      if (state.strokes.length >= MAX_STROKES) return { error: "Canvas is full. Clear it or save it." };
      const stroke: Stroke = { id: state.nextId, uid: userId, color, size, points };
      return { state: { ...state, strokes: [...state.strokes, stroke], nextId: state.nextId + 1 } };
    }
    if (type === "undo") {
      const index = state.strokes.map((s) => s.uid).lastIndexOf(userId);
      if (index === -1) return { error: "Nothing of yours to undo" };
      return { state: { ...state, strokes: state.strokes.filter((_, i) => i !== index) } };
    }
    if (type === "clear") {
      return { state: { ...state, strokes: [] } };
    }
    if (type === "save") {
      if (state.strokes.length === 0) return { error: "Draw something first" };
      return {
        state: { ...state, saved: state.saved + 1 },
        events: [{ type: "moment", title: "A drawing you made together", data: { strokes: state.strokes } }],
      };
    }
    return { error: "Unknown action" };
  },
  view(state) {
    return { strokes: state.strokes, colors: DRAW_COLORS, saved: state.saved };
  },
};
