"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ACTIVITIES, activityById } from "@/lib/activities";
import { api, errorMessage } from "@/lib/api";
import { timeAgo } from "@/lib/labels";
import type { Moment } from "@/lib/types";
import { ButtonLink } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";
import { EmptyState, PageHeader, ViewToggle, useView } from "./widgets";

type Stroke = { uid: number; color: string; size: number; points: [number, number][] };
type Star = { x: number; y: number; z: number };

function DrawingPreview({ strokes }: { strokes: Stroke[] }) {
  return (
    <svg viewBox="0 0 400 300" className="aspect-[4/3] w-full rounded-2xl border border-line bg-white" role="img" aria-label="A drawing made together">
      {strokes.length === 0 && <text x="200" y="155" textAnchor="middle" fontSize="16" fill="#5d5476">A drawing made together</text>}
      {strokes.map((s, i) =>
        s.points.length === 1 ? (
          <circle key={i} cx={s.points[0][0] * 400} cy={s.points[0][1] * 300} r={(s.size * 400) / 1600} fill={s.color} />
        ) : (
          <polyline key={i} points={s.points.map(([x, y]) => `${x * 400},${y * 300}`).join(" ")} fill="none" stroke={s.color} strokeWidth={(s.size * 400) / 800} strokeLinecap="round" strokeLinejoin="round" />
        ),
      )}
    </svg>
  );
}

