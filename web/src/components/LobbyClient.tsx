"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type { Socket } from "socket.io-client";
import { ACTIVITIES, activityById } from "@/lib/activities";
import { ApiError, api, errorMessage } from "@/lib/api";
import { track } from "@/lib/consent";
import { useRequireUser } from "@/lib/session";
import { emitAck, openSocket } from "@/lib/socket";
import { INTERESTS, type ActivityId, type OpenRoom, type Room } from "@/lib/types";
import { normaliseRoomCode, validateTableTitle } from "@/lib/validation";
import { Avatar } from "./ui/Avatar";
import { Button, buttonClass } from "./ui/Button";
import { Field, FormError } from "./ui/Field";
import { Icon } from "./ui/Icon";
import { Loader, PageLoader } from "./ui/Loader";

type Filter = ActivityId | "all";

export function LobbyClient() {
  const router = useRouter();
  const { user, loading } = useRequireUser();
  const [rooms, setRooms] = useState<OpenRoom[] | null>(null);
  const [mine, setMine] = useState<Room[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [listError, setListError] = useState<string | null>(null);
  const [joining, setJoining] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const load = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Fetch now, whenever asked to refresh, and every 15 seconds while the lobby is open.
  useEffect(() => {
    if (!user) return;
    let active = true;
    const fetchAll = () =>
      Promise.all([api<{ rooms: OpenRoom[] }>("/rooms/open"), api<{ rooms: Room[] }>("/rooms/mine")])
        .then(([open, my]) => {
          if (!active) return;
          setRooms(open.rooms);
          setMine(my.rooms);
          setListError(null);
        })
        .catch((e) => {
          if (!active) return;
          setListError(errorMessage(e));
          setRooms((r) => r ?? []);
        });
    void fetchAll();
    const id = setInterval(fetchAll, 15000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [user, refreshKey]);

  async function join(code: string) {
    setJoining(code);
    try {
      await api(`/rooms/${code}/join`, { method: "POST" });
      track("table_join");
      router.push(`/room/${code}`);
    } catch (e) {
      setListError(errorMessage(e));
      setJoining(null);
      load();
    }
  }

  if (loading || !user) return <PageLoader variant="orbit" caption="Finding open tables" />;

  const visible = (rooms ?? []).filter((r) => filter === "all" || r.activity === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="animate-rise">
        <h1 className="font-display text-4xl font-semibold">Hi {user.displayName}. What do you feel like doing?</h1>
        <p className="mt-2 text-muted">Sit down at an open table, let Quick Match find someone, or start your own.</p>
        {user.interests.length === 0 && (
          <p className="mt-4 rounded-md bg-sun-soft px-3 py-2 text-sm">
            Add a few interests on your <Link href="/profile" className="font-semibold underline">profile</Link> so Quick Match can pair you with people who share them.
          </p>
        )}
      </header>

      {mine.length > 0 && (
        <section aria-labelledby="mine-heading" className="mt-8">
          <h2 id="mine-heading" className="text-sm font-bold tracking-wide text-muted uppercase">Your tables</h2>
          <ul className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {mine.map((r) => (
              <li key={r.code}>
                <Link href={`/room/${r.code}`} className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 whitespace-nowrap hover:border-ink">
                  <Icon name={r.activity} size={18} />
                  <span className="font-semibold">{r.title}</span>
                  <span className="text-xs text-muted">{r.status === "paired" ? "Two seated" : "Waiting"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="open-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="open-heading" className="font-display text-2xl font-semibold">Open tables</h2>
            <Button variant="ghost" size="sm" onClick={load}><Icon name="refresh" size={16} /> Refresh</Button>
          </div>
          <div className="mt-3 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by activity">
            <div className="flex gap-1.5 pb-1">
              {(["all", ...ACTIVITIES.map((a) => a.id)] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`h-9 rounded-md border px-3 text-sm font-semibold whitespace-nowrap ${filter === f ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink"}`}
                >
                  {f === "all" ? "All" : activityById(f).name}
                </button>
              ))}
            </div>
          </div>

          {listError && <div className="mt-3"><FormError message={listError} /></div>}

          {rooms === null ? (
            <Loader variant="orbit" caption="Looking around the room" />
          ) : visible.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-line-strong bg-surface p-8 text-center">
              <p className="font-semibold">No open tables {filter === "all" ? "right now" : `for ${activityById(filter).name}`}.</p>
              <p className="mt-1 text-muted">Start one and it shows up here for others, or try Quick Match.</p>
            </div>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {visible.map((r) => {
                const shared = r.host.interests.filter((i) => user.interests.includes(i));
                return (
                  <li key={r.code} className="flex animate-rise flex-col rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong">
                    <div className="flex items-start gap-3">
                      <Avatar shape={r.host.avatarShape} color={r.host.avatarColor} name={r.host.displayName} size={44} />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold leading-snug">{r.title}</h3>
                        <p className="text-sm text-muted">Hosted by {r.host.displayName}</p>
                      </div>
                    </div>
                    <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
                      <span className="inline-flex items-center gap-1 rounded-sm bg-paper-deep px-2 py-0.5 font-semibold"><Icon name={r.activity} size={14} /> {activityById(r.activity).name}</span>
                      {r.topic && <span className="rounded-sm bg-paper-deep px-2 py-0.5 capitalize">{r.topic}</span>}
                      {shared.length > 0 && <span className="rounded-sm bg-teal-soft px-2 py-0.5 font-semibold text-teal-dark">You both like {shared.slice(0, 2).join(", ")}</span>}
                    </p>
                    <Button className="mt-4 self-start" size="sm" onClick={() => join(r.code)} loading={joining === r.code} disabled={joining !== null}>
                      Sit down <Icon name="arrowRight" size={16} />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <QuickMatch onMatched={(code) => router.push(`/room/${code}`)} />
          <StartTable onCreated={(code) => router.push(`/room/${code}`)} />
          <JoinByCode />
        </aside>
      </div>
    </div>
  );
}

function QuickMatch({ onMatched }: { onMatched: (code: string) => void }) {
  const [activity, setActivity] = useState<ActivityId | "any">("any");
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socket = useRef<Socket | null>(null);

  useEffect(() => () => {
    socket.current?.emit("match:leave");
    socket.current?.disconnect();
  }, []);

  async function start() {
    setError(null);
    setWaiting(true);
    const s = socket.current ?? openSocket();
    socket.current = s;
    s.off("match:found").on("match:found", ({ code }: { code: string }) => {
      track("quick_match");
      onMatched(code);
    });
    if (!s.connected) await new Promise<void>((resolve) => s.once("connect", () => resolve()));
    const res = await emitAck(s, "match:join", { activity });
    if (!res.ok) {
      setError(res.error ?? "Could not start matching");
      setWaiting(false);
    }
  }

  function cancel() {
    socket.current?.emit("match:leave");
    setWaiting(false);
  }

  return (
    <section aria-labelledby="qm-heading" className="rounded-lg border border-line bg-surface p-5">
      <h2 id="qm-heading" className="font-display text-xl font-semibold">Quick Match</h2>
      <p className="mt-1 text-sm text-muted">We pair you with someone waiting for the same activity, favouring shared interests.</p>
      {waiting ? (
        <div className="text-center">
          <Loader variant="orbit" caption={`Looking for someone for ${activity === "any" ? "anything" : activityById(activity).name}`} />
          <Button variant="secondary" size="sm" onClick={cancel}>Stop looking</Button>
        </div>
      ) : (
        <>
          <label htmlFor="qm-activity" className="mt-4 mb-1.5 block text-sm font-semibold">Activity</label>
          <select
            id="qm-activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityId | "any")}
            className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 focus:border-teal focus:outline-none"
          >
            <option value="any">Anything</option>
            {ACTIVITIES.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <Button className="mt-3 w-full" onClick={start}>Find someone</Button>
        </>
      )}
      {error && <p role="alert" className="mt-2 text-sm font-medium text-coral-dark">{error}</p>}
    </section>
  );
}

function StartTable({ onCreated }: { onCreated: (code: string) => void }) {
  const [title, setTitle] = useState("");
  const [activity, setActivity] = useState<ActivityId>("wyr");
  const [topic, setTopic] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const titleError = validateTableTitle(title);
    setErrors(titleError ? { title: titleError } : {});
    if (titleError) return;
    setBusy(true);
    setFormError(null);
    try {
      const { room } = await api<{ room: Room }>("/rooms", { body: { title, activity, topic, isPublic } });
      track("table_create");
      onCreated(room.code);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      setFormError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="start-heading" className="rounded-lg border border-line bg-surface p-5">
      <h2 id="start-heading" className="font-display text-xl font-semibold">Start a table</h2>
      <form onSubmit={submit} noValidate className="mt-3 space-y-3">
        <FormError message={formError} />
        <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} placeholder={`${activityById(activity).name} and a chat`} maxLength={60} />
        <div>
          <label htmlFor="start-activity" className="mb-1.5 block text-sm font-semibold">First activity</label>
          <select id="start-activity" value={activity} onChange={(e) => setActivity(e.target.value as ActivityId)} className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 focus:border-teal focus:outline-none">
            {ACTIVITIES.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <p className="mt-1 text-sm text-muted">{activityById(activity).short} You can switch any time.</p>
        </div>
        <div>
          <label htmlFor="start-topic" className="mb-1.5 block text-sm font-semibold">Topic (optional)</label>
          <select id="start-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 capitalize focus:border-teal focus:outline-none">
            <option value="">No topic</option>
            {INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <label className="flex cursor-pointer items-start gap-2.5 text-[0.95rem]">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="mt-1 h-4 w-4 accent-coral" />
          <span>List it in the lobby <span className="block text-sm text-muted">Turn off to only let in people with your code.</span></span>
        </label>
        <Button type="submit" variant="accent" className="w-full" loading={busy}>Start the table</Button>
      </form>
    </section>
  );
}

function JoinByCode() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const clean = normaliseRoomCode(code);
    if (!clean) return setError("Codes are 6 letters and numbers, like K7MQ2X");
    setBusy(true);
    setError(null);
    try {
      await api(`/rooms/${clean}/join`, { method: "POST" });
      router.push(`/room/${clean}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="code-heading" className="rounded-lg border border-line bg-surface p-5">
      <h2 id="code-heading" className="font-display text-xl font-semibold">Have a code?</h2>
      <form onSubmit={submit} noValidate className="mt-3 flex gap-2">
        <label htmlFor="join-code" className="sr-only">Table code</label>
        <input
          id="join-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="K7MQ2X"
          maxLength={8}
          autoCapitalize="characters"
          aria-invalid={error ? true : undefined}
          className="h-11 min-w-0 flex-1 rounded-md border border-line-strong bg-surface px-3 font-mono tracking-widest uppercase focus:border-teal focus:outline-none"
        />
        <button type="submit" disabled={busy} className={buttonClass("primary")}>Join</button>
      </form>
      {error && <p role="alert" className="mt-2 text-sm font-medium text-coral-dark">{error}</p>}
    </section>
  );
}
