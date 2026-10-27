"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { activityById } from "@/lib/activities";
import { api, errorMessage } from "@/lib/api";
import { useRequireUser } from "@/lib/session";
import type { Moment } from "@/lib/types";
import { buttonClass } from "./ui/Button";
import { Icon } from "./ui/Icon";
import { Loader } from "./ui/Loader";

type Stroke = { uid: number; color: string; size: number; points: [number, number][] };
type Star = { x: number; y: number; z: number };

function DrawingPreview({ strokes }: { strokes: Stroke[] }) {
  return (
    <svg viewBox="0 0 400 300" className="aspect-[4/3] w-full rounded-md border border-line bg-white" role="img" aria-label="A drawing made together">
      {strokes.map((s, i) =>
        s.points.length === 1 ? (
          <circle key={i} cx={s.points[0][0] * 400} cy={s.points[0][1] * 300} r={(s.size * 400) / 1600} fill={s.color} />
        ) : (
          <polyline
            key={i}
            points={s.points.map(([x, y]) => `${x * 400},${y * 300}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth={(s.size * 400) / 800}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      )}
    </svg>
  );
}

function ConstellationPreview({ stars, name }: { stars: Star[]; name: string }) {
  const pts = stars.map((s) => [200 + s.x * 130, 150 - s.y * 130] as const);
  return (
    <svg viewBox="0 0 400 300" className="aspect-[4/3] w-full rounded-md border border-line bg-[#f4f7f6]" role="img" aria-label={`Constellation named ${name}`}>
      <polyline points={pts.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#1f1d1a" strokeOpacity={0.5} strokeWidth={1.5} />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4.5} fill={i % 2 ? "#1e6b66" : "#c2452d"} />)}
    </svg>
  );
}

function MomentBody({ moment }: { moment: Moment }) {
  const d = moment.data as Record<string, unknown>;
  if (moment.activity === "draw" && Array.isArray(d.strokes)) return <DrawingPreview strokes={d.strokes as Stroke[]} />;
  if (moment.activity === "constellation" && Array.isArray(d.stars)) return <ConstellationPreview stars={d.stars as Star[]} name={String(d.name)} />;
  if (moment.activity === "story" && Array.isArray(d.lines)) {
    return (
      <div className="max-h-56 overflow-y-auto rounded-md border border-line bg-paper p-3 font-display leading-relaxed">
        <p className="text-muted italic">{String(d.opener)}</p>
        {(d.lines as { text: string }[]).map((l, i) => <p key={i} className="mt-1">{l.text}</p>)}
      </div>
    );
  }
  return null;
}

export function MomentsClient() {
  const { user } = useRequireUser();
  const [moments, setMoments] = useState<Moment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api<{ moments: Moment[] }>("/profile/moments").then((r) => setMoments(r.moments)).catch((e) => setError(errorMessage(e)));
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="animate-rise">
        <h1 className="font-display text-4xl font-semibold">Moments</h1>
        <p className="mt-2 max-w-2xl text-muted">Everything you finished with someone: drawings, constellations, stories and game results. Both of you keep a copy.</p>
      </header>

      {error && <p role="alert" className="mt-6 text-coral-dark">{error}</p>}
      {!moments && !error && <Loader variant="stars" caption="Gathering your moments" />}
      {moments?.length === 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-line-strong bg-surface p-10 text-center">
          <p className="font-display text-2xl font-semibold">Nothing here yet</p>
          <p className="mt-1 text-muted">Finish an activity at a table and it shows up here.</p>
          <Link href="/lobby" className={buttonClass("primary", "md", "mt-5")}>Go to the lobby</Link>
        </div>
      )}
      {moments && moments.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moments.map((m) => (
            <li key={m.id} className="flex animate-rise flex-col gap-3 rounded-lg border border-line bg-surface p-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Icon name={m.activity} size={18} />
                <span className="font-semibold text-ink">{activityById(m.activity).name}</span>
                <span aria-hidden="true">|</span>
                <time dateTime={m.createdAt}>{new Date(`${m.createdAt}Z`).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</time>
              </div>
              <MomentBody moment={m} />
              <p className="font-semibold">{m.title}</p>
              {m.partnerName && <p className="-mt-2 text-sm text-muted">With {m.partnerName}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
