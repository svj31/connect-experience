"use client";

import type { AvatarConfig, Bond } from "@/lib/types";
import { Planet } from "../ui/Planet";

/**
 * The room's hero: "the space between you". Two planets on a night sky; the gap between them
 * closes as the bond grows (far at Stardust, nearly touching at Galaxy). Every finished moment is
 * a star in a small constellation that forms between them. A move sends a soft ripple from the
 * planet that made it; an away partner's planet dims.
 */

/** Star positions in the space between, as fractions (x across the gap, y of the band). */
const STARS: [number, number][] = [
  [0.5, 0.32], [0.38, 0.5], [0.62, 0.46], [0.46, 0.7], [0.58, 0.68], [0.3, 0.3], [0.7, 0.28], [0.5, 0.52],
  [0.34, 0.72], [0.66, 0.72], [0.42, 0.22], [0.56, 0.18],
];

export function TwoWorlds({
  me,
  them,
  bond,
  moments,
  partnerOnline,
  partnerTyping,
  pulseMe,
  pulsePartner,
}: {
  me: { name: string; avatar: Partial<AvatarConfig> };
  them: { name: string; avatar: Partial<AvatarConfig> } | null;
  bond: Bond | null;
  moments: number;
  partnerOnline: boolean;
  partnerTyping: boolean;
  pulseMe: number;
  pulsePartner: number;
}) {
  // 0 at the first level, 1 at the top: how far the two worlds have come together.
  const closeness = bond ? Math.min(1, ((bond.level - 1) + bond.progress) / 4) : 0;
  const gap = 30 - closeness * 16; // each planet's centre, in % from the middle
  const stars = STARS.slice(0, Math.min(moments, STARS.length));
  const lit = stars.length;

  const world = (who: "me" | "them", name: string, avatar: Partial<AvatarConfig>, pulse: number, away: boolean) => (
    <div
      className="absolute top-[56%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 transition-[left,opacity] duration-1000 ease-out"
      style={{ left: `${who === "me" ? 50 - gap : 50 + gap}%`, opacity: away ? 0.55 : 1 }}
    >
      <div className="relative h-[clamp(64px,22cqh,104px)] w-[clamp(64px,22cqh,104px)]">
        {pulse > 0 && <span key={pulse} className="sv-ripple absolute inset-[12%] rounded-full border-2 border-[#f2a900]" aria-hidden="true" />}
        <Planet config={avatar} className="h-full w-full" />
        {who === "them" && partnerTyping && (
          <span className="absolute -top-2 right-0 flex gap-1 rounded-full bg-[#f4f1ec] px-2.5 py-1.5" aria-label={`${name} is typing`}>
            {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#161412]" style={{ animationDelay: `${i * 120}ms` }} />)}
          </span>
        )}
      </div>
      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold whitespace-nowrap backdrop-blur">
        {who === "me" ? "You" : name}{who === "them" && away ? " · away" : ""}
      </span>
    </div>
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#161412] text-[#f4f1ec] [container-type:size]">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="tw-glow" cx="50%" cy="50%" r="45%">
            <stop offset="0" stopColor="#c4a8f0" stopOpacity={0.12 + closeness * 0.16} />
            <stop offset="1" stopColor="#c4a8f0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#tw-glow)" />
        {Array.from({ length: 34 }, (_, i) => (
          <circle key={i} cx={`${(i * 41.3) % 100}%`} cy={`${(i * 67.1) % 100}%`} r={i % 6 === 0 ? 1.3 : 0.8} fill="#f4f1ec" opacity={0.12 + (i % 4) * 0.06} />
        ))}
        {/* The shared constellation: faint lines join the stars you have earned together. */}
        <g transform={`translate(0 0)`}>
          {stars.slice(1).map(([x, y], i) => {
            const [px, py] = stars[i];
            const span = (v: number) => `${50 - gap + 10 + v * (gap * 2 - 20)}%`;
            return <line key={i} x1={span(px)} y1={`${py * 100}%`} x2={span(x)} y2={`${y * 100}%`} stroke="#f2a900" strokeOpacity="0.35" strokeWidth="1" />;
          })}
          {stars.map(([x, y], i) => (
            <circle key={i} cx={`${50 - gap + 10 + x * (gap * 2 - 20)}%`} cy={`${y * 100}%`} r={i === lit - 1 ? 3.4 : 2.6} fill="#f2a900" className="animate-twinkle" style={{ animationDelay: `${i * 0.3}s`, transformBox: "fill-box", transformOrigin: "center" }} />
          ))}
        </g>
      </svg>

      {world("me", me.name, me.avatar, pulseMe, false)}
      {them && world("them", them.name, them.avatar, pulsePartner, !partnerOnline)}

      <p className="absolute inset-x-0 top-3 px-4 text-center text-xs text-[#f4f1ec]/65">
        {moments === 0
          ? "Finish something together to light the first star."
          : <>
              {moments} {moments === 1 ? "star" : "stars"} between you
              {/* The bond detail is also in the header; very small screens keep just the stars. */}
              {bond && <span className="hidden min-[380px]:inline"> · {bond.name}{bond.nextName ? `, ${bond.toNext} points to ${bond.nextName}` : ""}</span>}
            </>}
      </p>
    </div>
  );
}
