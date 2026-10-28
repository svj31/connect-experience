"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { INTENT_SHORT, cap } from "@/lib/labels";
import type { AvatarConfig, Bond, PersonCard, Vibe } from "@/lib/types";
import { LogoMark } from "../brand/Logo";
import { Avatar } from "../ui/Avatar";
import { Icon } from "../ui/Icon";

export function PageHeader({ title, subtitle, icon, actions }: { title: string; subtitle?: ReactNode; icon?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="animate-rise">
        <h1 className="flex items-center gap-2.5 font-display text-3xl font-semibold sm:text-4xl">
          {icon && <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-soft text-violet"><Icon name={icon} size={22} /></span>}
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
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
    <div role="radiogroup" aria-label={label} className="flex rounded-xl border border-line bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors ${value === o.id ? "bg-violet text-on-primary" : "text-muted hover:text-violet"}`}
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
    plain: "border-line bg-paper text-ink",
    violet: "border-transparent bg-violet-soft text-violet",
    rose: "border-transparent bg-rose-soft text-rose",
    mint: "border-transparent bg-mint-soft text-mint",
    sun: "border-transparent bg-sun-soft text-sun",
  };
  return <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-bold ${tones[tone]} ${className}`}>{children}</span>;
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
          <p className="font-display text-2xl font-semibold">{vibe.score >= 75 ? "Strong vibe" : vibe.score >= 55 ? "Good vibe" : vibe.score >= 35 ? "Some common ground" : "Different worlds"}</p>
          <p className="text-sm text-muted">A guide, not a verdict. Doing something together tells you more.</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2.5">
        {vibe.parts.map((p) => (
          <li key={p.key}>
            <div className="flex justify-between text-sm"><span className="font-semibold">{p.label}</span><span className="text-muted">{p.score} <span className="text-xs">(weight {p.weight})</span></span></div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-violet transition-all duration-700" style={{ width: `${p.score}%` }} /></div>
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
 * The Bond orbit: two planets on rings that light up level by level, with the progress to
 * the next level drawn as an arc and the streak beside it.
 */
export function BondOrbit({ bond, me, them, size = 220 }: { bond: Bond; me: { name: string; avatar?: Partial<AvatarConfig> }; them: { name: string; avatar?: Partial<AvatarConfig> }; size?: number }) {
  return (
    <div className="relative mx-auto" style={{ width: size, height: size * 0.72 }}>
      <svg viewBox="0 0 220 158" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx="110" cy="79" rx={40 + i * 15} ry={22 + i * 9} fill="none" stroke={i < bond.level ? (i % 2 ? "var(--rose)" : "var(--violet)") : "var(--line)"} strokeWidth={i < bond.level ? 2.2 : 1.2} strokeDasharray={i < bond.level ? undefined : "3 5"} transform={`rotate(${-20 + i * 9} 110 79)`} />
        ))}
        <path d="M110 92c-6-5-12-9-12-15a6 6 0 0 1 12-2.5 6 6 0 0 1 12 2.5c0 6-6 10-12 15z" fill="var(--violet)" className="animate-heartbeat" style={{ transformOrigin: "110px 84px" }} />
      </svg>
      <span className="absolute top-1/2 left-[6%] -translate-y-1/2 animate-float"><Avatar name={me.name} config={me.avatar} size={size * 0.22} decorative /></span>
      <span className="absolute top-1/2 right-[6%] -translate-y-1/2 animate-float [animation-delay:1.2s]"><Avatar name={them.name} config={them.avatar} size={size * 0.22} decorative /></span>
      <span className="sr-only">Bond level {bond.level}, {bond.name}, {bond.points} points</span>
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
        <div className="h-full rounded-full bg-rose transition-all duration-700" style={{ width: `${Math.max(4, bond.progress * 100)}%` }} />
      </div>
      {!compact && <p className="mt-1 text-xs text-muted">{bond.nextName ? `${bond.toNext} points to ${bond.nextName}` : "Top level reached"}</p>}
    </div>
  );
}

export function PersonTile({ person, href, actions, footer, className = "" }: { person: PersonCard; href?: string; actions?: ReactNode; footer?: ReactNode; className?: string }) {
  const details = [person.age, person.city].filter(Boolean).join(", ");
  return (
    <article className={`lift flex h-full flex-col rounded-3xl border border-line bg-surface p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <Avatar name={person.displayName} config={person.avatar} size={64} online={person.online} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-xl font-semibold">
            {href ? <Link href={href} className="hover:text-violet">{person.displayName}</Link> : person.displayName}
          </h3>
          <p className="truncate text-sm text-muted">{details || "Details hidden"}{person.pronouns ? ` · ${person.pronouns}` : ""}</p>
          <Chip tone="violet" className="mt-1.5">{INTENT_SHORT[person.intent] ?? "Open"}</Chip>
        </div>
        <VibeRing score={person.vibe.score} />
      </div>
      {person.vibe.reasons.length > 0 && <p className="mt-3 flex gap-1.5 text-sm font-semibold text-rose"><Icon name="sparkle" size={16} className="mt-0.5 shrink-0" />{person.vibe.reasons[0]}</p>}
      {person.prompt ? (
        <blockquote className="mt-3 rounded-2xl bg-paper-deep p-3 text-sm">
          <span className="block text-xs font-bold text-muted">{person.prompt.text}</span>
          <span className="mt-0.5 block font-semibold">{person.prompt.answer}</span>
        </blockquote>
      ) : person.bio ? (
        <p className="mt-3 line-clamp-2 text-sm text-muted">{person.bio}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {person.interests.slice(0, 5).map((i) => <Chip key={i} tone={person.vibe.sharedInterests.includes(i) ? "rose" : "plain"}>{cap(i)}</Chip>)}
      </div>
      {footer}
      {actions && <div className="mt-auto flex flex-wrap gap-2 pt-4">{actions}</div>}
    </article>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line-strong bg-surface/70 px-6 py-12 text-center">
      <div className="animate-float"><LogoMark size={110} live title="" /></div>
      <h2 className="mt-4 font-display text-2xl font-semibold">{title}</h2>
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
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
      <p className="text-sm font-semibold text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
