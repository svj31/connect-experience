"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ACTIVITIES, CATEGORIES, activityById, type Category } from "@/lib/activities";
import { api, errorMessage } from "@/lib/api";
import { track } from "@/lib/consent";
import { cap } from "@/lib/labels";
import { useLive } from "@/lib/live";
import { useSession } from "@/lib/session";
import { emitAck } from "@/lib/socket";
import type { ActivityId, Connection, OpenRoom, Room, Suggestion } from "@/lib/types";
import { normaliseRoomCode, validateTableTitle } from "@/lib/validation";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";
import { Chip, PageHeader } from "./widgets";

type Who = "connection" | "new" | "code";

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-3 font-display text-2xl font-bold">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-primary">{n}</span>
      {children}
    </h2>
  );
}

export function Together() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useSession();
  const { socket } = useLive();
  const preset = params.get("pick");
  const presetActivity = preset && ACTIVITIES.some((a) => a.id === preset) ? (preset as ActivityId) : null;
  const [category, setCategory] = useState<Category>(presetActivity ? activityById(presetActivity).category : "talk");
  const [activity, setActivity] = useState<ActivityId | null>(presetActivity);
  const [who, setWho] = useState<Who>("connection");
  const [locked, setLocked] = useState(false);
  const [ideas, setIdeas] = useState<Suggestion[]>([]);
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [open, setOpen] = useState<OpenRoom[]>([]);
  const [mine, setMine] = useState<Room[]>([]);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api<{ activities: Suggestion[] }>("/me/suggestions").then((r) => setIdeas(r.activities)).catch(() => undefined);
    api<{ connections: Connection[] }>("/connections").then((r) => setConnections(r.connections)).catch(() => setConnections([]));
    api<{ rooms: OpenRoom[] }>("/rooms/open").then((r) => setOpen(r.rooms)).catch(() => undefined);
    api<{ rooms: Room[] }>("/rooms/mine").then((r) => setMine(r.rooms)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const found = ({ code }: { code: string }) => {
      setSearching(false);
      router.push(`/app/room/${code}`);
    };
    socket.on("match:found", found);
    return () => {
      socket.off("match:found", found);
      socket.emit("match:leave");
    };
  }, [socket, router]);

  const reasonFor = (id: string) => ideas.find((s) => s.id === id && s.score > 0)?.reason;
  const topIdeas = ideas.slice(0, 3).map((s) => s.id);
  const chosen = activity ? activityById(activity) : null;

  async function playWith(c: Connection) {
    if (!activity) return;
    setBusy(true);
    try {
      const res = await api<{ roomCode: string }>(`/connections/${c.id}/play`, { body: { activity } });
      track(`together_${activity}`);
      router.push(`/app/room/${res.roomCode}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  async function createTable(publicTable: boolean) {
    if (!activity) return;
    const t = title.trim() || `${activityById(activity).name} with ${user?.displayName ?? "me"}`;
    const err = validateTableTitle(t);
    if (err) return setError(err);
    setBusy(true);
    try {
      const { room } = await api<{ room: Room }>("/rooms", { body: { title: t, activity, isPublic: publicTable, locked, topic: "" } });
      router.push(`/app/room/${room.code}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  async function quickMatch() {
    if (!socket || !activity) return;
    setSearching(true);
    setError(null);
    const res = await emitAck(socket, "match:join", { activity, locked });
    if (!res.ok) {
      setSearching(false);
      setError(res.error ?? "Could not start matching");
    }
  }

  async function joinCode(raw: string) {
    const c = normaliseRoomCode(raw);
    if (!c) return setError("Codes are 6 letters and numbers, like K7M2QX");
    setBusy(true);
    try {
      await api(`/rooms/${c}/join`, { method: "POST" });
      router.push(`/app/room/${c}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  const tablesForActivity = open.filter((r) => !activity || r.activity === activity);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Together" icon="orbit" subtitle="Pick what you feel like, then who with. Chat is always one tap away inside." actions={<Link href="/app/chats" className="flex items-center gap-1.5 rounded-xl border border-line-strong px-3 py-2 text-sm font-semibold hover:border-violet hover:text-violet"><Icon name="chat" size={16} /> Just chat</Link>} />

      {mine.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface p-3">
          <span className="text-sm font-bold">Your open tables:</span>
          {mine.map((r) => (
            <Link key={r.code} href={`/app/room/${r.code}`} className="flex items-center gap-1.5 rounded-lg bg-violet-soft px-2 py-1 text-sm font-semibold text-violet hover:underline">
              <Icon name={r.activity} size={14} /> {r.title}
            </Link>
          ))}
        </div>
      )}

      <section aria-labelledby="step1">
        <StepTitle n={1}><span id="step1">What do you feel like?</span></StepTitle>
        <div role="tablist" aria-label="Kinds of activity" className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={category === c.id}
              onClick={() => { setCategory(c.id); setActivity(null); }}
              className={`group rounded-[24px] border-2 p-4 text-left transition-all ${category === c.id ? "border-violet bg-violet-soft" : "border-line bg-surface hover:-translate-y-0.5 hover:border-line-strong"}`}
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:rotate-6 ${i % 2 ? "bg-brand" : "bg-brand"}`}><Icon name={c.icon} /></span>
              <span className="mt-2 block font-display text-xl font-bold">{c.name}</span>
              <span className="block text-sm text-muted">{c.blurb}</span>
            </button>
          ))}
        </div>
        <div role="tabpanel" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIVITIES.filter((a) => a.category === category).map((a) => {
            const reason = reasonFor(a.id);
            const selected = activity === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setActivity(a.id)}
                aria-pressed={selected}
                className={`relative animate-rise rounded-2xl border-2 p-4 text-left transition-all ${selected ? "border-rose bg-rose-soft" : "border-line bg-surface hover:border-violet"}`}
              >
                {topIdeas.includes(a.id) && <Chip tone="rose" className="absolute top-3 right-3"><Icon name="sparkle" size={11} />For you</Chip>}
                <Icon name={a.id} size={26} className="text-violet" />
                <span className="mt-2 block font-bold">{a.name}</span>
                <span className="block text-sm text-muted">{a.short}</span>
                <span className="mt-2 block text-xs font-semibold text-muted">{a.minutes}{reason ? ` · ${reason}` : ""}</span>
              </button>
            );
          })}
        </div>
      </section>

      {chosen && (
        <section aria-labelledby="step2" className="mt-10 animate-rise">
          <StepTitle n={2}><span id="step2">Who with?</span></StepTitle>
          <p className="-mt-2 mb-4 text-muted">{chosen.long}</p>
          <div role="tablist" aria-label="Who with" className="grid gap-3 md:grid-cols-3">
            {([
              ["connection", "users", "Someone I am connected with", "Opens in your shared space. Bond points add up."],
              ["new", "discover", "Meet someone new", "Quick Match or an open table."],
              ["code", "key", "Invite with a code", "A private table for a friend, or join theirs."],
            ] as const).map(([id, icon, label, hint]) => (
              <button key={id} role="tab" aria-selected={who === id} onClick={() => { setWho(id); setError(null); }} className={`rounded-2xl border-2 p-4 text-left transition-colors ${who === id ? "border-violet bg-violet-soft" : "border-line bg-surface hover:border-line-strong"}`}>
                <Icon name={icon} className="text-violet" />
                <span className="mt-1.5 block font-bold">{label}</span>
                <span className="block text-sm text-muted">{hint}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-[24px] border border-line bg-surface p-5">
            {error && <p role="alert" className="mb-3 text-sm font-medium text-danger">{error}</p>}
            {who === "connection" ? (
              connections === null ? (
                <Loader variant="hearts" caption="Finding your people" size={64} />
              ) : connections.length === 0 ? (
                <p className="text-muted">No connections yet. <Link href="/app/discover" className="font-semibold text-violet">Find someone in Discover</Link>, or meet someone new here.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {connections.map((c) => (
                    <li key={c.id}>
                      <button disabled={busy} onClick={() => playWith(c)} className="flex w-full items-center gap-3 rounded-2xl border border-line p-3 text-left transition-colors hover:border-violet hover:bg-violet-soft disabled:opacity-60">
                        <Avatar name={c.person.displayName} config={c.person.avatar} size={44} online={c.person.online} />
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold">{c.person.displayName}</span>
                          <span className="block text-xs text-muted">{c.bond?.name}{c.person.vibe.sharedInterests[0] ? ` · both like ${c.person.vibe.sharedInterests[0]}` : ""}</span>
                        </span>
                        <Icon name="play" size={18} className="text-violet" />
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <>
                <fieldset className="mb-5">
                  <legend className="mb-2 font-bold">Activity for this table</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[[false, "Free to switch", "Either of you can change the activity inside."], [true, `Only ${chosen.name}`, "The table stays on this activity."]].map(([value, label, hint]) => (
                      <label key={String(value)} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 ${locked === value ? "border-violet bg-violet-soft" : "border-line"}`}>
                        <input type="radio" name="locked" checked={locked === value} onChange={() => setLocked(value as boolean)} className="mt-1 accent-[var(--violet)]" />
                        <span><span className="block font-semibold">{label as string}</span><span className="block text-sm text-muted">{hint as string}</span></span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {who === "new" ? (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl bg-paper-deep p-4">
                      <p className="flex items-center gap-2 font-bold"><Icon name="zap" className="text-rose" /> Quick Match</p>
                      <p className="mt-1 text-sm text-muted">We pair you with someone waiting for {chosen.name}, favouring shared interests. Blocked people are never matched.</p>
                      {searching ? (
                        <div className="mt-2 text-center">
                          <Loader variant="compass" caption="Looking for someone in your orbit" size={80} />
                          <Button variant="secondary" size="sm" onClick={() => { socket?.emit("match:leave"); setSearching(false); }}>Stop looking</Button>
                        </div>
                      ) : (
                        <Button className="mt-3" onClick={quickMatch} disabled={!socket}><Icon name="zap" size={16} /> Find someone now</Button>
                      )}
                    </div>
                    <div className="rounded-2xl bg-paper-deep p-4">
                      <p className="flex items-center gap-2 font-bold"><Icon name="plus" className="text-violet" /> Open a public table</p>
                      <Field label="Table title" className="mt-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`${chosen.name} with ${user?.displayName ?? "me"}`} maxLength={60} />
                      <Button className="mt-3" onClick={() => createTable(true)} loading={busy}>Open table</Button>
                    </div>
                    <div className="lg:col-span-2">
                      <p className="mb-2 font-bold">Open tables {activity ? `for ${chosen.name}` : ""}</p>
                      {tablesForActivity.length === 0 ? (
                        <p className="text-sm text-muted">None right now. Open one and it shows up for others.</p>
                      ) : (
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {tablesForActivity.map((r) => {
                            const shared = r.host.interests.filter((i) => user?.interests.includes(i));
                            return (
                              <li key={r.code} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                                <Avatar name={r.host.displayName} shape={r.host.avatarShape} color={r.host.avatarColor} size={42} />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-bold">{r.title}</span>
                                  <span className="block truncate text-xs text-muted">{r.host.displayName}{r.locked ? " · one activity" : ""}{shared.length ? ` · you both like ${shared.slice(0, 2).map(cap).join(", ")}` : ""}</span>
                                </span>
                                <Button size="sm" onClick={() => joinCode(r.code)} disabled={busy}>Sit down</Button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-2xl bg-paper-deep p-4">
                      <p className="font-bold">Start a private table</p>
                      <p className="text-sm text-muted">You get a code to share. Only people with it can join.</p>
                      <Field label="Table title" className="mt-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`${chosen.name} with ${user?.displayName ?? "me"}`} maxLength={60} />
                      <Button className="mt-3" onClick={() => createTable(false)} loading={busy}>Create and get a code</Button>
                    </div>
                    <form className="rounded-2xl bg-paper-deep p-4" onSubmit={(e) => { e.preventDefault(); void joinCode(code); }}>
                      <p className="font-bold">Have a code?</p>
                      <Field label="Table code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="K7M2QX" maxLength={8} className="mt-2 [&_input]:font-mono [&_input]:tracking-[0.3em]" />
                      <Button type="submit" className="mt-3" loading={busy}>Join</Button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
