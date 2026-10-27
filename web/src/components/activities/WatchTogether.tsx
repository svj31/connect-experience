"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ActionError, Panel, useAction, type ActivityProps } from "./shared";

/* Minimal typing for the YouTube IFrame API, which is loaded on demand. */
interface YTPlayer {
  loadVideoById(id: string, start?: number): void;
  cueVideoById(id: string, start?: number): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  getVideoData(): { video_id: string };
  destroy(): void;
}
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: object) => YTPlayer; PlayerState: { PLAYING: number } };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function WatchTogether({ game, act }: ActivityProps) {
  const { run, error, busy } = useAction(act);
  const [url, setUrl] = useState("");
  const holder = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [now, setNow] = useState(0);

  // Create the player once there is a video.
  useEffect(() => {
    if (!game.videoId || player.current || !holder.current) return;
    let cancelled = false;
    void loadYouTubeApi().then(() => {
      if (cancelled || !holder.current || !window.YT) return;
      // YouTube swaps its target for an iframe, so give it a node React does not manage.
      const target = document.createElement("div");
      target.className = "h-full w-full";
      holder.current.appendChild(target);
      player.current = new window.YT.Player(target, {
        videoId: game.videoId,
        playerVars: { controls: 0, disablekb: 1, modestbranding: 1, rel: 0, playsinline: 1 },
        events: { onReady: () => setReady(true) },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [game.videoId]);

  useEffect(() => () => player.current?.destroy(), []);

  // Follow the shared state: same video, same position, same play or pause.
  useEffect(() => {
    const p = player.current;
    if (!p || !ready || !game.videoId) return;
    const latency = (Date.now() - game.serverTime) / 1000;
    const target = game.position + (game.playing ? Math.max(0, latency) : 0);
    if (p.getVideoData().video_id !== game.videoId) {
      p.loadVideoById(game.videoId, target);
      if (!game.playing) p.pauseVideo();
      return;
    }
    if (Math.abs(p.getCurrentTime() - target) > 1.5) p.seekTo(target, true);
    if (game.playing) {
      p.playVideo();
      // Browsers can block playback that was not started by a click on this page.
      const check = setTimeout(() => setBlocked(p.getPlayerState() !== window.YT?.PlayerState.PLAYING), 1500);
      return () => clearTimeout(check);
    }
    p.pauseVideo();
  }, [game.videoId, game.playing, game.position, game.serverTime, ready]);

  useEffect(() => {
    const id = setInterval(() => setNow(player.current && ready ? player.current.getCurrentTime() : 0), 500);
    return () => clearInterval(id);
  }, [ready]);

  async function load(e: FormEvent) {
    e.preventDefault();
    if (await run({ type: "load", url })) setUrl("");
  }

  const position = () => player.current?.getCurrentTime() ?? game.position;

  return (
    <Panel title="Watch Together" subtitle="Play, pause and skip stay in sync for both of you.">
      <form onSubmit={load} className="mb-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="yt-url" className="sr-only">YouTube link</label>
        <input
          id="yt-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a YouTube link"
          className="h-11 flex-1 rounded-md border border-line-strong bg-surface px-3 focus:border-teal focus:outline-none"
        />
        <Button type="submit" variant="secondary" loading={busy} disabled={!url.trim()}>Load video</Button>
      </form>

      <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-paper-deep">
        {game.videoId ? (
          <div ref={holder} className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full" aria-label="Shared YouTube player" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted">
            <Icon name="watch" size={40} />
            <p className="max-w-xs text-sm">Paste a link above. A music video, a trailer, a talk you liked: whatever you want to share.</p>
          </div>
        )}
        {blocked && game.playing && (
          <button
            onClick={() => {
              player.current?.playVideo();
              setBlocked(false);
            }}
            className="absolute inset-0 flex items-center justify-center bg-ink/50 font-semibold text-white"
          >
            <span className="flex items-center gap-2 rounded-md bg-ink px-4 py-3"><Icon name="play" /> Your partner pressed play. Tap to join.</span>
          </button>
        )}
      </div>

      {game.videoId && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {game.playing ? (
            <Button onClick={() => run({ type: "pause", position: position() })}><Icon name="pause" size={16} /> Pause for both</Button>
          ) : (
            <Button onClick={() => run({ type: "play", position: position() })}><Icon name="play" size={16} /> Play for both</Button>
          )}
          <Button variant="secondary" onClick={() => run({ type: "seek", position: Math.max(0, position() - 10) })}>Back 10s</Button>
          <Button variant="secondary" onClick={() => run({ type: "seek", position: position() + 10 })}>Forward 10s</Button>
          <span className="ml-auto text-sm tabular-nums text-muted">{fmt(now)}</span>
        </div>
      )}
      <ActionError message={error} />
    </Panel>
  );
}
