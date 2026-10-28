"use client";

/* eslint-disable @next/next/no-img-element -- remote demo portraits */
import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "../ui/Icon";

/*
  Scroll motion for the existing landing sections. Same rules as ScrollMotion and PinnedActs: one rAF
  loop per component, transforms and opacity written straight to the DOM, content identical with
  motion off. Only "How it works" pins; the rest move as they pass through the screen.
*/

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const seg = (t: number, a: number, b: number) => ease(clamp((t - a) / (b - a)));

const reducedNow = () =>
  typeof window !== "undefined" && (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced");

/** "pin": progress through a tall section with a sticky stage. "enter": 0 as it enters, 1 at 40% from the top. "through": 0 entering, 1 leaving. */
function useScroll(ref: React.RefObject<HTMLElement | null>, mode: "pin" | "enter" | "through", draw: (p: number) => void) {
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });
  useEffect(() => {
    if (reducedNow()) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p =
        mode === "pin" ? clamp(-r.top / Math.max(1, r.height - vh)) : mode === "enter" ? clamp((vh - r.top) / (vh * 0.6)) : clamp((vh - r.top) / (vh + r.height));
      drawRef.current(p);
    };
    const on = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    // Images change sizes as they arrive; "load" does not bubble, so listen in the capture phase.
    window.addEventListener("load", on, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      window.removeEventListener("load", on, true);
    };
  }, [ref, mode]);
}

function useMotionOn() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (reducedNow()) return;
    const t = setTimeout(() => setOn(true), 0);
    return () => clearTimeout(t);
  }, []);
  return on;
}

/* 1. How it works: pinned. Each step comes to the front in turn; a bar fills underneath. */

interface Step { n: string; title: string; body: string; face: string }

function StepCard({ s }: { s: Step }) {
  return (
    <div className="h-full overflow-hidden rounded-[24px] border border-line bg-surface">
      <img src={s.face} alt="" className="aspect-[4/3] w-full object-cover" />
      <div className="p-6">
        <p className="font-display text-lg text-muted italic">Step {s.n}</p>
        <h3 className="mt-1 font-display text-2xl">{s.title}</h3>
        <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
      </div>
    </div>
  );
}

export function StepsAct({ steps, heading }: { steps: Step[]; heading: ReactNode }) {
  const on = useMotionOn();
  const section = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const stage = useRef<HTMLOListElement>(null);

  useScroll(section, "pin", (p) => {
    const vw = window.innerWidth;
    const shift = Math.min(vw * 0.34, 420);
    // A continuous "focus" position: 0 is step one, 2 is step three.
    const f = seg(p, 0.05, 0.85) * (steps.length - 1);
    // Cards scale to the room between the heading and the progress bar, whatever the screen.
    const room = stage.current?.clientHeight ?? 0;
    const tall = cards.current[0]?.offsetHeight ?? 1;
    const fit = room ? Math.min(1, (room - 24) / tall) : 1;
    cards.current.forEach((card, i) => {
      if (!card) return;
      const d = i - f;
      const a = Math.abs(d);
      card.style.transform = `translate(-50%, -50%) translate3d(${(d * shift * fit).toFixed(1)}px, 0, 0) scale(${((1 - Math.min(a, 1.4) * 0.14) * fit).toFixed(3)}) rotate(${(d * 2.5).toFixed(2)}deg)`;
      card.style.opacity = String(Math.max(0, 1 - Math.max(0, a - 0.15) * 0.62).toFixed(3));
      card.style.zIndex = String(10 - Math.round(a * 3));
      card.style.filter = `saturate(${(1 - Math.min(a, 1) * 0.5).toFixed(2)})`;
    });
    if (bar.current) bar.current.style.transform = `scaleX(${seg(p, 0.05, 0.85).toFixed(4)})`;
    labels.current.forEach((l, i) => {
      if (l) l.style.color = Math.round(f) === i ? "var(--ink)" : "var(--muted)";
    });
  });

  if (!on) {
    return (
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 pb-16 sm:px-6">
        {heading}
        <ol className="mt-14 grid gap-6 md:grid-cols-3">{steps.map((s) => <li key={s.n}><StepCard s={s} /></li>)}</ol>
      </section>
    );
  }

  return (
    <section ref={section} id="how" className="relative h-[300vh] scroll-mt-20">
      <div className="sticky top-16 flex h-[calc(100dvh-4rem)] flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-6xl shrink-0 px-4 pt-10 sm:px-6 lg:pt-14">{heading}</div>
        <ol ref={stage} className="relative min-h-0 flex-1" aria-label="Steps">
          {steps.map((s, i) => (
            <li key={s.n} ref={(el) => void (cards.current[i] = el)} className="absolute top-1/2 left-1/2 w-[min(78vw,380px)]" style={{ transform: "translate(-50%, -50%)" }}>
              <StepCard s={s} />
            </li>
          ))}
        </ol>
        <div className="mx-auto mb-8 w-full max-w-md shrink-0 px-6">
          <div className="flex justify-between text-sm font-semibold">
            {steps.map((s, i) => <span key={s.n} ref={(el) => void (labels.current[i] = el)} className="transition-colors">Step {s.n}</span>)}
          </div>
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-line"><div ref={bar} className="h-full origin-left bg-violet" style={{ transform: "scaleX(0)" }} /></div>
        </div>
      </div>
    </section>
  );
}