function ConstellationPreview({ stars, name }: { stars: Star[]; name: string }) {
  const pts = stars.map((s) => [200 + s.x * 130, 150 - s.y * 130] as const);
  return (
    <svg viewBox="0 0 400 300" className="aspect-[4/3] w-full rounded-2xl bg-[#1b1630]" role="img" aria-label={`Constellation named ${name}`}>
      {Array.from({ length: 40 }, (_, i) => <circle key={`bg${i}`} cx={(i * 97) % 400} cy={(i * 53) % 300} r={0.9} fill="#c5b3f8" opacity={0.5} />)}
      <polyline points={pts.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#c5b3f8" strokeOpacity={0.7} strokeWidth={1.5} />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill={i % 2 ? "#e5a2d5" : "#b4a2ff"} />)}
      <text x="200" y="285" textAnchor="middle" fontSize="15" fill="#f4f0ff" fontStyle="italic">{name}</text>
    </svg>
  );
}

function MomentBody({ moment }: { moment: Moment }) {
  const d = moment.data as Record<string, unknown>;
  if (moment.activity === "draw" && Array.isArray(d.strokes)) return <DrawingPreview strokes={d.strokes as Stroke[]} />;
  if (moment.activity === "constellation" && Array.isArray(d.stars)) return <ConstellationPreview stars={d.stars as Star[]} name={String(d.name)} />;
  if (moment.activity === "story" && Array.isArray(d.lines)) {
    return (
      <div className="max-h-56 overflow-y-auto rounded-2xl bg-paper-deep p-4 font-display leading-relaxed">
        <p className="text-muted italic">{String(d.opener)}</p>
        {(d.lines as { text: string }[]).map((l, i) => <p key={i} className="mt-1">{l.text}</p>)}
      </div>
    );
  }
  if (moment.activity === "deeptalk" && Array.isArray(d.cards) && d.cards.length) {
    return (
      <ul className="max-h-56 space-y-2 overflow-y-auto rounded-2xl bg-violet-soft p-4 text-sm">
        {(d.cards as { text: string; answers: string[] }[]).map((c, i) => <li key={i}><p className="font-semibold">{c.text}</p><p className="text-muted">{c.answers.join(" / ")}</p></li>)}
      </ul>
    );
  }
  return (
    <div className="flex aspect-[4/2] items-center justify-center rounded-2xl bg-violet-soft text-violet">
      <Icon name={moment.activity} size={56} strokeWidth={1.4} />
    </div>
  );
}

function MomentCard({ m, onFavorite }: { m: Moment; onFavorite: (m: Moment) => void }) {
  return (
    <article className="lift mb-4 break-inside-avoid rounded-[24px] border border-line bg-surface p-4">
      <MomentBody moment={m} />
      <div className="mt-3 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg leading-snug font-bold">{m.title}</h2>
          <p className="text-sm text-muted">
            {activityById(m.activity).name}
            {m.partnerName && <> with {m.partnerId ? <Link href={`/app/people/${m.partnerId}`} className="font-semibold text-violet hover:underline">{m.partnerName}</Link> : m.partnerName}</>}
            {" · "}{timeAgo(m.createdAt)}
          </p>
        </div>
        <button onClick={() => onFavorite(m)} aria-pressed={m.favorite} className={`rounded-xl p-2 transition-transform hover:scale-110 ${m.favorite ? "text-rose" : "text-muted hover:text-rose"}`}>
          <Icon name="heart" size={20} fill={m.favorite ? "currentColor" : "none"} label={m.favorite ? "Remove from favourites" : "Add to favourites"} />
        </button>
      </div>
    </article>
  );
}

export function Moments() {
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useView<"gallery" | "timeline" | "people">("moments", "gallery");
  const [activity, setActivity] = useState("");
  const [favOnly, setFavOnly] = useState(false);

  useEffect(() => {
    api<{ moments: Moment[] }>("/profile/moments").then((r) => setMoments(r.moments)).catch((e) => setError(errorMessage(e)));
  }, []);

  async function favorite(m: Moment) {
    setMoments((list) => list?.map((x) => (x.id === m.id ? { ...x, favorite: !x.favorite } : x)) ?? null);
    await api(`/profile/moments/${m.id}/favorite`, { method: "POST" }).catch(() => undefined);
  }

  const shown = useMemo(() => (moments ?? []).filter((m) => (!activity || m.activity === activity) && (!favOnly || m.favorite)), [moments, activity, favOnly]);
  const byPerson = useMemo(() => {
    const groups = new Map<string, Moment[]>();
    for (const m of shown) groups.set(m.partnerName ?? "Someone", [...(groups.get(m.partnerName ?? "Someone") ?? []), m]);
    return [...groups.entries()];
  }, [shown]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Moments"
        icon="star"
        subtitle="Everything you have made and finished together: drawings, constellations, stories and game results."
        actions={<ViewToggle value={view} onChange={setView} options={[{ id: "gallery", label: "Gallery", icon: "grid" }, { id: "timeline", label: "Timeline", icon: "timeline" }, { id: "people", label: "By person", icon: "users" }]} />}
      />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label htmlFor="m-activity" className="sr-only">Activity</label>
        <select id="m-activity" value={activity} onChange={(e) => setActivity(e.target.value)} className="h-10 rounded-2xl border border-transparent bg-paper-deep px-4 text-sm font-semibold">
          <option value="">All activities</option>
          {ACTIVITIES.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <button aria-pressed={favOnly} onClick={() => setFavOnly((f) => !f)} className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold ${favOnly ? "border-rose bg-rose-soft text-rose" : "border-line-strong bg-surface"}`}>
          <Icon name="heart" size={16} fill={favOnly ? "currentColor" : "none"} /> Favourites
        </button>
        {moments && <span className="text-sm text-muted">{shown.length} of {moments.length}</span>}
      </div>

      {error ? (
        <EmptyState title="Moments are not loading" body={error} />
      ) : !moments ? (
        <Loader variant="stars" caption="Collecting your stars" />
      ) : moments.length === 0 ? (
        <EmptyState title="No moments yet" body="Finish an activity with someone and it is saved here, forever yours." action={<ButtonLink href="/app/together">Do something together</ButtonLink>} />
      ) : shown.length === 0 ? (
        <EmptyState title="Nothing with these filters" body="Try another activity, or turn off favourites." />
      ) : view === "gallery" ? (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">{shown.map((m) => <MomentCard key={m.id} m={m} onFavorite={favorite} />)}</div>
      ) : view === "timeline" ? (
        <ol className="relative mx-auto max-w-2xl border-l-2 border-dashed border-line-strong pl-8">
          {shown.map((m) => (
            <li key={m.id} className="relative mb-6">
              <span className="absolute top-3 -left-[2.65rem] flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-brand text-white"><Icon name={m.activity} size={15} /></span>
              <p className="mb-1 text-xs font-bold text-muted">{new Date(m.createdAt.replace(" ", "T") + "Z").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
              <MomentCard m={m} onFavorite={favorite} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="space-y-8">
          {byPerson.map(([name, list]) => (
            <section key={name} aria-label={`Moments with ${name}`}>
              <h2 className="mb-3 font-display text-2xl font-bold">With {name} <span className="text-base text-muted">({list.length})</span></h2>
              <div className="flex snap-x gap-4 overflow-x-auto pb-2">
                {list.map((m) => <div key={m.id} className="w-72 shrink-0 snap-start"><MomentCard m={m} onFavorite={favorite} /></div>)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
