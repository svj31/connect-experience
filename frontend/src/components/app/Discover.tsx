"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { GENDER_LABELS, INTENT_LABELS, cap } from "@/lib/labels";
import { INTERESTS, type PersonCard } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";
import { ConnectButton } from "./ConnectButton";
import { EmptyState, PageHeader, PersonTile, ViewToggle, useView } from "./widgets";

interface Filters {
  minAge: number;
  maxAge: number;
  intent: string;
  gender: string;
  city: string;
  interests: string[];
  minVibe: number;
  online: boolean;
  sort: "vibe" | "active" | "recent";
  q: string;
}

const DEFAULTS: Filters = { minAge: 18, maxAge: 60, intent: "", gender: "", city: "", interests: [], minVibe: 0, online: false, sort: "vibe", q: "" };

const select = "h-10 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm font-semibold focus:border-violet focus:outline-none";

function FilterPanel({ f, set, cities, onReset }: { f: Filters; set: (p: Partial<Filters>) => void; cities: string[]; onReset: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="f-q" className="mb-1 block text-sm font-bold">Search by name</label>
        <input id="f-q" value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Anyone in mind?" className={select} />
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-bold">Age {f.minAge} to {f.maxAge}</legend>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="f-min">Minimum age</label>
          <input id="f-min" type="range" min={18} max={60} value={f.minAge} onChange={(e) => set({ minAge: Math.min(Number(e.target.value), f.maxAge) })} className="w-full accent-[var(--violet)]" />
          <label className="sr-only" htmlFor="f-max">Maximum age</label>
          <input id="f-max" type="range" min={18} max={60} value={f.maxAge} onChange={(e) => set({ maxAge: Math.max(Number(e.target.value), f.minAge) })} className="w-full accent-[var(--rose)]" />
        </div>
      </fieldset>
      <div>
        <label htmlFor="f-intent" className="mb-1 block text-sm font-bold">Looking for</label>
        <select id="f-intent" value={f.intent} onChange={(e) => set({ intent: e.target.value })} className={select}>
          <option value="">Any</option>
          {Object.entries(INTENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="f-gender" className="mb-1 block text-sm font-bold">Gender</label>
          <select id="f-gender" value={f.gender} onChange={(e) => set({ gender: e.target.value })} className={select}>
            <option value="">Any</option>
            {Object.entries(GENDER_LABELS).filter(([k]) => k !== "prefer-not").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-city" className="mb-1 block text-sm font-bold">City</label>
          <select id="f-city" value={f.city} onChange={(e) => set({ city: e.target.value })} className={select}>
            <option value="">Anywhere</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="f-vibe" className="mb-1 block text-sm font-bold">Minimum Vibe Match: {f.minVibe}</label>
        <input id="f-vibe" type="range" min={0} max={90} step={5} value={f.minVibe} onChange={(e) => set({ minVibe: Number(e.target.value) })} className="w-full accent-[var(--violet)]" />
      </div>
      <fieldset>
        <legend className="mb-1.5 text-sm font-bold">Into any of</legend>
        <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
          {INTERESTS.map((i) => {
            const on = f.interests.includes(i);
            return (
              <button key={i} type="button" aria-pressed={on} onClick={() => set({ interests: on ? f.interests.filter((x) => x !== i) : [...f.interests, i] })} className={`rounded-lg border px-2 py-1 text-xs font-bold ${on ? "border-violet bg-violet text-on-primary" : "border-line-strong hover:border-violet"}`}>
                {cap(i)}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={f.online} onChange={(e) => set({ online: e.target.checked })} className="h-4 w-4 accent-[var(--violet)]" /> Online now only
      </label>
      <Button variant="ghost" size="sm" onClick={onReset}><Icon name="refresh" size={15} /> Reset filters</Button>
    </div>
  );
}

/** One person at a time, like a card stack. Connect or pass, with keyboard shortcuts. */
function StackView({ people, onPass, onConnected }: { people: PersonCard[]; onPass: (id: number) => void; onConnected: (id: number) => void }) {
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);
  const top = people[0];
  const pass = useCallback(() => {
    if (!top) return;
    setLeaving("left");
    setTimeout(() => {
      setLeaving(null);
      onPass(top.id);
    }, 280);
  }, [top, onPass]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select, dialog")) return;
      if (e.key === "ArrowLeft") pass();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [pass]);
  if (!top) return <EmptyState title="That is everyone for now" body="Widen your filters, or reset passes to see people again." />;
  return (
    <div className="mx-auto max-w-md">
      <div className="relative">
        {people[1] && <div className="absolute inset-x-4 -bottom-3 h-full rounded-3xl border border-line bg-surface/70" aria-hidden="true" />}
        <div
          key={top.id}
          className="relative animate-pop transition-all duration-300"
          style={leaving ? { transform: `translateX(${leaving === "left" ? -120 : 120}%) rotate(${leaving === "left" ? -14 : 14}deg)`, opacity: 0 } : undefined}
        >
          <PersonTile
            person={top}
            href={`/app/people/${top.id}`}
            className="min-h-[420px]"
            actions={
              <div className="flex w-full items-center justify-center gap-3">
                <button onClick={pass} className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-line-strong text-muted transition-transform hover:scale-110 hover:border-danger hover:text-danger" aria-label={`Pass on ${top.displayName}`} title="Pass (left arrow)">
                  <Icon name="close" size={24} />
                </button>
                <Link href={`/app/people/${top.id}`} className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-line-strong text-muted transition-transform hover:scale-110 hover:border-violet hover:text-violet" aria-label={`View ${top.displayName}'s profile`}>
                  <Icon name="user" size={22} />
                </Link>
                <ConnectButton person={top} prompt={top.prompt ? `${top.prompt.text}: ${top.prompt.answer}` : undefined} onDone={() => onConnected(top.id)} />
              </div>
            }
          />
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted">{people.length} in your stack. Left arrow passes.</p>
    </div>
  );
}

/** A galaxy map: the closer to the centre, the higher the Vibe Match. */
function GalaxyView({ people }: { people: PersonCard[] }) {
  const placed = useMemo(
    () =>
      people.slice(0, 30).map((p, i) => {
        const distance = 12 + (1 - (p.vibe.score ?? 20) / 100) * 34;
        const angle = i * 2.399963; // golden angle spreads people evenly
        return { p, x: 50 + distance * Math.cos(angle), y: 50 + distance * Math.sin(angle) };
      }),
    [people],
  );
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[640px] rounded-full border border-line bg-surface/60">
      {[15, 30, 45].map((r) => <div key={r} className="absolute rounded-full border border-dashed border-line-strong" style={{ inset: `${50 - r}%` }} aria-hidden="true" />)}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-violet px-2 py-1 text-xs font-bold text-on-primary">You</span>
      <ul>
        {placed.map(({ p, x, y }, i) => (
          <li key={p.id} className="absolute animate-pop" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 40}ms` }}>
            <Link href={`/app/people/${p.id}`} className="group block -translate-x-1/2 -translate-y-1/2 text-center" title={`${p.displayName}, Vibe ${p.vibe.score ?? "?"}`}>
              <span className="block transition-transform group-hover:scale-125"><Avatar name={p.displayName} config={p.avatar} size={46} online={p.online} /></span>
              <span className="mt-0.5 block rounded-md bg-surface/90 px-1 text-[11px] font-bold group-hover:text-violet">{p.displayName} {p.vibe.score ?? ""}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Discover() {
  const [filters, setFilters] = useState<Filters>(DEFAULTS);
  const [people, setPeople] = useState<PersonCard[] | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useView<"stack" | "grid" | "galaxy">("discover", "grid");
  const [showFilters, setShowFilters] = useState(false);
  const set = (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p }));

  const query = useMemo(() => {
    const q = new URLSearchParams({ minAge: String(filters.minAge), maxAge: String(filters.maxAge), sort: filters.sort });
    if (filters.intent) q.set("intent", filters.intent);
    if (filters.gender) q.set("gender", filters.gender);
    if (filters.city) q.set("city", filters.city);
    if (filters.interests.length) q.set("interests", filters.interests.join(","));
    if (filters.minVibe) q.set("minVibe", String(filters.minVibe));
    if (filters.online) q.set("online", "1");
    if (filters.q.trim()) q.set("q", filters.q.trim());
    return q.toString();
  }, [filters]);

  const load = useCallback(() => {
    api<{ people: PersonCard[]; cities: string[] }>(`/people?${query}`)
      .then((r) => {
        setPeople(r.people);
        setCities(r.cities);
        setError(null);
      })
      .catch((e) => setError(errorMessage(e)));
  }, [query]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const remove = (id: number) => setPeople((list) => list?.filter((p) => p.id !== id) ?? null);
  const pass = async (id: number) => {
    remove(id);
    await api(`/people/${id}/pass`, { method: "POST" }).catch(() => undefined);
  };
  const activeCount = [filters.intent, filters.gender, filters.city, filters.minVibe, filters.online, filters.q, filters.interests.length, filters.minAge !== 18 || filters.maxAge !== 60].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Discover"
        icon="discover"
        subtitle="People who fit what you are looking for, sorted by Vibe Match. Every score shows its reasons."
        actions={
          <>
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <select id="sort" value={filters.sort} onChange={(e) => set({ sort: e.target.value as Filters["sort"] })} className="h-11 rounded-xl border border-line-strong bg-surface px-3 text-sm font-semibold">
              <option value="vibe">Best vibe first</option>
              <option value="active">Recently active</option>
              <option value="recent">Newest</option>
            </select>
            <Button variant="secondary" className="lg:hidden" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
              <Icon name="filter" size={16} /> Filters{activeCount ? ` (${activeCount})` : ""}
            </Button>
            <ViewToggle value={view} onChange={setView} options={[{ id: "stack", label: "Stack", icon: "cards" }, { id: "grid", label: "Grid", icon: "grid" }, { id: "galaxy", label: "Galaxy", icon: "orbit" }]} />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} h-fit rounded-3xl border border-line bg-surface p-5 lg:sticky lg:top-24 lg:block`} aria-label="Filters">
          <FilterPanel f={filters} set={set} cities={cities} onReset={async () => {
            setFilters(DEFAULTS);
            await api("/people/passes", { method: "DELETE" }).catch(() => undefined);
            load();
          }} />
        </aside>
        <section aria-live="polite" aria-busy={!people}>
          {error ? (
            <EmptyState title="Discover is resting" body={error} />
          ) : !people ? (
            <Loader variant="compass" caption="Scanning the verse for your people" />
          ) : view === "stack" ? (
            <StackView people={people} onPass={pass} onConnected={remove} />
          ) : view === "galaxy" ? (
            people.length ? <GalaxyView people={people} /> : <EmptyState title="Nobody in range" body="Try widening the age range or removing a filter." />
          ) : people.length === 0 ? (
            <EmptyState title="Nobody matches these filters" body="Try widening the age range or removing a filter." />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {people.map((p, i) => (
                <li key={p.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                  <PersonTile
                    person={p}
                    href={`/app/people/${p.id}`}
                    actions={
                      <>
                        <ConnectButton person={p} size="sm" prompt={p.prompt ? `${p.prompt.text}: ${p.prompt.answer}` : undefined} onDone={() => remove(p.id)} />
                        <Button size="sm" variant="ghost" onClick={() => pass(p.id)} aria-label={`Pass on ${p.displayName}`}><Icon name="close" size={16} /> Pass</Button>
                      </>
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
