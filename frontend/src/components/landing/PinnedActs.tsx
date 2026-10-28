"use client";

/* eslint-disable @next/next/no-img-element -- remote demo portraits */
import { useEffect, useRef, useState } from "react";
import { ACTIVITIES } from "@/lib/activities";
import { Icon } from "../ui/Icon";
import { DEMO_FACES } from "./PhoneMockup";

/*
  Two pinned scroll acts for the landing page, inspired by gracefashion.ai: a "word sandwich" where a
  line splits and an image grows between its words, and a "fan out" where one match opens into many
  ways to meet. Each act owns a tall section with a sticky one-screen stage; one rAF loop reads the
  section's progress and writes transforms to the DOM directly (no re-render per frame).
  Reduced motion or no JavaScript: the acts render as plain, still sections.
*/

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Progress of t inside [a, b], eased. */
const seg = (t: number, a: number, b: number) => ease(clamp((t - a) / (b - a)));

function useReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const r = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced";
    if (r) {
      const t = setTimeout(() => setReduced(true), 0);
      return () => clearTimeout(t);
    }
  }, []);
  return reduced;
}

/** Calls draw(p) with the section's pinned progress (0 when the stage pins, 1 when it unpins). */
function usePinProgress(section: React.RefObject<HTMLElement | null>, draw: (p: number) => void, off: boolean) {
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });
  useEffect(() => {
    if (off) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = Math.max(1, r.height - window.innerHeight);
      drawRef.current(clamp(-r.top / travel));
    };
    const on = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [section, off]);
}

const BEATS = [
  { left: "Real", right: "people.", media: "portrait" as const },
  { left: "Honest", right: "prompts.", media: "prompt" as const },
  { left: "Shared", right: "moments.", media: "moment" as const },
];
const MOMENT = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&h=1200&fit=crop&q=80";

