import { actionType, isObject, type GameDef } from "./types.js";

export interface WatchState {
  videoId: string | null;
  playing: boolean;
  /** Seconds into the video at updatedAt. */
  position: number;
  updatedAt: number;
}

/** Accepts a raw 11 character id or any common YouTube URL. */
export function parseVideoId(input: string): string | null {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return /^\/([\w-]{11})/.exec(url.pathname)?.[1] ?? null;
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      return /^\/(?:embed|shorts|live)\/([\w-]{11})/.exec(url.pathname)?.[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

export function currentPosition(state: WatchState, now = Date.now()): number {
  return state.playing ? state.position + (now - state.updatedAt) / 1000 : state.position;
}

const seconds = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 60 * 60 * 12 ? v : null);

export const watch: GameDef<WatchState> = {
  id: "watch",
  name: "Watch Together",
  init() {
    return { videoId: null, playing: false, position: 0, updatedAt: Date.now() };
  },
  reduce(state, _userId, action) {
    const type = actionType(action);
    const now = Date.now();
    if (type === "load") {
      const raw = isObject(action) && typeof action.url === "string" ? action.url : "";
      const videoId = parseVideoId(raw);
      if (!videoId) return { error: "Paste a YouTube link or video id" };
      return {
        state: { videoId, playing: false, position: 0, updatedAt: now },
        events: [{ type: "moment", title: "Watched a video together", data: { videoId } }],
      };
    }
    if (!state.videoId) return { error: "Load a video first" };
    const position = isObject(action) ? seconds(action.position) : null;
    if (type === "play") return { state: { ...state, playing: true, position: position ?? currentPosition(state, now), updatedAt: now } };
    if (type === "pause") return { state: { ...state, playing: false, position: position ?? currentPosition(state, now), updatedAt: now } };
    if (type === "seek") {
      if (position === null) return { error: "Bad position" };
      return { state: { ...state, position, updatedAt: now } };
    }
    return { error: "Unknown action" };
  },
  view(state) {
    return { videoId: state.videoId, playing: state.playing, position: currentPosition(state), serverTime: Date.now() };
  },
};
