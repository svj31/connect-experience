"use client";

import { useEffect, useRef, useState } from "react";
import { ACTIVITIES, CATEGORIES, type ActivityInfo, type Category } from "@/lib/activities";
import type { ActivityId, AvatarConfig } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { Planet } from "../ui/Planet";

/**
 * Together as a small solar system. You sit at the centre; Talk, Play, Create and Watch are planets
 * on tilted orbits, drawn with the same planet art as avatars. Choosing a planet brings it to the
 * centre and its activities appear around it as moons. Everything is a real tab or button, and the
 * orbits stand still with reduced motion.
 */

/** Each world has its own character, built from the planet options members use. */
export const WORLDS: Record<Category, Partial<AvatarConfig>> = {
  talk: { color: "violet", face: "smile", pattern: "plain", ring: "single", shape: "circle", spin: "float" },
  play: { color: "coral", face: "grin", pattern: "spots", ring: "tilted", shape: "circle", spin: "wobble" },
  create: { color: "mint", face: "wink", pattern: "swirl", ring: "double", shape: "circle", spin: "breathe" },
  watch: { color: "sky", face: "calm", pattern: "bands", ring: "none", shape: "circle", spin: "steady" },
};

/** Orbit radius as a share of the stage, and where each planet starts (radians). */
/** Below this stage width the moons sit in a grid under the planet instead of on a ring. */
const COMPACT = 560;
/** Room a moon needs, so none is placed where it would be clipped. */
const MOON = { w: 230, h: 52, pad: 16, top: 64 };

/** The ellipse the moons sit on: as large as the stage allows, so no moon is ever clipped. */
function moonRing(w: number, h: number) {
  return { rx: w / 2 - MOON.w / 2 - MOON.pad, ry: h / 2 - MOON.top - MOON.h / 2 };
}

/** Planet box half sizes at scale 1 (art plus its name label below), for art size s. */
const planetHalf = (s: number) => ({ w: s * 0.62, h: s * 0.5 + 36 });

/** Largest scale at which the planet clears every moon on a ring rotated by `turn`. */
function fitFor(turn: number, n: number, w: number, h: number, s: number) {
  const { rx, ry } = moonRing(w, h);
  const half = planetHalf(s);
  let k = 1.3;
  for (let i = 0; i < n; i++) {
    const t = turn + (i / n) * Math.PI * 2;
    const dx = Math.abs(Math.cos(t) * rx);
    const dy = Math.abs(Math.sin(t) * ry);
    // Clear if either the gap across or the gap down is large enough.
    k = Math.min(k, Math.max((dx - MOON.w / 2 - 12) / half.w, (dy - MOON.h / 2 - 12) / half.h));
  }
  return k;
}

/** The ring rotation that leaves the most room for the planet: top first, or between the corners. */
function bestTurn(n: number, w: number, h: number, s: number) {
  const options = [-Math.PI / 2, -Math.PI / 2 + Math.PI / Math.max(n, 1)];
  return options.reduce((best, t) => (fitFor(t, n, w, h, s) > fitFor(best, n, w, h, s) ? t : best), options[0]);
}

/** Where moon i of n sits: on the ring on wide stages, in a two column grid on narrow ones. */
function moonSpot(i: number, n: number, w: number, h: number, s: number): [number, number] {
  if (w < COMPACT) {
    const row = Math.floor(i / 2);
    const lone = n % 2 === 1 && i === n - 1;
    return [lone ? w / 2 : i % 2 ? w * 0.75 : w * 0.25, h * 0.6 + row * 72]; // rows allow two line names
  }
  const { rx, ry } = moonRing(w, h);
  const t = bestTurn(n, w, h, s) + (i / Math.max(n, 1)) * Math.PI * 2;
  return [w / 2 + Math.cos(t) * rx, h / 2 + Math.sin(t) * ry];
}

/** How large the chosen planet may grow and still sit clear of its moons. */
function chosenScale(n: number, w: number, h: number, s: number) {
  if (w < COMPACT) return Math.min(1, (h * 0.36) / (s + 44));
  return Math.max(0.55, Math.min(1.3, fitFor(bestTurn(n, w, h, s), n, w, h, s)));
}

const ORBITS: Record<Category, { r: number; start: number; speed: number }> = {
  talk: { r: 0.42, start: -0.6, speed: 0.06 },
  play: { r: 0.42, start: 0.97, speed: 0.06 },
  create: { r: 0.42, start: 2.54, speed: 0.06 },
  watch: { r: 0.42, start: 4.11, speed: 0.06 },
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const r = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced";
    if (!r) return;
    const t = setTimeout(() => setReduced(true), 0);
    return () => clearTimeout(t);
  }, []);
  return reduced;
}

