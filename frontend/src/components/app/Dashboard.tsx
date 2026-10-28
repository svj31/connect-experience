"use client";

import Link from "next/link";
import { StoryRow } from "./StoryRow";
import { useEffect, useState } from "react";
import { activityById } from "@/lib/activities";
import { api, errorMessage } from "@/lib/api";
import { timeAgo } from "@/lib/labels";
import { useSession } from "@/lib/session";
import type { AvatarConfig, Bond, BondLevel, PersonCard, Suggestion, WatchPick } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { Planet } from "../ui/Planet";
import { ButtonLink } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { PageLoader } from "../ui/Loader";
import { HBarChart, PairBars } from "./charts";
import { ConnectButton } from "./ConnectButton";
import { BondMeter, EmptyState, PageHeader, StatTile, ViewToggle, useView } from "./widgets";

interface DashboardData {
  greetingName: string;
  completeness: { percent: number; missing: string[] };
  stats: { connections: number; requests: number; moments: number; messages: number; bestStreak: number; topBond: string | null };
  people: { connectionId: number; roomCode: string; person: PersonCard; bond: Bond }[];
  weekly: { d: string; messages: number; moments: number }[];
  activityMix: { activity: string; n: number }[];
  moments: { id: number; activity: string; title: string; createdAt: string; partnerName: string | null }[];
  suggestions: { people: PersonCard[]; activities: Suggestion[]; question: string; watch: WatchPick[] };
  levels: BondLevel[];
}

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Still up" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** Your universe: connections orbit you, closer bonds on inner rings. */
function UniverseView({ people, me }: { people: DashboardData["people"]; me: { name: string; avatar: Partial<AvatarConfig> } }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {[5, 4, 3, 2, 1].map((level) => (
        <div key={level} className="absolute rounded-full border border-dashed border-line-strong" style={{ inset: `${(level - 1) * 9 + 4}%` }} aria-hidden="true">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-md bg-paper px-1.5 text-[10px] font-bold text-muted">{["Stardust", "Spark", "Orbit", "Constellation", "Galaxy"][level - 1]}</span>
        </div>
      ))}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="animate-float"><Planet config={me.avatar} size={104} title="Your planet" /></div>
        <p className="mt-1 text-sm font-bold">You</p>
      </div>
      <ul className="absolute inset-0 animate-spin-slow [animation-duration:90s] hover:[animation-play-state:paused]">
        {people.map((p, i) => {
          // Each level has its own ring, and stronger bonds sit on inner rings.
          const level = Math.min(5, Math.max(1, p.bond.level));
          const radius = 50 - ((level - 1) * 9 + 4);
          const angle = (i / Math.max(people.length, 1)) * Math.PI * 2 + level;
          return (
            <li key={p.connectionId} className="absolute" style={{ left: `${50 + radius * Math.cos(angle)}%`, top: `${50 + radius * Math.sin(angle)}%` }}>
              <Link href={`/app/people/${p.person.id}`} className="group block -translate-x-1/2 -translate-y-1/2 animate-spin-slow text-center [animation-direction:reverse] [animation-duration:90s]">
                <span className="block transition-transform duration-300 group-hover:scale-110"><Planet config={p.person.avatar} size={64} title={`${p.person.displayName}'s planet`} /></span>
                <span className="-mt-1 block rounded-md bg-surface/90 px-1 text-xs font-bold group-hover:text-violet">{p.person.displayName}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Dashboard() {
  const { user } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useView<"orbit" | "cards" | "timeline">("dashboard", "orbit");

  useEffect(() => {
    api<DashboardData>("/me/dashboard").then(setData).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <EmptyState title="Could not load your dashboard" body={error} />;
  if (!data || !user) return <PageLoader variant="orbit" caption="Gathering your universe" />;
  const { stats } = data;
  const days = data.weekly.map((w) => ({ label: new Date(w.d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" }), a: w.messages, b: w.moments }));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={`${greeting()}, ${data.greetingName}`} subtitle="Your matches, your streaks, and who to meet next." />
      <StoryRow />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="relative overflow-hidden rounded-[24px] border border-line bg-surface p-6" aria-labelledby="qotd">
          <p id="qotd" className="flex items-center gap-2 text-sm font-bold text-rose"><Icon name="sparkle" size={16} /> Question of the day</p>
          <p className="relative mt-2 max-w-lg font-display text-2xl font-bold text-balance">{data.suggestions.question}</p>
          <p className="relative mt-2 text-sm text-muted">Everyone gets the same one today. Ask it in a chat, or start Deep Talk to go further.</p>
          <div className="relative mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/app/together?pick=deeptalk" size="sm"><Icon name="deeptalk" size={16} /> Start Deep Talk</ButtonLink>
            <ButtonLink href="/app/chats" size="sm" variant="secondary">Ask in a chat</ButtonLink>
          </div>
        </section>
        <section className="rounded-[24px] border border-line bg-surface p-6" aria-labelledby="complete">
          <div className="flex items-center gap-4">
            <span className="relative h-20 w-20 shrink-0">
              <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="20" cy="20" r="16" fill="none" stroke="var(--line)" strokeWidth="4" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="var(--rose)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${data.completeness.percent} 100.5`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center"><Avatar name={user.displayName} config={user.avatar} size={44} decorative /></span>
            </span>
            <div>
              <p id="complete" className="font-display text-xl font-bold">Profile {data.completeness.percent}% complete</p>
              <p className="text-sm text-muted">{data.completeness.missing.length ? `Next: ${data.completeness.missing.slice(0, 2).join(", ").toLowerCase()}` : "Everything filled in. Lovely."}</p>
            </div>
          </div>
          <ButtonLink href="/app/profile" size="sm" variant="soft" className="mt-4"><Icon name="edit" size={16} /> Edit profile</ButtonLink>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Matches" value={stats.connections} icon="users" />
        <StatTile label="Likes waiting" value={stats.requests} icon="heart" tone="rose" hint={stats.requests ? "Open Likes to reply" : undefined} />
        <StatTile label="Moments shared" value={stats.moments} icon="star" tone="sun" />
        <StatTile label="Best streak" value={<span className="flex items-center gap-1">{stats.bestStreak}<Icon name="fire" size={22} className="text-rose" /></span>} icon="zap" tone="mint" hint={stats.topBond ? `Closest bond: ${stats.topBond}` : undefined} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="universe">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="universe" className="font-display text-2xl font-bold">Your universe</h2>
            <ViewToggle value={view} onChange={setView} options={[{ id: "orbit", label: "Orbit", icon: "orbit" }, { id: "cards", label: "Cards", icon: "grid" }, { id: "timeline", label: "Timeline", icon: "timeline" }]} />
          </div>
          {data.people.length === 0 && view !== "timeline" ? (
            <EmptyState title="Your universe is waiting" body="Connect with someone from Discover and they will start orbiting here." action={<ButtonLink href="/app/discover">Discover people</ButtonLink>} />
          ) : view === "orbit" ? (
            <div className="rounded-[24px] border border-line bg-surface p-4"><UniverseView people={data.people} me={{ name: user.displayName, avatar: user.avatar }} /><p className="text-center text-xs text-muted">Closer bonds orbit nearer. Hover to pause, tap someone to see their profile.</p></div>
          ) : view === "cards" ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {data.people.map((p) => (
                <li key={p.connectionId} className="lift rounded-2xl border border-line bg-surface p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.person.displayName} config={p.person.avatar} size={48} online={p.person.online} />
                    <div className="min-w-0 flex-1">
                      <Link href={`/app/people/${p.person.id}`} className="font-bold hover:text-violet">{p.person.displayName}</Link>
                      <BondMeter bond={p.bond} compact />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <ButtonLink href={`/app/chats?c=${p.connectionId}`} size="sm" variant="secondary"><Icon name="chat" size={15} /> Chat</ButtonLink>
                    <ButtonLink href={`/app/room/${p.roomCode}`} size="sm" variant="soft"><Icon name="orbit" size={15} /> Together</ButtonLink>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ol className="relative space-y-3 border-l-2 border-line pl-6">
              {data.moments.length === 0 && <li className="text-muted">No moments yet. Finish an activity together and it lands here.</li>}
              {data.moments.map((m) => (
                <li key={m.id} className="relative animate-rise rounded-2xl border border-line bg-surface p-3">
                  <span className="absolute top-4 -left-[2.05rem] flex h-6 w-6 items-center justify-center rounded-full bg-brand"><Icon name={m.activity} size={13} /></span>
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-sm text-muted">{activityById(m.activity).name}{m.partnerName ? ` with ${m.partnerName}` : ""} · {timeAgo(m.createdAt)}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="space-y-6">
          <section aria-labelledby="sugg">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="sugg" className="font-display text-2xl font-bold">Picked for you</h2>
              <Link href="/app/discover" className="text-sm font-semibold text-violet hover:underline">See all</Link>
            </div>
            <ul className="space-y-2">
              {data.suggestions.people.length === 0 && <li className="text-sm text-muted">You have seen everyone for now. Check back soon.</li>}
              {data.suggestions.people.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
                  <Avatar name={p.displayName} config={p.avatar} size={44} online={p.online} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/app/people/${p.id}`} className="font-bold hover:text-violet">{p.displayName}{p.age ? `, ${p.age}` : ""}</Link>
                    <p className="truncate text-xs font-semibold text-rose">{p.vibe.reasons[0] ?? p.city}</p>
                  </div>
                  <span className="text-sm font-extrabold text-violet" title="Vibe Match">{p.vibe.score ?? "?"}</span>
                  <ConnectButton person={p} size="sm" />
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="next">
            <h2 id="next" className="mb-3 font-display text-2xl font-bold">Try next</h2>
            <ul className="grid grid-cols-2 gap-2">
              {data.suggestions.activities.map((s) => (
                <li key={s.id}>
                  <Link href={`/app/together?pick=${s.id}`} className="lift block h-full rounded-2xl border border-line bg-surface p-3">
                    <Icon name={s.id} className="text-violet" />
                    <p className="mt-1.5 font-bold">{activityById(s.id).name}</p>
                    <p className="text-xs text-muted">{s.reason}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[24px] border border-line bg-surface p-5" aria-labelledby="week">
          <h2 id="week" className="font-display text-xl font-bold">Your week</h2>
          <p className="mb-4 text-sm text-muted">Messages you sent and moments you finished, per day.</p>
          <PairBars data={days} a="Messages" b="Moments" label="Messages and moments per day this week" />
        </section>
        <section className="rounded-[24px] border border-line bg-surface p-5" aria-labelledby="mix">
          <h2 id="mix" className="font-display text-xl font-bold">What you love doing</h2>
          <p className="mb-4 text-sm text-muted">Moments by activity.</p>
          {data.activityMix.length ? (
            <HBarChart data={data.activityMix.map((a) => ({ label: activityById(a.activity).name, value: a.n }))} label="Moments by activity" />
          ) : (
            <p className="text-sm text-muted">Nothing yet. Your favourites will show here.</p>
          )}
        </section>
      </div>
    </div>
  );
}
