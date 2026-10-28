"use client";

import { useEffect, useRef, useState } from "react";
import { WORLDS } from "../app/TogetherSystem";
import { Icon } from "./Icon";
import { Planet } from "./Planet";

/**
 * Gentle gesture hints, like a quiet tutorial. A small ink card under the top bar (away from the
 * controls it explains) shows a hand doing
 * the gesture (swipe a card, scroll, tap a world, like) with one line of text.
 * When: the first visit to a page, or after a long pause with no input on it. It never blocks,
 * any tap, scroll or key dismisses it, it shows at most once per visit, and reduced motion skips it.
 */

type Kind = "swipe" | "scroll" | "tap" | "like";

const IDLE_MS = 15000;
const FIRST_DELAY = 1400;

function Hand({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" className={className} aria-hidden="true">
      <path
        d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.9-2.5L4.3 15a1.5 1.5 0 0 1 2.3-1.9L9 15.5"
        fill="#f4f1ec"
        stroke="#161412"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Demo({ kind }: { kind: Kind }) {
  if (kind === "swipe")
    return (
      <div className="relative h-16 w-20">
        <div className="coach-card absolute inset-x-3 top-1 bottom-2 rounded-lg bg-[#f4f1ec]">
          <div className="h-2/3 rounded-t-lg bg-[#c4a8f0]" />
          <span className="coach-like absolute top-1 left-1 rounded-sm border border-[#6fd3a6] px-0.5 text-[7px] font-bold text-[#6fd3a6]">LIKE</span>
          <span className="coach-nope absolute top-1 right-1 rounded-sm border border-[#ff8a80] px-0.5 text-[7px] font-bold text-[#ff8a80]">NOPE</span>
        </div>
        <Hand className="coach-hand-swipe absolute -bottom-3 left-1/2" />
      </div>
    );
  if (kind === "scroll")
    return (
      <div className="relative h-16 w-14 overflow-hidden rounded-lg border border-white/15">
        <div className="coach-scroll space-y-1 p-1.5">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-3 rounded bg-white/20" style={{ width: `${90 - (i % 2) * 25}%` }} />)}
        </div>
        <Hand className="coach-hand-scroll absolute right-0 bottom-0" />
      </div>
    );
  if (kind === "like")
    return (
      <div className="relative h-16 w-16">
        <div className="absolute inset-1 rounded-lg bg-[#c4a8f0]" />
        <span className="coach-heart absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#f4f1ec] text-[#5b3a8c]"><Icon name="heart" size={13} /></span>
        <Hand className="coach-hand-like absolute -right-2 -bottom-4" />
      </div>
    );
  return (
    <div className="relative grid h-20 w-24 grid-cols-2 place-items-center gap-1">
      {(Object.keys(WORLDS) as (keyof typeof WORLDS)[]).map((w, i) => (
        <span key={w} className={i === 1 ? "coach-pick" : "opacity-60"}><Planet config={WORLDS[w]} size={34} /></span>
      ))}
      <Hand className="coach-hand-tap absolute" />
    </div>
  );
}

/** Shows the hint for `id` on first visit or after a long idle pause; `when` can veto (e.g. nothing to scroll). */
export function Coach({ id, kind, text, when = true }: { id: string; kind: Kind; text: string; when?: boolean }) {
  const [show, setShow] = useState(false);
  const shownThisVisit = useRef(false);

  useEffect(() => {
    if (!when) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced") return;
    let seen = false;
    try {
      seen = localStorage.getItem(`sv_coach_${id}`) === "1";
    } catch {
      // Storage blocked: fall back to the idle hint only.
    }
    let timer: ReturnType<typeof setTimeout>;
    const open = () => {
      if (shownThisVisit.current) return;
      shownThisVisit.current = true;
      setShow(true);
      try {
        localStorage.setItem(`sv_coach_${id}`, "1");
      } catch {
        // Ignore: it simply may show again next time.
      }
    };
    const arm = (ms: number) => {
      clearTimeout(timer);
      timer = setTimeout(open, ms);
    };
    // Any input closes an open hint and restarts the idle wait.
    const activity = () => {
      setShow(false);
      arm(IDLE_MS);
    };
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    arm(seen ? IDLE_MS : FIRST_DELAY);
    // Give the first-visit hint a moment on screen before input can dismiss it.
    const listen = setTimeout(() => events.forEach((e) => window.addEventListener(e, activity, { passive: true, capture: true })), seen ? 0 : FIRST_DELAY + 400);
    return () => {
      clearTimeout(timer);
      clearTimeout(listen);
      events.forEach((e) => window.removeEventListener(e, activity, { capture: true }));
    };
  }, [id, when]);

  if (!show) return null;
  return (
    // Clicks pass through the hint to whatever is under it (and dismiss it); only "Got it" is its own.
    // Swipe and like hints sit over the photo they explain; the others under the top bar.
    <div role="status" aria-live="polite" className={`coach-in pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 ${kind === "swipe" || kind === "like" ? "top-[46%] lg:pl-[340px]" : kind === "tap" ? "top-[200px] lg:pl-[340px] lg:pr-[400px]" : "top-[84px] sm:justify-end sm:px-6 lg:px-10"}`}>
      <div className="flex items-center gap-4 rounded-[22px] bg-[#161412] py-3 pr-3 pl-4 text-[#f4f1ec] shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/10">
        <Demo kind={kind} />
        <p className="max-w-[220px] text-sm leading-snug">{text}</p>
        <button type="button" onClick={() => setShow(false)} className="pointer-events-auto rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/20">Got it</button>
      </div>
    </div>
  );
}

/** Scroll hint for pages whose content is longer than the screen (the page or an inner panel). */
export function ScrollCoach({ id, text }: { id: string; text: string }) {
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    // Measure after content and images have settled.
    const t = setTimeout(() => {
      const doc = document.documentElement.scrollHeight - window.innerHeight > 80;
      const panel = [...document.querySelectorAll<HTMLElement>("main .overscroll-contain")].some((el) => el.scrollHeight - el.clientHeight > 80);
      setOverflows(doc || panel);
    }, 1200);
    return () => clearTimeout(t);
  }, [id]);
  return overflows ? <Coach key={id} id={id} kind="scroll" text={text} /> : null;
}
