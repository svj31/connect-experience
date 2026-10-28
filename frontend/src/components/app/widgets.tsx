"use client";

import Link from "next/link";
import { TitleWords } from "../ui/TitleWords";
import { PhotoPlanet } from "../ui/PhotoPlanet";
import { useEffect, useState, type ReactNode } from "react";
import { INTENT_SHORT, cap } from "@/lib/labels";
import type { AvatarConfig, Bond, PersonCard, Vibe } from "@/lib/types";
import { LogoMark } from "../brand/Logo";
import { Planet } from "../ui/Planet";
import { Icon } from "../ui/Icon";

export function PageHeader({ title, subtitle, actions, compact = false }: { title: string; subtitle?: ReactNode; icon?: string; actions?: ReactNode; /** For one-screen pages: no subtitle on phones, tighter spacing. */ compact?: boolean }) {
  return (
    <header className={`${compact ? "mb-4 items-start" : "mb-6 items-end"} flex flex-wrap justify-between gap-4`}>
      <div className="animate-rise">
        <h1 className="font-display text-[2.4rem] leading-none sm:text-5xl">
          <TitleWords text={title} />
        </h1>
        {subtitle && <p className={`mt-3 max-w-2xl text-muted ${compact ? "hidden sm:block" : ""}`}>{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Remembers the chosen layout per page, so a person's favourite view sticks. */
export function useView<T extends string>(key: string, initial: T): [T, (v: T) => void] {
  const [view, setView] = useState<T>(initial);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`sv_view_${key}`) as T | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setView(saved);
    } catch {
      // Storage may be blocked; the default view is fine.
    }
  }, [key]);
  return [
    view,
    (v: T) => {
      setView(v);
      try {
        window.localStorage.setItem(`sv_view_${key}`, v);
      } catch {
        // Ignore: the choice still applies for this visit.
      }
    },
  ];
}

export function ViewToggle<T extends string>({ value, onChange, options, label = "View" }: { value: T; onChange: (v: T) => void; options: { id: T; label: string; icon: string }[]; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-paper-deep p-1">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-all ${value === o.id ? "bg-surface text-ink shadow-[var(--shadow)]" : "text-muted hover:text-ink"}`}
        >
          <Icon name={o.icon} size={16} /> <span className="hidden sm:inline">{o.label}</span>
          <span className="sr-only sm:hidden">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Chip({ children, tone = "plain", className = "" }: { children: ReactNode; tone?: "plain" | "violet" | "rose" | "mint" | "sun"; className?: string }) {
  const tones = {
    plain: "border-line bg-paper-deep text-ink",
    violet: "border-transparent bg-violet-soft text-violet",
    rose: "border-transparent bg-rose-soft text-rose",
    mint: "border-transparent bg-mint-soft text-mint",
    sun: "border-transparent bg-sun-soft text-sun",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${tones[tone]} ${className}`}>{children}</span>;
}

/** A small ring showing Vibe Match out of 100. */
export function VibeRing({ score, size = 52 }: { score: number | null; size?: number }) {
  const value = score ?? 0;
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }} title={score === null ? "Not enough to compare yet" : `Vibe Match ${score}`}>
      <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--line)" strokeWidth="4" />
        {score !== null && <circle cx="20" cy="20" r="16" fill="none" stroke={value >= 70 ? "var(--violet)" : value >= 45 ? "var(--rose)" : "var(--muted)"} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(value / 100) * 100.5} 100.5`} />}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[0.8rem] font-extrabold">
        {score === null ? "?" : score}
        <span className="sr-only"> Vibe Match{score === null ? " not available yet" : ` out of 100`}</span>
      </span>
    </span>
  );
}

