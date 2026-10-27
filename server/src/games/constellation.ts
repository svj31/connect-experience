import { actionType, isObject, type GameDef, type UserId } from "./types.js";

export interface Star {
  id: number;
  uid: UserId;
  x: number;
  y: number;
  z: number;
}

export interface ConstellationState {
  stars: Star[];
  nextId: number;
  name: string | null;
  done: boolean;
}

export const MAX_STARS = 24;

const coord = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= -1 && v <= 1 ? Math.round(v * 1000) / 1000 : null);

export const constellation: GameDef<ConstellationState> = {
  id: "constellation",
  name: "Constellation",
  init() {
    return { stars: [], nextId: 1, name: null, done: false };
  },
  reduce(state, userId, action) {
    const type = actionType(action);
    if (type === "place") {
      if (state.done) return { error: "This sky is named. Start a new one." };
      if (!isObject(action)) return { error: "Bad position" };
      const x = coord(action.x), y = coord(action.y), z = coord(action.z);
      if (x === null || y === null || z === null) return { error: "Bad position" };
      if (state.stars.length >= MAX_STARS) return { error: "The sky is full. Give it a name." };
      return { state: { ...state, stars: [...state.stars, { id: state.nextId, uid: userId, x, y, z }], nextId: state.nextId + 1 } };
    }
    if (type === "undo") {
      if (state.done) return { error: "Already named" };
      const index = state.stars.map((s) => s.uid).lastIndexOf(userId);
      if (index === -1) return { error: "No star of yours to remove" };
      return { state: { ...state, stars: state.stars.filter((_, i) => i !== index) } };
    }
    if (type === "name") {
      if (state.done) return { error: "Already named" };
      if (state.stars.length < 3) return { error: "Place at least three stars first" };
      const name = isObject(action) && typeof action.name === "string" ? action.name.trim() : "";
      if (name.length < 2 || name.length > 40) return { error: "Name needs 2 to 40 characters" };
      return {
        state: { ...state, name, done: true },
        events: [{ type: "moment", title: `Constellation named "${name}"`, data: { name, stars: state.stars } }],
      };
    }
    if (type === "reset") {
      return { state: { stars: [], nextId: state.nextId, name: null, done: false } };
    }
    return { error: "Unknown action" };
  },
  view(state) {
    return { ...state, max: MAX_STARS };
  },
};
