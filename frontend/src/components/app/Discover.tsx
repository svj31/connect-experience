"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { GENDER_LABELS, INTENT_LABELS, cap } from "@/lib/labels";
import { INTERESTS, type PersonCard } from "@/lib/types";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";
import { ConnectButton } from "./ConnectButton";
import { ProfileFeed } from "./ProfileFeed";
import { SwipeDeck } from "./SwipeDeck";
import { EmptyState, PersonTile, ViewToggle, useView } from "./widgets";

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

const select = "h-10 w-full rounded-2xl border border-transparent bg-paper-deep px-4 text-sm font-semibold focus:border-violet focus:outline-none";

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
              <button key={i} type="button" aria-pressed={on} onClick={() => set({ interests: on ? f.interests.filter((x) => x !== i) : [...f.interests, i] })} className={`rounded-full border px-2 py-1 text-xs font-bold ${on ? "border-transparent bg-brand" : "border-line-strong hover:border-violet"}`}>
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

export function Discover() {
  const [filters, setFilters] = useState<Filters>(DEFAULTS);
  const [people, setPeople] = useState<PersonCard[] | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useView<"profiles" | "swipe" | "grid">("discover-v3", "profiles");
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
    if (view !== "grid") return;
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load, view]);

  const remove = (id: number) => setPeople((list) => list?.filter((p) => p.id !== id) ?? null);
  const pass = async (id: number) => {
    remove(id);
    await api(`/people/${id}/pass`, { method: "POST" }).catch(() => undefined);
  };
  const activeCount = [filters.intent, filters.gender, filters.city, filters.minVibe, filters.online, filters.q, filters.interests.length, filters.minAge !== 18 || filters.maxAge !== 60].filter(Boolean).length;

  return (
    // Exactly one screen tall: the bar stays put and each view scrolls inside itself, never the page.
    <div className="mx-auto flex h-[calc(100dvh-12.5rem)] min-h-[420px] max-w-7xl flex-col lg:h-[calc(100dvh-9.5rem)]">
      <div className={`mb-4 flex shrink-0 flex-wrap items-center gap-2 ${view === "grid" ? "justify-between" : "justify-center"}`}>
        <h1 className={view === "grid" ? "font-display text-3xl leading-none" : "sr-only"}>Discover</h1>
        {view === "grid" ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <select id="sort" value={filters.sort} onChange={(e) => set({ sort: e.target.value as Filters["sort"] })} className="h-10 rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold">
              <option value="vibe">Best vibe first</option>
              <option value="active">Recently active</option>
              <option value="recent">Newest</option>
            </select>
            <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setShowFilters((x) => !x)} aria-expanded={showFilters}>
              <Icon name="filter" size={16} /> Filters{activeCount ? ` (${activeCount})` : ""}
            </Button>
            <ViewToggle value={view} onChange={setView} options={[{ id: "profiles", label: "Profiles", icon: "user" }, { id: "swipe", label: "Cards", icon: "cards" }, { id: "grid", label: "Browse", icon: "grid" }]} />
          </div>
        ) : (
          <ViewToggle value={view} onChange={setView} options={[{ id: "profiles", label: "Profiles", icon: "user" }, { id: "swipe", label: "Cards", icon: "cards" }, { id: "grid", label: "Browse", icon: "grid" }]} />
        )}
      </div>
      <div className="min-h-0 flex-1">
      {view === "profiles" ? <ProfileFeed /> : view === "swipe" ? <SwipeDeck /> : (
      <div className="grid h-full gap-6 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} no-scrollbar max-h-full overflow-y-auto rounded-[24px] border border-line bg-surface p-5 lg:block`} aria-label="Filters">
          <FilterPanel f={filters} set={set} cities={cities} onReset={async () => {
            setFilters(DEFAULTS);
            await api("/people/passes", { method: "DELETE" }).catch(() => undefined);
            load();
          }} />
        </aside>
        <section aria-live="polite" aria-busy={!people} className={`${showFilters ? "hidden lg:block" : ""} no-scrollbar min-h-0 overflow-y-auto pb-2`}>
          {error ? (
            <EmptyState title="Discover is resting" body={error} />
          ) : !people ? (
            <Loader variant="compass" caption="Scanning the verse for your people" />
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
      )}
      </div>
    </div>
  );
}