/** The full Vibe Match breakdown: each part, its weight and its score. */
export function VibeBreakdown({ vibe }: { vibe: Vibe }) {
  if (vibe.score === null) return <p className="text-sm text-muted">Not enough answers on both profiles to compare yet. Finishing the Vibe Quiz helps.</p>;
  return (
    <div>
      <div className="flex items-center gap-4">
        <VibeRing score={vibe.score} size={76} />
        <div>
          <p className="font-display text-2xl font-bold">{vibe.score >= 75 ? "Strong vibe" : vibe.score >= 55 ? "Good vibe" : vibe.score >= 35 ? "Some common ground" : "Different worlds"}</p>
          <p className="text-sm text-muted">A guide, not a verdict. Doing something together tells you more.</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2.5">
        {vibe.parts.map((p) => (
          <li key={p.key}>
            <div className="flex justify-between text-sm"><span className="font-semibold">{p.label}</span><span className="text-muted">{p.score} <span className="text-xs">(weight {p.weight})</span></span></div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-line"><div className="bg-brand h-full rounded-full transition-all duration-700" style={{ width: `${p.score}%` }} /></div>
          </li>
        ))}
      </ul>
      {vibe.reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {vibe.reasons.map((r) => <li key={r} className="flex gap-2 text-sm"><Icon name="sparkle" size={16} className="mt-0.5 shrink-0 text-rose" />{r}</li>)}
        </ul>
      )}
    </div>
  );
}

/**
 * The Bond orbit: two planets travel the bond's rings around a beating heart, opposite each other,
 * and the rings light up level by level. SVG animation only, slow and even, so it stays calm.
 */
export function BondOrbit({ bond, me, them, size = 220 }: { bond: Bond; me: { name: string; avatar?: Partial<AvatarConfig> }; them: { name: string; avatar?: Partial<AvatarConfig> }; size?: number }) {
  const ring = Math.max(0, Math.min(4, bond.level - 1));
  const rx = 40 + ring * 15;
  const ry = 22 + ring * 9;
  const tilt = -20 + ring * 9;
  const path = `M${110 - rx} 79 a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0`;
  const P = 56;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size * 0.72 }}>
      <svg viewBox="0 0 220 158" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx="110" cy="79" rx={40 + i * 15} ry={22 + i * 9} fill="none" stroke={i < bond.level ? (i % 2 ? "var(--rose)" : "var(--violet)") : "var(--line)"} strokeWidth={i < bond.level ? 2.2 : 1.2} strokeDasharray={i < bond.level ? undefined : "3 5"} transform={`rotate(${-20 + i * 9} 110 79)`} opacity={i === ring ? 1 : 0.55} />
        ))}
        <g transform="translate(110 84)">
          <g>
            <animateTransform attributeName="transform" type="scale" values="1;1.14;1;1.08;1" keyTimes="0;0.15;0.3;0.45;1" dur="1.6s" repeatCount="indefinite" />
            <path d="M0 8c-6-5-12-9-12-15a6 6 0 0 1 12-2.5 6 6 0 0 1 12 2.5c0 6-6 10-12 15z" fill="var(--violet)" />
          </g>
        </g>
        <g transform={`rotate(${tilt} 110 79)`}>
          {[me, them].map((who, i) => (
            <g key={i}>
              <animateMotion path={path} dur="16s" begin={i ? "-8s" : "0s"} repeatCount="indefinite" />
              <g transform={`rotate(${-tilt}) translate(${-P / 2} ${-P / 2})`}>
                <Planet config={who.avatar} size={P} />
              </g>
            </g>
          ))}
        </g>
      </svg>
      <span className="sr-only">Bond level {bond.level}, {bond.name}, {bond.points} points, between {me.name} and {them.name}</span>
    </div>
  );
}

