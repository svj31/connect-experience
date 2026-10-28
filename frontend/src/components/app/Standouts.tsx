"use client";

 
import Link from "next/link";
import { PhotoPlanet } from "../ui/PhotoPlanet";
import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { cap } from "@/lib/labels";
import type { PersonCard } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";
import { EmptyState, PageHeader } from "./widgets";

interface Data { mostCompatible: PersonCard | null; standouts: PersonCard[]; quota: { likesLeft: number; superlikesLeft: number } }

function Photo({ p, className }: { p: PersonCard; className: string }) {
  const src = p.photos?.[0] ?? p.avatar.photo;
  return <PhotoPlanet photo={src} planet={p.avatar} alt="" className={className} />;
}

/** Hinge style Standouts: today's most compatible person, then a handful of strong picks. */
export function Standouts() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<Data>("/discover/standouts").then(setData).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <EmptyState title="Standouts are resting" body={error} />;
  if (!data) return <Loader variant="hearts" caption="Picking today's standouts" />;
  const top = data.mostCompatible;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Standouts" subtitle="Hand picked each day from people who fit you best. Super like one to show up first." />
      {!top ? (
        <EmptyState title="No standouts right now" body="You have seen everyone who fits your filters. New people join every day." />
      ) : (
        <>
          <Link href={`/app/people/${top.id}`} className="group grid overflow-hidden rounded-[24px] border border-line bg-surface md:grid-cols-[1.1fr_1fr]">
            <div className="relative">
              <Photo p={top} className="aspect-[4/5] h-full w-full md:aspect-auto md:min-h-[440px]" />
              <span className="bg-saffron absolute top-4 left-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"><Icon name="star" size={14} />Most compatible today</span>
            </div>
            <div className="flex flex-col justify-between gap-6 p-7 sm:p-9">
              <div>
                <h2 className="font-display text-5xl leading-none">{top.displayName}{top.age ? <span className="text-muted">, {top.age}</span> : null}</h2>
                <p className="mt-3 text-muted">{[top.city, INTENT(top.intent)].filter(Boolean).join(" · ")}</p>
                {top.vibe.score !== null && <p className="mt-6 text-sm font-semibold text-violet">{top.vibe.score}% Vibe Match</p>}
                <ul className="mt-2 space-y-1.5">
                  {top.vibe.reasons.slice(0, 3).map((r) => <li key={r} className="font-display text-2xl leading-snug">{r}</li>)}
                </ul>
                {top.prompt && (
                  <blockquote className="mt-6 rounded-2xl bg-paper p-5">
                    <p className="text-xs font-semibold text-muted">{top.prompt.text}</p>
                    <p className="mt-1 font-display text-xl">{top.prompt.answer}</p>
                  </blockquote>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:underline">See their profile <Icon name="arrowRight" size={16} /></span>
            </div>
          </Link>

          {data.standouts.length > 0 && (
            <>
              <h2 className="mt-12 mb-4 font-display text-3xl">More standouts</h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {data.standouts.map((p) => (
                  <li key={p.id}>
                    <Link href={`/app/people/${p.id}`} className="lift group block overflow-hidden rounded-[24px] border border-line bg-surface">
                      <div className="relative">
                        <Photo p={p} className="aspect-[3/4] w-full" />
                        {p.vibe.score !== null && <span className="glass absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold">{p.vibe.score}%</span>}
                      </div>
                      <div className="p-4">
                        <p className="font-display text-2xl leading-none">{p.displayName}{p.age ? <span className="text-muted">, {p.age}</span> : null}</p>
                        <p className="mt-2 line-clamp-2 text-sm text-muted">{p.prompt ? `${p.prompt.text}: ${p.prompt.answer}` : p.interests.slice(0, 3).map(cap).join(" · ")}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

const INTENT = (k: string) => ({ "long-term": "Long-term", "long-term-open": "Long-term, open", "short-term-fun": "Something fun", "new-friends": "New friends" } as Record<string, string>)[k] ?? "";
