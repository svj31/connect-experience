"use client";

import { useEffect, useRef, useState } from "react";
import { AVATAR_COLORS, AVATAR_FACES, AVATAR_PATTERNS, AVATAR_RINGS, AVATAR_SHAPES, type AvatarConfig } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { Icon } from "../ui/Icon";

const next = <T,>(list: readonly T[], v: T) => list[(list.indexOf(v) + 1) % list.length];

/** Build-a-planet preview: each tap changes one part of the avatar. */
export function AvatarPlayground() {
  const [a, setA] = useState<AvatarConfig>({ shape: "circle", color: "violet", ring: "tilted", pattern: "swirl", face: "smile" });
  const controls: [string, keyof AvatarConfig, readonly string[]][] = [
    ["Shape", "shape", AVATAR_SHAPES],
    ["Color", "color", AVATAR_COLORS.slice(0, 8)],
    ["Rings", "ring", AVATAR_RINGS],
    ["Surface", "pattern", AVATAR_PATTERNS],
    ["Mood", "face", AVATAR_FACES],
  ];
  return (
    <div className="rounded-[24px] border border-line bg-surface p-6 shadow-[var(--shadow)]">
      <div className="flex justify-center">
        <div key={JSON.stringify(a)} className="animate-pop">
          <div className="animate-float"><Avatar name="Your planet" config={a} size={150} /></div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {controls.map(([label, key, list]) => (
          <button
            key={key}
            onClick={() => setA((p) => ({ ...p, [key]: next(list, p[key] as string) }))}
            className="flex items-center gap-1.5 rounded-xl border border-line-strong px-3 py-2 text-sm font-semibold hover:border-violet hover:bg-violet-soft hover:text-violet"
          >
            <Icon name="refresh" size={14} /> {label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-muted">Tap to try it. 8,640 combinations, no photos needed.</p>
    </div>
  );
}

const INTERESTS = ["music", "travel", "books", "food", "astronomy", "gaming"];

/** A preview of how Vibe Match explains itself. Toggle what you like and watch the reasons change. */
export function VibeDemo() {
  const theirs = ["music", "travel", "astronomy", "coffee"];
  const [mine, setMine] = useState<string[]>(["music", "books"]);
  const [sameIntent, setSameIntent] = useState(true);
  const shared = mine.filter((i) => theirs.includes(i));
  const interestFit = Math.min(1, shared.length / Math.min(3, Math.max(1, mine.length)));
  const score = Math.round((interestFit * 30 + (sameIntent ? 1 : 0.3) * 20 + 0.75 * 20 + 0.8 * 15) / 85 * 100);
  const reasons = [shared.length ? `You both love ${shared.join(" and ")}` : null, sameIntent ? "You want the same kind of connection" : null, "Similar answers on the Vibe Quiz"].filter(Boolean);
  return (
    <div className="rounded-[24px] border border-line bg-surface p-6 shadow-[var(--shadow)]">
      <div className="flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" strokeWidth="9" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--violet)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(score / 100) * 264} 264`} style={{ transition: "stroke-dasharray 0.6s ease" }} />
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold" aria-live="polite">{score}</span>
            <span className="text-xs font-semibold text-muted">Vibe</span>
          </span>
        </div>
        <ul className="space-y-1.5 text-sm">
          {reasons.map((r) => (
            <li key={r} className="flex animate-rise items-start gap-2"><Icon name="sparkle" size={16} className="mt-0.5 shrink-0 text-rose" />{r}</li>
          ))}
        </ul>
      </div>
      <p className="mt-5 text-sm font-semibold">Your interests</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {INTERESTS.map((i) => {
          const on = mine.includes(i);
          return (
            <button key={i} aria-pressed={on} onClick={() => setMine((m) => (on ? m.filter((x) => x !== i) : [...m, i]))} className={`rounded-full border px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${on ? "border-transparent bg-brand" : "border-line-strong hover:border-violet"}`}>
              {i}
            </button>
          );
        })}
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={sameIntent} onChange={(e) => setSameIntent(e.target.checked)} className="h-4 w-4 accent-[var(--violet)]" />
        Both looking for something long-term
      </label>
      <p className="mt-3 text-xs text-muted">A preview with a sample profile. Real scores use interests, intent, the Vibe Quiz, lifestyle, love language and city, and always show the breakdown.</p>
    </div>
  );
}

export const LEVELS = [
  { name: "Stardust", min: 0, unlock: "Chat, play and watch together", hint: "Where every connection starts" },
  { name: "Spark", min: 30, unlock: "Work and study can be shared", hint: "A few moments in" },
  { name: "Orbit", min: 90, unlock: "Socials can be shared", hint: "You keep coming back" },
  { name: "Constellation", min: 200, unlock: "A named constellation badge", hint: "Many moments, many days" },
  { name: "Galaxy", min: 400, unlock: "Your own shared universe", hint: "The rarest bond" },
];

/** Click through the five bond levels and watch the orbit fill. */
export function BondExplorer({ autoplay = false }: { autoplay?: boolean }) {
  const [level, setLevel] = useState(2);
  const root = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  // Autoplay: the bond grows Stardust to Galaxy as the explorer scrolls through the screen. A click
  // hands control to the reader. Reduced motion keeps the default level.
  useEffect(() => {
    if (!autoplay || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const el = root.current;
      if (!el || touched.current) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(0.999, (vh * 0.85 - r.top) / (vh * 0.85 + r.height * 0.2)));
      setLevel((l) => (Math.floor(p * LEVELS.length) === l ? l : Math.floor(p * LEVELS.length)));
    };
    const on = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", on);
    };
  }, [autoplay]);
  return (
    <div ref={root} className="grid items-center gap-8 md:grid-cols-[1fr_1.1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-sm">
        <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
          {LEVELS.map((_, i) => (
            <ellipse
              key={i}
              cx="100" cy="100" rx={36 + i * 14} ry={20 + i * 8}
              fill="none"
              stroke={i <= level ? (i % 2 ? "var(--rose)" : "var(--violet)") : "var(--line)"}
              strokeWidth={i <= level ? 2.5 : 1.5}
              strokeDasharray={i <= level ? undefined : "4 5"}
              transform={`rotate(${-25 + i * 12} 100 100)`}
              style={{ transition: "stroke 0.4s ease" }}
            />
          ))}
          <circle cx="78" cy="100" r="9" fill="var(--violet)" className="animate-twinkle" style={{ transformOrigin: "78px 100px" }} />
          <circle cx="122" cy="100" r="9" fill="var(--rose)" className="animate-twinkle" style={{ transformOrigin: "122px 100px", animationDelay: "0.6s" }} />
          <path d="M100 112c-6-5-12-9-12-15a6 6 0 0 1 12-2.5 6 6 0 0 1 12 2.5c0 6-6 10-12 15z" fill="var(--violet)" className="animate-heartbeat" style={{ transformOrigin: "100px 104px" }} />
        </svg>
      </div>
      <div>
        <div role="tablist" aria-label="Bond levels" className="flex flex-wrap gap-2">
          {LEVELS.map((l, i) => (
            <button key={l.name} role="tab" aria-selected={i === level} onClick={() => { touched.current = true; setLevel(i); }} className={`rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${i === level ? "border-transparent bg-brand" : "border-line-strong bg-surface hover:border-violet"}`}>
              {i + 1}. {l.name}
            </button>
          ))}
        </div>
        <div key={level} role="tabpanel" className="mt-5 animate-rise rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-semibold text-rose">Level {level + 1}, from {LEVELS[level].min} bond points</p>
          <h3 className="mt-1 font-display text-3xl font-bold">{LEVELS[level].name}</h3>
          <p className="mt-1 text-muted">{LEVELS[level].hint}</p>
          <p className="mt-4 flex items-center gap-2 font-semibold"><Icon name="unlock" size={18} className="text-violet" /> {LEVELS[level].unlock}</p>
        </div>
        <p className="mt-4 text-sm text-muted">Points only come from things you actually did together: moments finished, answers given, messages and days you both showed up. Streaks count days in a row.</p>
      </div>
    </div>
  );
}

const SECTIONS = [
  { name: "Name, planet, interests", need: 0 },
  { name: "Bio and prompts", need: 0 },
  { name: "Lifestyle", need: 1 },
  { name: "Work and study", need: 2 },
  { name: "Socials", need: 3 },
];

/** Shows how a profile opens up as two people get closer. */
export function RevealDemo() {
  const [step, setStep] = useState(1);
  const labels = ["Strangers", "Connected", "Spark", "Orbit"];
  return (
    <div className="rounded-[24px] border border-line bg-surface p-6 shadow-[var(--shadow)]">
      <label htmlFor="reveal-range" className="text-sm font-semibold">How close are you? <span className="text-violet">{labels[step]}</span></label>
      <input id="reveal-range" type="range" min={0} max={3} value={step} onChange={(e) => setStep(Number(e.target.value))} className="mt-3 w-full accent-[var(--violet)]" />
      <ul className="mt-4 space-y-2">
        {SECTIONS.map((s) => {
          const open = step >= s.need;
          return (
            <li key={s.name} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors ${open ? "border-violet/40 bg-violet-soft" : "border-dashed border-line-strong"}`}>
              <span className={open ? "font-semibold" : "text-muted"}>{s.name}</span>
              <Icon name={open ? "unlock" : "lock"} size={16} className={open ? "text-violet" : "text-muted"} label={open ? "Visible" : "Hidden"} />
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted">These are the defaults. You choose who sees each section in Settings.</p>
    </div>
  );
}

const QUESTIONS = [
  { a: "Sunrise hike", b: "Late night walk", partner: "b" },
  { a: "Cook dinner together", b: "Try a new restaurant", partner: "a" },
  { a: "Stargaze in a desert", b: "Watch the northern lights", partner: "a" },
];

/** A round of Would You Rather against a sample partner, to show the hidden pick and the flip. */
export function WyrDemo() {
  const [round, setRound] = useState(0);
  const [pick, setPick] = useState<"a" | "b" | null>(null);
  const [agreed, setAgreed] = useState(0);
  const q = QUESTIONS[round % QUESTIONS.length];
  return (
    <div className="rounded-[24px] border border-line bg-surface p-6 shadow-[var(--shadow)]">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-violet">Would You Rather</span>
        <span className="text-muted">Agreed {agreed} of {round + (pick ? 1 : 0)}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(["a", "b"] as const).map((side) => {
          const mine = pick === side;
          const theirs = pick && q.partner === side;
          return (
            <button
              key={side}
              disabled={Boolean(pick)}
              onClick={() => {
                setPick(side);
                if (side === q.partner) setAgreed((n) => n + 1);
              }}
              className={`relative min-h-24 rounded-2xl border-2 p-4 text-left font-semibold transition-all ${mine ? "border-violet bg-violet-soft" : theirs ? "border-rose bg-rose-soft" : "border-line hover:-translate-y-0.5 hover:border-violet"}`}
            >
              {side === "a" ? q.a : q.b}
              <span className="mt-2 flex gap-1.5 text-xs font-bold">
                {mine && <span className="rounded-md bg-brand px-1.5 py-0.5 text-on-primary">You</span>}
                {theirs && <span className="animate-pop rounded-md bg-rose px-1.5 py-0.5 text-on-primary">Mira</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex min-h-10 items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {!pick ? "Mira has picked. Her answer stays hidden until you choose." : pick === q.partner ? "Same pick. That is a conversation starter." : "Different picks. Ask what wins it for her."}
        </p>
        {pick && (
          <button onClick={() => { setRound((r) => r + 1); setPick(null); }} className="shrink-0 rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-on-primary">Next</button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted">Sample partner. In the app both picks come from real people, live.</p>
    </div>
  );
}