export function TogetherSystem({
  me,
  category,
  activity,
  forYou,
  onCategory,
  onActivity,
  onPreview,
}: {
  me: { name: string; avatar: Partial<AvatarConfig> };
  category: Category | null;
  activity: ActivityId | null;
  forYou: string[];
  onCategory: (c: Category | null) => void;
  onActivity: (a: ActivityId) => void;
  onPreview: (a: ActivityInfo | null) => void;
}) {
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const planets = useRef<Partial<Record<Category, HTMLDivElement | null>>>({});
  const [size, setSize] = useState({ w: 640, h: 480 });
  const [hover, setHover] = useState<Category | null>(null);
  // The whole system rests while the pointer is over it, so nobody has to chase a moving planet.
  const [resting, setResting] = useState(false);
  const angle = useRef(0);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One loop moves the four planets; it pauses while a world is hovered or chosen.
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const place = () => {
      const cx = size.w / 2;
      const cy = size.h / 2;
      const rx = Math.min(size.w, size.h * 1.5) * 0.42;
      const ry = Math.min(size.h, size.w) * 0.3;
      for (const c of CATEGORIES) {
        const el = planets.current[c.id];
        if (!el) continue;
        if (category) {
          // The chosen world glides to the centre; the others step back to the edges.
          // The chosen world glides to the centre (upper third on narrow stages); the others fade away.
          const chosen = c.id === category;
          const o = ORBITS[c.id];
          const a = o.start + angle.current;
          const x = chosen ? cx : cx + Math.cos(a) * rx * 1.25;
          const y = chosen ? (size.w < COMPACT ? size.h * 0.26 : cy) : cy + Math.sin(a) * ry * 1.25;
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${chosen ? chosenScale(ACTIVITIES.filter((x) => x.category === c.id).length, size.w, size.h, Math.min(size.w, size.h) * 0.24).toFixed(3) : 0.5})`;
          el.style.opacity = chosen ? "1" : "0";
          el.style.pointerEvents = chosen ? "auto" : "none";
          el.style.zIndex = chosen ? "20" : "1";
          continue;
        }
        const o = ORBITS[c.id];
        const a = o.start + angle.current;
        const depth = (Math.sin(a) + 1) / 2; // 0 at the back, 1 at the front
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry;
        const lift = hover === c.id ? 1.12 : 1;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${((0.72 + depth * 0.34) * lift).toFixed(3)})`;
        el.style.opacity = hover && hover !== c.id ? "0.45" : (0.6 + depth * 0.4).toFixed(2);
        el.style.zIndex = String(Math.round(depth * 10) + (hover === c.id ? 10 : 0));
        el.style.pointerEvents = "auto";
      }
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduced && !hover && !resting && !category) angle.current += dt * ORBITS.talk.speed * 2;
      place();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [size, hover, category, reduced, resting]);

  const moons = category ? ACTIVITIES.filter((a) => a.category === category) : [];

  return (
    <div ref={stage} onPointerEnter={() => setResting(true)} onPointerLeave={() => setResting(false)} className="relative h-full min-h-[300px] w-full overflow-hidden rounded-[28px] bg-[#161412] text-[#f4f1ec]">
      {/* Night sky: faint stars and the orbit itself, in the landing page's ink and plum. */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="tg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#c4a8f0" stopOpacity="0.18" />
            <stop offset="1" stopColor="#c4a8f0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#tg-glow)" />
        {Array.from({ length: 46 }, (_, i) => (
          <circle key={i} cx={`${(i * 37.7) % 100}%`} cy={`${(i * 61.3) % 100}%`} r={i % 7 === 0 ? 1.6 : 0.9} fill="#f4f1ec" opacity={0.18 + (i % 5) * 0.08} />
        ))}
        <ellipse
          cx={size.w / 2}
          cy={size.h / 2}
          rx={Math.min(size.w, size.h * 1.5) * 0.42}
          ry={Math.min(size.h, size.w) * 0.3}
          fill="none"
          stroke="#c4a8f0"
          strokeOpacity={category ? 0.08 : 0.3}
          strokeDasharray="3 7"
          style={{ transition: "stroke-opacity 0.6s ease" }}
        />
        {category && size.w >= COMPACT && <ellipse cx={size.w / 2} cy={size.h / 2} rx={moonRing(size.w, size.h).rx} ry={moonRing(size.w, size.h).ry} fill="none" stroke="#f2a900" strokeOpacity="0.28" strokeDasharray="2 6" />}
      </svg>

      {/* You, at the centre of your own system */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-[5] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 transition-all duration-700" style={{ opacity: category ? 0 : 1, transform: `translate(-50%, -50%) scale(${category ? 0.6 : 1})` }}>
        <span className="rounded-full shadow-[0_0_50px_10px_rgb(242_169_0/0.18)]">
          <Planet config={me.avatar} size={Math.round(Math.min(size.w, size.h) * 0.2)} />
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">You</span>
      </div>

      {/* The four worlds */}
      <div role="tablist" aria-label="Kinds of activity">
        {CATEGORIES.map((c) => {
          const count = ACTIVITIES.filter((a) => a.category === c.id).length;
          const chosen = category === c.id;
          const s = Math.round(Math.min(size.w, size.h) * 0.24);
          return (
            <div key={c.id} ref={(el) => void (planets.current[c.id] = el)} className="absolute top-0 left-0 will-change-transform" style={{ transition: category !== null || hover ? "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease" : "opacity 0.6s ease" }}>
              <button
                type="button"
                role="tab"
                aria-selected={chosen}
                aria-label={`${c.name}: ${c.blurb}, ${count} ${count === 1 ? "activity" : "activities"}`}
                onClick={() => onCategory(chosen ? null : c.id)}
                onPointerEnter={() => setHover(c.id)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(c.id)}
                onBlur={() => setHover(null)}
                className="group flex flex-col items-center gap-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2a900]"
              >
                <Planet config={WORLDS[c.id]} size={s} />
                <span className={`-mt-1 rounded-full px-3 py-1 text-center transition-colors ${chosen || hover === c.id ? "bg-[#f4f1ec] text-[#161412]" : "bg-white/10 text-[#f4f1ec] backdrop-blur"}`}>
                  <span className="block font-display text-lg leading-tight">{c.name}</span>
                  {!category && <span className="block text-[10px] opacity-70">{count} {count === 1 ? "activity" : "activities"}</span>}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Moons: the activities of the chosen world */}
      {category && (
        <ul aria-label={`${CATEGORIES.find((c) => c.id === category)?.name} activities`} role="tabpanel">
          {moons.map((a, i) => {
            const [x, y] = moonSpot(i, moons.length, size.w, size.h, Math.min(size.w, size.h) * 0.24);
            const picked = activity === a.id;
            const pick = forYou.includes(a.id);
            return (
              <li key={a.id} className="absolute z-30" style={{ left: x, top: y, transform: "translate(-50%, -50%)", animation: reduced ? undefined : `tg-moon-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 90}ms both` }}>
                <button
                  type="button"
                  aria-pressed={picked}
                  onClick={() => onActivity(a.id)}
                  onPointerEnter={() => onPreview(a)}
                  onPointerLeave={() => onPreview(null)}
                  onFocus={() => onPreview(a)}
                  onBlur={() => onPreview(null)}
                  style={size.w < COMPACT ? { width: Math.min(size.w / 2 - 14, 200) } : undefined}
                  className={`flex items-center gap-2.5 py-1.5 pr-4 pl-1.5 shadow-[0_14px_30px_-14px_rgb(0_0_0/0.9)] ${size.w < COMPACT ? "rounded-2xl" : "rounded-full whitespace-nowrap"} transition-all duration-300 hover:-translate-y-0.5 ${picked ? "bg-[#f4f1ec] text-[#161412]" : "bg-[#24201c] text-[#f4f1ec] hover:bg-[#2f2924]"} ${pick ? "ring-2 ring-[#f2a900]" : "ring-1 ring-white/10"}`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full ${picked ? "bg-[#161412] text-[#f2a900]" : "bg-[#2a2236] text-[#c4a8f0]"}`}><Icon name={a.id} size={17} /></span>
                  <span className="text-left leading-tight">
                    <span className="block text-sm font-semibold">{a.name}</span>
                    <span className="block text-[11px] opacity-65">{a.minutes}{pick ? " · for you" : ""}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {category && (
        <button type="button" onClick={() => onCategory(null)} className="absolute top-4 left-4 z-40 flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/20">
          <Icon name="arrowLeft" size={15} /> All worlds
        </button>
      )}
      {!category && <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs text-[#f4f1ec]/55">Choose a world to see what you can do there</p>}
    </div>
  );
}