function Media({ kind }: { kind: (typeof BEATS)[number]["media"] }) {
  if (kind === "portrait") return <img src={DEMO_FACES.c} alt="" className="h-full w-full object-cover" />;
  if (kind === "moment") return <img src={MOMENT} alt="" className="h-full w-full object-cover" />;
  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1 bg-paper">
      <img src={DEMO_FACES.a} alt="" className="h-full w-full object-cover" />
      <div className="flex flex-col justify-center bg-surface p-[8%]">
        <span className="text-[0.55em] font-semibold text-muted">My ideal first date</span>
        <span className="mt-1 font-display text-[0.9em] leading-tight">Street food, then losing at Connect Four</span>
      </div>
      <div className="flex flex-col justify-center bg-violet-soft p-[8%]">
        <span className="text-[0.55em] font-semibold text-violet">My green flag is</span>
        <span className="mt-1 font-display text-[0.9em] leading-tight">I ask the second question</span>
      </div>
      <img src={DEMO_FACES.d} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

/**
 * Act one: "Meet people the way you'd want to be met." gives way to three beats in which a line splits
 * and an image grows between its words, then the last image opens to fill the screen.
 */
export function WordSandwich() {
  const reduced = useReduced();
  const section = useRef<HTMLElement>(null);
  const intro = useRef<HTMLParagraphElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const medias = useRef<(HTMLDivElement | null)[]>([]);
  const words = useRef<(HTMLSpanElement | null)[]>([]);

  usePinProgress(
    section,
    (p) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxW = Math.min(vw * (vw < 768 ? 0.42 : 0.3), 460);
      if (intro.current) {
        const k = seg(p, 0.02, 0.12);
        intro.current.style.opacity = String(1 - k);
        intro.current.style.transform = `translate3d(0, ${-k * 40}px, 0) scale(${1 - k * 0.06})`;
      }
      BEATS.forEach((_, i) => {
        // Each beat owns a slice of the act: open, hold, then hand over (the last one floods the screen).
        const start = 0.08 + i * 0.26;
        const open = seg(p, start, start + 0.12);
        const close = i < BEATS.length - 1 ? seg(p, start + 0.22, start + 0.28) : 0;
        const flood = i === BEATS.length - 1 ? seg(p, 0.86, 1) : 0;
        const row = rows.current[i];
        const media = medias.current[i];
        if (!row || !media) return;
        row.style.opacity = String(open > 0 ? 1 - close : 0);
        row.style.transform = `translate3d(0, ${close * -50 + (1 - open) * 30}px, 0)`;
        const w = open * maxW + flood * (vw - maxW);
        const h = open * maxW * 1.2 + flood * (vh - maxW * 1.2);
        media.style.width = `${w.toFixed(1)}px`;
        media.style.height = `${h.toFixed(1)}px`;
        media.style.borderRadius = `${(24 * (1 - flood)).toFixed(1)}px`;
        for (const side of [0, 1]) {
          const word = words.current[i * 2 + side];
          if (word) word.style.opacity = String(1 - flood);
        }
      });
    },
    reduced,
  );

  if (reduced) {
    return (
      <section aria-label="Real people, honest prompts, shared moments" className="mx-auto max-w-6xl space-y-10 px-4 py-24 sm:px-6">
        {BEATS.map((b) => (
          <div key={b.left} className="flex items-center justify-center gap-6 font-display text-4xl sm:text-6xl">
            <span>{b.left}</span>
            <div className="h-48 w-40 overflow-hidden rounded-[24px] text-xl sm:h-64 sm:w-52"><Media kind={b.media} /></div>
            <span>{b.right}</span>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={section} aria-label="Real people, honest prompts, shared moments" className="relative h-[360vh]">
      <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        <p ref={intro} className="absolute max-w-3xl px-6 text-center font-display text-4xl leading-[1.05] text-balance sm:text-6xl">
          Meet people the way you&apos;d want <span className="italic text-violet">to be met.</span>
        </p>
        {BEATS.map((b, i) => (
          <div key={b.left} ref={(el) => void (rows.current[i] = el)} className="absolute inset-0 flex items-center justify-center gap-[2.5vw] px-4 font-display text-[clamp(2rem,6vw,5.5rem)] leading-none" style={{ opacity: 0 }}>
            <span ref={(el) => void (words.current[i * 2] = el)} className="relative z-10">{b.left}</span>
            <div ref={(el) => void (medias.current[i] = el)} className="relative z-0 shrink-0 overflow-hidden text-[clamp(0.9rem,1.6vw,1.4rem)] shadow-[var(--shadow)]" style={{ width: 0, height: 0 }} aria-hidden="true">
              <Media kind={b.media} />
            </div>
            <span ref={(el) => void (words.current[i * 2 + 1] = el)} className="relative z-10 italic">{b.right}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Where each card lands around the centre, as fractions of the stage (x, y) plus a slight tilt.
 * Planned so no card reaches the header above or the caption below; phones get a narrower fan.
 */
const SPOTS: [number, number, number][] = [
  [-0.36, -0.22, -5], [0.36, -0.24, 4], [-0.4, 0.02, 3], [0.4, 0.02, -4], [-0.27, 0.22, 5], [0.27, 0.22, -3], [0, -0.28, 2],
];
/** Under 1024 px there is no room for a fan: the match rises and the cards fill a two column grid. */
const compactSpot = (i: number, vw: number, vh: number): [number, number, number] => {
  const row = Math.floor(i / 2);
  const lone = i === SPOTS.length - 1 && SPOTS.length % 2 === 1;
  const x = lone ? 0 : (i % 2 ? 1 : -1) * Math.min(vw * 0.245, 170);
  return [x, -vh * 0.14 + row * Math.max(64, vh * 0.11), i % 2 ? -2 : 2];
};

/** Act two: one "It's a Saath!" match opens into the many things you can do together. */
export function FanOut() {
  const reduced = useReduced();
  const section = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const core = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const picks = ACTIVITIES.slice(0, SPOTS.length);

  usePinProgress(
    section,
    (p) => {
      const compact = window.innerWidth < 1024;
      const vw = Math.min(window.innerWidth, 1200);
      const vh = window.innerHeight;
      const out = seg(p, 0.04, 0.55);
      // The match rises, but never past the site header (measured, since it differs by screen).
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 64;
      const rise = Math.max(0, Math.min(vh * 0.32, vh / 2 - Math.max(0, headerBottom) - (core.current?.offsetHeight ?? 70) / 2 - 16));
      if (core.current) core.current.style.transform = `translate(-50%, -50%) translate3d(0, ${compact ? (-rise * out).toFixed(1) : 0}px, 0) scale(${1 + 0.06 * (1 - out)})`;
      if (caption.current) {
        const k = seg(p, 0.55, 0.75);
        caption.current.style.opacity = String(k);
        caption.current.style.transform = `translate3d(-50%, ${(1 - k) * 24}px, 0)`;
      }
      cards.current.forEach((card, i) => {
        if (!card) return;
        // Pixel offsets from the centre: a fan on wide screens, a grid on narrow ones.
        const [x, y, r] = compact ? compactSpot(i, window.innerWidth, vh) : [SPOTS[i][0] * vw, SPOTS[i][1] * vh, SPOTS[i][2]];
        // Stagger: each card leaves the match a little after the one before.
        const k = seg(p, 0.04 + i * 0.035, 0.42 + i * 0.035);
        card.style.opacity = String(Math.min(1, k * 2));
        card.style.transform = `translate(-50%, -50%) translate3d(${(x * k).toFixed(1)}px, ${(y * k).toFixed(1)}px, 0) rotate(${(r * k).toFixed(2)}deg) scale(${(0.6 + 0.4 * k).toFixed(3)})`;
      });
    },
    reduced,
  );

  const card = (a: (typeof picks)[number]) => (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1f1c19] py-3 pr-5 pl-3 whitespace-nowrap shadow-[0_20px_40px_-20px_rgb(0_0_0/0.8)] max-md:w-[46vw] max-md:whitespace-normal max-md:gap-2 max-md:py-2 max-md:pr-3 max-md:pl-2">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2a2236] text-[#c4a8f0] max-md:h-8 max-md:w-8"><Icon name={a.id} size={18} /></span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-[#f4f1ec] max-md:text-xs">{a.name}</span>
        <span className="block text-xs text-[#f4f1ec]/60 max-md:text-[10px]">{a.minutes} together</span>
      </span>
    </div>
  );
  const match = (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#f4f1ec] py-2.5 pr-6 pl-2.5 whitespace-nowrap text-[#161412] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)] max-sm:gap-2 max-sm:py-2 max-sm:pr-4 max-sm:pl-2">
      <span className="flex -space-x-3">
        <img src={DEMO_FACES.a} alt="" className="h-12 w-12 rounded-full border-2 border-[#f4f1ec] object-cover max-sm:h-10 max-sm:w-10" />
        <img src={DEMO_FACES.b} alt="" className="h-12 w-12 rounded-full border-2 border-[#f4f1ec] object-cover max-sm:h-10 max-sm:w-10" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-2xl italic max-sm:text-xl">It&apos;s a Saath!</span>
        <span className="block text-xs text-[#6b645c]">Pick something to do together</span>
      </span>
    </div>
  );

  if (reduced) {
    return (
      <section aria-label="One match, ten ways to meet" className="bg-[#161412] px-4 py-24 text-[#f4f1ec] sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8">
          {match}
          <ul className="flex flex-wrap justify-center gap-3">{picks.map((a) => <li key={a.id}>{card(a)}</li>)}</ul>
          <p className="font-display text-4xl sm:text-6xl">One match. <span className="italic text-[#f2a900]">Ten ways to meet.</span></p>
        </div>
      </section>
    );
  }

  return (
    <section ref={section} aria-label="One match, ten ways to meet" className="relative h-[300vh] bg-[#161412] text-[#f4f1ec]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_50%,rgb(196_168_240/0.14),transparent)]" />
        <ul aria-label="Things to do together">
          {picks.map((a, i) => (
            <li key={a.id} ref={(el) => void (cards.current[i] = el)} className="absolute top-1/2 left-1/2" style={{ opacity: 0, transform: "translate(-50%, -50%) scale(0.6)" }}>
              {card(a)}
            </li>
          ))}
        </ul>
        <div ref={core} className="absolute top-1/2 left-1/2" style={{ transform: "translate(-50%, -50%)" }}>{match}</div>
        <div ref={caption} className="absolute bottom-[6vh] left-1/2 w-full max-w-3xl px-6 text-center" style={{ opacity: 0, transform: "translate3d(-50%, 24px, 0)" }}>
          <p className="font-display text-4xl leading-none sm:text-6xl">One match. <span className="italic text-[#f2a900]">Ten ways to meet.</span></p>
        </div>
      </div>
    </section>
  );
}
