"use client";

import Link from "next/link";
import { PhotoPlanet } from "../ui/PhotoPlanet";
import type { ReactNode } from "react";
import { GENDER_LABELS, INTENT_LABELS, LIFESTYLE_OPTIONS, LOVE_LABELS, PERSONALITY_LABELS, cap } from "@/lib/labels";
import type { PrivacySection, Profile } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { Icon } from "../ui/Icon";
import { Chip } from "./widgets";

function Locked({ hint }: { hint: string }) {
  return (
    <p className="flex items-center gap-2 rounded-2xl border border-dashed border-line-strong p-3 text-sm text-muted">
      <Icon name="lock" size={16} /> {hint}
    </p>
  );
}

function Section({ title, icon, locked, children }: { title: string; icon: string; locked?: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-line bg-surface p-6" aria-label={title}>
      <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-extrabold"><Icon name={icon} size={18} className="text-violet" />{title}</h2>
      {locked ? <Locked hint={locked} /> : children}
    </section>
  );
}

function Fact({ icon, children }: { icon: string; children: ReactNode }) {
  return <li className="flex items-center gap-2 rounded-xl bg-paper-deep px-3 py-2 text-sm font-semibold"><Icon name={icon} size={16} className="text-muted" />{children}</li>;
}

/** A profile as the viewer may see it, with locked sections explaining what unlocks them. */
export function ProfileView({ profile, shared = [], hero, aside }: { profile: Profile; shared?: string[]; hero?: ReactNode; aside?: ReactNode }) {
  const lock = (s: PrivacySection) => profile.locked[s];
  const basics = [
    profile.age && [`${profile.age}`, "user"],
    profile.gender && [GENDER_LABELS[profile.gender] ?? profile.gender, "users"],
    profile.city && [profile.city, "pin"],
    profile.heightCm && [`${profile.heightCm} cm`, "ruler"],
    profile.starSign && [cap(profile.starSign), "star"],
    profile.languages?.length && [profile.languages.join(", "), "globe"],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-[28px] border border-line bg-surface">
          {profile.photos?.length ? (
            <div className="relative">
              <ul className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" aria-label={`${profile.displayName}'s photos`}>
                {profile.photos.map((src, i) => (
                  <li key={i} className="relative aspect-[4/5] w-full shrink-0 snap-center sm:aspect-[16/11]">
                    { }
                    <PhotoPlanet photo={src} planet={profile.avatar} alt={`${profile.displayName}, photo ${i + 1} of ${profile.photos!.length}`} className="h-full w-full" />
                  </li>
                ))}
              </ul>
              {profile.photos.length > 1 && <p className="glass absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold">Swipe for {profile.photos.length} photos</p>}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-6 pt-24 text-white">
                <h1 className="font-display text-5xl font-extrabold tracking-tight">{profile.displayName}{profile.age ? <span className="ml-2 font-semibold text-white/90">{profile.age}</span> : null}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-3 font-semibold text-white/85">
                  {profile.online && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#3ee6a0]" />Online now</span>}
                  {[profile.pronouns, profile.city].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-wrap items-center gap-5 bg-paper-deep p-6">
              <div className="animate-float rounded-full ring-4 ring-surface"><Avatar name={profile.displayName} config={profile.avatar} size={112} online={profile.online} /></div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-4xl font-extrabold tracking-tight">{profile.displayName}{profile.age ? <span className="font-semibold text-muted">, {profile.age}</span> : null}</h1>
                <p className="mt-1 text-muted">{[profile.pronouns, profile.city].filter(Boolean).join(" · ") || "Basics are private"}</p>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 px-6 pt-5">
            <Chip tone="violet"><Icon name="heart" size={12} />{INTENT_LABELS[profile.intent] ?? "Open to see"}</Chip>
          </div>
          <div className="p-6 pt-3">
          {hero}
          {profile.bio !== null ? (
            profile.bio && <p className="relative mt-5 text-lg">{profile.bio}</p>
          ) : (
            <div className="relative mt-5"><Locked hint={lock("about") ?? "Private"} /></div>
          )}
          </div>
        </section>

        <Section title="Prompts" icon="deeptalk" locked={lock("prompts")}>
          {profile.prompts?.length ? (
            <ul className="space-y-3">
              {profile.prompts.map((p, i) => (
                <li key={p.id} className={`rounded-[24px] p-5 ${i % 2 ? "bg-rose-soft" : "bg-violet-soft"}`}>
                  <p className="text-sm font-bold text-muted">{p.text}</p>
                  <p className="mt-1 font-display text-2xl font-bold leading-snug">{p.answer}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No prompts yet.</p>
          )}
        </Section>

        <Section title="Interests" icon="sparkle">
          <div className="flex flex-wrap gap-2">
            {profile.interests.length === 0 && <p className="text-sm text-muted">No interests added yet.</p>}
            {profile.interests.map((i) => (
              <span key={i} className={`rounded-full px-3 py-1.5 text-sm font-bold ${shared.includes(i) ? "bg-brand" : "bg-paper-deep"}`}>
                {cap(i)}{shared.includes(i) && <span className="sr-only"> (shared)</span>}
              </span>
            ))}
          </div>
          {shared.length > 0 && <p className="mt-3 text-sm text-muted">Highlighted ones you share.</p>}
        </Section>
      </div>

      <div className="space-y-5">
        {aside}
        <Section title="Basics" icon="info" locked={lock("basics")}>
          <ul className="flex flex-wrap gap-2">{basics.length ? basics.map(([t, icon]) => <Fact key={t} icon={icon}>{t}</Fact>) : <li className="text-sm text-muted">Nothing shared yet.</li>}</ul>
        </Section>
        <Section title="About" icon="smile" locked={lock("about")}>
          <ul className="flex flex-wrap gap-2">
            {profile.personality && <Fact icon="users">{PERSONALITY_LABELS[profile.personality]}</Fact>}
            {profile.loveLanguage && <Fact icon="heart">{LOVE_LABELS[profile.loveLanguage]}</Fact>}
            {!profile.personality && !profile.loveLanguage && <li className="text-sm text-muted">Nothing shared yet.</li>}
          </ul>
        </Section>
        <Section title="Lifestyle" icon="leaf" locked={lock("lifestyle")}>
          <ul className="flex flex-wrap gap-2">
            {Object.entries(profile.lifestyle ?? {}).map(([k, v]) => <Fact key={k} icon="checkCircle">{LIFESTYLE_OPTIONS[k]?.options[v as string] ?? v}</Fact>)}
            {!Object.keys(profile.lifestyle ?? {}).length && <li className="text-sm text-muted">Nothing shared yet.</li>}
          </ul>
        </Section>
        <Section title="Work and study" icon="briefcase" locked={lock("work")}>
          <ul className="flex flex-wrap gap-2">
            {profile.job && <Fact icon="briefcase">{profile.job}</Fact>}
            {profile.education && <Fact icon="grad">{profile.education}</Fact>}
            {!profile.job && !profile.education && <li className="text-sm text-muted">Nothing shared yet.</li>}
          </ul>
        </Section>
        <Section title="Socials" icon="globe" locked={lock("socials")}>
          {profile.handle ? <p className="font-semibold">{profile.handle}</p> : <p className="text-sm text-muted">Nothing shared yet.</p>}
        </Section>
        <p className="text-xs text-muted">Sections open up as your bond grows, and only the ones this person chose to share. <Link href="/app/settings" className="font-semibold text-violet">Your own settings</Link></p>
      </div>
    </div>
  );
}