/* 2. Near you: a curved row. The card in the middle stands upright; cards to the sides lean back. */

export function CoverFlow({ people }: { people: { key: string; name: string; age: number; city: string; photo: string }[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLElement | null)[]>([]);

  useScroll(wrap, "through", (p) => {
    const t = track.current;
    if (!t) return;
    const vw = window.innerWidth;
    const travel = Math.max(0, t.scrollWidth - vw);
    t.style.transform = `translate3d(${(-travel * p).toFixed(1)}px, 0, 0)`;
    const mid = vw / 2;
    items.current.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = clamp(Math.abs(r.left + r.width / 2 - mid) / (vw * 0.6)) * Math.sign(r.left + r.width / 2 - mid);
      const inner = el.firstElementChild as HTMLElement | null;
      if (inner) inner.style.transform = `perspective(1200px) rotateY(${(-d * 28).toFixed(2)}deg) scale(${(1 - Math.abs(d) * 0.16).toFixed(3)})`;
    });
  });

  return (
    <div ref={wrap} className="mt-10 overflow-hidden" aria-label="Sample profiles">
      <div ref={track} className="flex w-max gap-4 px-[8vw] will-change-transform">
        {people.map((c, i) => (
          <figure key={c.key} ref={(el) => void (items.current[i] = el)} className="shrink-0">
            <div className="relative h-80 w-56 overflow-hidden rounded-[24px] bg-paper-deep shadow-[var(--shadow)]" style={{ transformOrigin: "center" }}>
              <img src={c.photo} alt="" loading="lazy" className="h-full w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-14 text-white">
                <span className="block font-display text-2xl">{c.name}, {c.age}</span>
                <span className="flex items-center gap-1 text-xs text-white/85"><Icon name="pin" size={12} />{c.city}</span>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}

/* 3. Vibe Match: a score that counts up and a ring that fills as the section scrolls in. */

export function VibeCounter({ score = 92, reasons }: { score?: number; reasons: string[] }) {
  const box = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const C = 2 * Math.PI * 30;

  useScroll(box, "enter", (p) => {
    const k = seg(p, 0.05, 0.9);
    if (num.current) num.current.textContent = String(Math.round(score * k));
    if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - (score / 100) * k));
    rows.current.forEach((row, i) => {
      if (!row) return;
      const r = seg(p, 0.2 + i * 0.18, 0.45 + i * 0.18);
      row.style.opacity = String(0.25 + 0.75 * r);
      row.style.transform = `translate3d(${((1 - r) * 16).toFixed(1)}px, 0, 0)`;
    });
  });

  return (
    <div ref={box} className="mt-8 flex items-center gap-5 rounded-[24px] border border-line bg-paper p-5">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="36" cy="36" r="30" fill="none" stroke="var(--line)" strokeWidth="6" />
          <circle ref={ring} cx="36" cy="36" r="30" fill="none" stroke="var(--violet)" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: C * (1 - score / 100) }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-2xl"><span ref={num}>{score}</span><span className="text-sm">%</span></span>
      </div>
      <ul className="min-w-0 space-y-1.5">
        {reasons.map((r, i) => (
          <li key={r} ref={(el) => void (rows.current[i] = el)} className="flex items-center gap-2 text-sm">
            <Icon name="sparkle" size={14} className="shrink-0 text-violet" />{r}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 4. Together: the category cards start as a deck in the middle, then deal out into the row. */

export function DeckSpread({ children, className = "" }: { children: ReactNode; className?: string }) {
  const grid = useRef<HTMLDivElement>(null);
  useScroll(grid, "enter", (p) => {
    const el = grid.current;
    if (!el) return;
    const kids = [...el.children] as HTMLElement[];
    const g = el.getBoundingClientRect();
    const cx = g.left + g.width / 2;
    const cy = g.top + g.height / 2;
    kids.forEach((kid, i) => {
      // Deal out while the row is in view: from its top at ~80% of the screen to ~45%.
      const k = seg(p, 0.3 + i * 0.05, 0.85 + i * 0.05);
      // Measure the resting place without the current transform.
      const prev = kid.style.transform;
      kid.style.transform = "";
      const r = kid.getBoundingClientRect();
      kid.style.transform = prev;
      const dx = cx - (r.left + r.width / 2);
      const dy = cy - (r.top + r.height / 2);
      kid.style.transform = `translate3d(${(dx * (1 - k)).toFixed(1)}px, ${(dy * (1 - k)).toFixed(1)}px, 0) rotate(${((i - (kids.length - 1) / 2) * 4 * (1 - k)).toFixed(2)}deg)`;
      kid.style.zIndex = String(kids.length - i);
      // Scroll drives the position directly; only the fade keeps its easing.
      kid.style.transition = "opacity 0.7s ease-out";
      kid.querySelectorAll<HTMLElement>("[data-pill]").forEach((pill, j) => {
        const q = seg(p, 0.6 + i * 0.05 + j * 0.03, 0.72 + i * 0.05 + j * 0.03);
        pill.style.opacity = String(0.2 + 0.8 * q);
        pill.style.transform = `translate3d(0, ${((1 - q) * 8).toFixed(1)}px, 0)`;
      });
    });
  });
  return <div ref={grid} className={className}>{children}</div>;
}

/* 6. Safety: each card's icon turns in and a check lands, one after another. */

export function SafetyChecklist({ items }: { items: { icon: string; title: string; body: string }[] }) {
  const list = useRef<HTMLUListElement>(null);
  const icons = useRef<(HTMLSpanElement | null)[]>([]);
  const checks = useRef<(HTMLSpanElement | null)[]>([]);
  useScroll(list, "enter", (p) => {
    items.forEach((_, i) => {
      const k = seg(p, 0.08 + i * 0.1, 0.32 + i * 0.1);
      const c = seg(p, 0.24 + i * 0.1, 0.4 + i * 0.1);
      const icon = icons.current[i];
      const check = checks.current[i];
      if (icon) icon.style.transform = `rotate(${((1 - k) * -90).toFixed(1)}deg) scale(${(0.7 + 0.3 * k).toFixed(3)})`;
      if (check) {
        check.style.opacity = String(c);
        check.style.transform = `scale(${(0.4 + 0.6 * c).toFixed(3)})`;
      }
    });
  });
  return (
    <ul ref={list} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s, i) => (
        <li key={s.title} className="flex h-full gap-4 rounded-[24px] border border-line bg-surface p-6">
          <span className="relative h-11 w-11 shrink-0">
            <span ref={(el) => void (icons.current[i] = el)} className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-soft text-violet"><Icon name={s.icon} size={20} /></span>
            <span ref={(el) => void (checks.current[i] = el)} className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-mint text-white ring-2 ring-surface" aria-hidden="true"><Icon name="check" size={11} /></span>
          </span>
          <span>
            <span className="block font-display text-xl">{s.title}</span>
            <span className="mt-1 block text-sm text-muted">{s.body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* 7. Final call to action: a soft light follows the pointer, and the last word underlines itself. */

export function Spotlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    const g = glow.current;
    if (!el || !g || reducedNow() || matchMedia("(pointer: coarse)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      g.style.opacity = "1";
      g.style.background = `radial-gradient(420px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgb(242 169 0 / 0.16), transparent 70%)`;
    };
    const leave = () => void (g.style.opacity = "0");
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <div ref={box} className={`relative ${className}`}>
      <div ref={glow} className="pointer-events-none absolute inset-0 z-10 rounded-[32px] opacity-0 transition-opacity duration-500" aria-hidden="true" />
      {Children.map(children, (c) => c)}
    </div>
  );
}

/** The underline that Spotlight draws, for the word it should sit under. */
export function DrawnUnderline({ children }: { children: ReactNode }) {
  const word = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  useScroll(word, "enter", (p) => {
    if (line.current) line.current.style.transform = `scaleX(${seg(p, 0.3, 0.95).toFixed(4)})`;
  });
  return (
    <span ref={word} className="relative inline-block">
      {children}
      <span ref={line} className="absolute right-0 -bottom-1 left-0 h-[3px] origin-left rounded-full bg-[#f2a900]" style={{ transform: "scaleX(1)" }} aria-hidden="true" />
    </span>
  );
}