export function BondMeter({ bond, compact = false }: { bond: Bond; compact?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-bold"><Icon name="orbit" size={16} className="text-violet" />{bond.name} <span className="font-normal text-muted">lv {bond.level}</span></span>
        {bond.streak > 0 && <span className="flex items-center gap-1 font-bold text-rose" title={`${bond.streak} day streak`}><Icon name="fire" size={15} />{bond.streak}<span className="sr-only"> day streak</span></span>}
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(bond.progress * 100)} aria-label={`Progress to ${bond.nextName ?? "the top level"}`}>
        <div className="bg-brand h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(4, bond.progress * 100)}%` }} />
      </div>
      {!compact && <p className="mt-1 text-xs text-muted">{bond.nextName ? `${bond.toNext} points to ${bond.nextName}` : "Top level reached"}</p>}
    </div>
  );
}

/** A photo first card for grids: the photo with name and age over it, then the prompt and actions. */
export function PersonTile({ person, href, actions, footer, className = "" }: { person: PersonCard; href?: string; actions?: ReactNode; footer?: ReactNode; className?: string }) {
  const km = person.distanceKm;
  const where = km === null || km === undefined ? person.city : km < 5 ? "Nearby" : `${km} km away`;
  const photo = person.photos?.[0] ?? person.avatar.photo;
  const media = (
    <div className="relative aspect-[4/5] overflow-hidden bg-paper-deep">
      <PhotoPlanet photo={photo} planet={person.avatar} alt="" loading="lazy" className="h-full w-full" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-16 text-white">
        <h3 className="font-display text-2xl leading-none font-extrabold">{person.displayName}{person.age ? <span className="ml-1.5 font-semibold text-white/90">{person.age}</span> : null}</h3>
        <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-white/85">
          {person.online && <span className="h-2 w-2 rounded-full bg-[#3ee6a0]" aria-label="Online" />}
          {where && <span className="flex items-center gap-1"><Icon name="pin" size={13} />{where}</span>}
        </p>
      </div>
      {person.vibe.score !== null && (
        <span className="glass absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold text-ink"><Icon name="sparkle" size={13} className="text-violet" />{person.vibe.score}%</span>
      )}
    </div>
  );
  return (
    <article className={`lift group flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-surface ${className}`}>
      {href ? <Link href={href} aria-label={`${person.displayName}${person.age ? `, ${person.age}` : ""}`}>{media}</Link> : media}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip tone="violet">{INTENT_SHORT[person.intent] ?? "Open"}</Chip>
          {person.interests.slice(0, 3).map((i) => <Chip key={i} tone={person.vibe.sharedInterests.includes(i) ? "rose" : "plain"}>{cap(i)}</Chip>)}
        </div>
        {person.vibe.reasons.length > 0 && <p className="mt-3 flex gap-1.5 text-sm font-bold text-violet"><Icon name="sparkle" size={16} className="mt-0.5 shrink-0" />{person.vibe.reasons[0]}</p>}
        {person.prompt ? (
          <blockquote className="mt-3 rounded-2xl bg-paper-deep p-3 text-sm">
            <span className="block text-xs font-bold text-muted">{person.prompt.text}</span>
            <span className="mt-0.5 block font-semibold">{person.prompt.answer}</span>
          </blockquote>
        ) : person.bio ? (
          <p className="mt-3 line-clamp-2 text-sm text-muted">{person.bio}</p>
        ) : null}
        {footer}
        {actions && <div className="mt-auto flex flex-wrap gap-2 pt-4">{actions}</div>}
      </div>
    </article>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[28px] border border-line bg-surface px-6 py-14 text-center">
      <div className="animate-float"><LogoMark size={88} live title="" /></div>
      <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">{title}</h2>
      <p className="mt-1 max-w-sm text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatTile({ label, value, icon, tone = "violet", hint }: { label: string; value: ReactNode; icon: string; tone?: "violet" | "rose" | "mint" | "sun"; hint?: string }) {
  const bg = { violet: "bg-violet-soft text-violet", rose: "bg-rose-soft text-rose", mint: "bg-mint-soft text-mint", sun: "bg-sun-soft text-sun" }[tone];
  return (
    <div className="lift rounded-2xl border border-line bg-surface p-4">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}><Icon name={icon} size={18} /></span>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className="text-sm font-semibold text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
