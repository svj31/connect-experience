"use client";

import Link from "next/link";
import { Coach } from "../ui/Coach";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ACTIVITIES, CATEGORIES, activityById, type ActivityInfo, type Category } from "@/lib/activities";
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
import { Planet } from "../ui/Planet";
import { TitleWords } from "../ui/TitleWords";
import { LivePlans } from "./LivePlans";
import { TogetherSystem, WORLDS } from "./TogetherSystem";

type Who = "connection" | "new" | "code";

export function Together() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useSession();
  const { socket, toast } = useLive();
  const preset = params.get("pick");
  const presetActivity = preset && ACTIVITIES.some((a) => a.id === preset) ? (preset as ActivityId) : null;
  const [category, setCategory] = useState<Category | null>(presetActivity ? activityById(presetActivity).category : null);
  const [preview, setPreview] = useState<ActivityInfo | null>(null);
  const [activity, setActivity] = useState<ActivityId | null>(presetActivity);
  const [who, setWho] = useState<Who>("connection");
  const [locked, setLocked] = useState(false);
  const [ideas, setIdeas] = useState<Suggestion[]>([]);
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [open, setOpen] = useState<OpenRoom[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api<{ activities: Suggestion[] }>("/me/suggestions").then((r) => setIdeas(r.activities)).catch(() => undefined);
    api<{ connections: Connection[] }>("/connections").then((r) => setConnections(r.connections)).catch(() => setConnections([]));
    api<{ rooms: OpenRoom[] }>("/rooms/open").then((r) => setOpen(r.rooms)).catch(() => undefined);
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
      toast("Invite sent", `${c.person.displayName} can join or decline from Together. You can cancel it there too.`);
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

  const world = category ? CATEGORIES.find((c) => c.id === category)! : null;
  const shown = preview ?? (chosen && chosen.category === category ? chosen : null);

  return (
    // One screen: the solar system on the left, a panel that guides each step on the right.
    <div className="mx-auto flex h-[calc(100dvh-13rem)] min-h-[560px] max-w-6xl flex-col lg:h-[calc(100dvh-10rem)]">
      <div className="mb-4 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
        <h1 className="font-display text-[2.4rem] leading-none sm:text-5xl"><TitleWords text="Together" /></h1>
        <p className="hidden text-muted md:block">{world ? `${world.name}: ${world.blurb.toLowerCase()}.` : "Choose a world, then an activity, then who with."}</p>
        {category && liveCount > 0 && (
          <button type="button" onClick={() => { setCategory(null); setActivity(null); setPreview(null); }} className="ml-auto flex items-center gap-2 rounded-full bg-violet-soft px-4 py-2 text-sm font-semibold text-violet">
            <span className="sv-ping h-2 w-2 rounded-full bg-rose" /> Live now ({liveCount})
          </button>
        )}
        <Link href="/app/chats" className={`${category && liveCount > 0 ? "" : "ml-auto "} flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm font-semibold hover:border-ink`}><Icon name="chat" size={16} /> Just chat</Link>
      </div>
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_380px]">
      {!category && <Coach id="together" kind="tap" text="Tap a world: Talk, Play, Create or Watch. Its activities appear as moons." />}
        <div className="h-[46vh] min-h-[300px] lg:h-full">
          <TogetherSystem
            me={{ name: user?.displayName ?? "You", avatar: user?.avatar ?? {} }}
            category={category}
            activity={activity}
            forYou={topIdeas}
            onCategory={(c) => { setCategory(c); setActivity(null); setPreview(null); setError(null); }}
            onActivity={(a) => { setActivity(a); setError(null); }}
            onPreview={setPreview}
          />
        </div>
        <aside aria-label="Your choice" className="no-scrollbar min-h-0 overflow-y-auto rounded-[28px] border border-line bg-surface p-5 lg:p-6">
          {!world ? (
            <div className="animate-rise">
              <div className={liveCount ? "mb-6 border-b border-line pb-5" : "mb-5"}>
                <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-violet uppercase">Live now</p>
                <LivePlans onCount={setLiveCount} />
              </div>
              <p className="text-sm font-semibold tracking-[0.18em] text-violet uppercase">Step 1</p>
              <h2 className="mt-1 font-display text-3xl">What do you feel like?</h2>
              <ul className="mt-5 space-y-2">
                {CATEGORIES.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => { setCategory(c.id); setActivity(null); }} className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-paper-deep">
                      <Planet config={WORLDS[c.id]} size={44} />
                      <span><span className="block font-semibold">{c.name}</span><span className="block text-sm text-muted">{c.blurb}</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : !chosen || chosen.category !== category ? (
            <div key={world.id} className="animate-rise">
              <p className="text-sm font-semibold tracking-[0.18em] text-violet uppercase">Step 2</p>
              <h2 className="mt-1 font-display text-3xl">Pick an activity in {world.name}</h2>
              {shown ? (
                <div key={shown.id} className="mt-5 animate-rise rounded-2xl bg-paper-deep p-4">
                  <p className="flex items-center gap-2 font-semibold"><Icon name={shown.id} size={18} className="text-violet" />{shown.name} <span className="text-sm font-normal text-muted">· {shown.minutes}</span></p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{shown.long}</p>
                  {reasonFor(shown.id) && <p className="mt-2 flex items-center gap-1.5 text-sm text-violet"><Icon name="sparkle" size={14} />{reasonFor(shown.id)}</p>}
                </div>
              ) : (
                <p className="mt-3 text-muted">Its activities are the moons around it. Point at one to read about it, then choose it.</p>
              )}
              <ul className="mt-5 space-y-1.5 lg:hidden">
                {ACTIVITIES.filter((a) => a.category === category).map((a) => (
                  <li key={a.id}><button type="button" onClick={() => setActivity(a.id)} className="flex w-full items-center gap-2 rounded-xl p-2 text-left text-sm hover:bg-paper-deep"><Icon name={a.id} size={16} className="text-violet" />{a.short}</button></li>
                ))}
              </ul>
            </div>
          ) : null}

      {chosen && (
        <section key={chosen.id} aria-labelledby="step2" className="animate-rise">
          <p className="text-sm font-semibold tracking-[0.18em] text-violet uppercase">Step 3</p>
          <h2 id="step2" className="mt-1 font-display text-3xl">Who with?</h2>
          <p className="mt-2 mb-4 flex items-start gap-2 text-sm text-muted"><Icon name={chosen.id} size={16} className="mt-0.5 shrink-0 text-violet" /><span><span className="font-semibold text-ink">{chosen.name}</span> · {chosen.minutes}. {chosen.short}</span></p>
          <div role="tablist" aria-label="Who with" className="grid gap-2">
            {([
              ["connection", "users", "Someone I am connected with", "Opens in your shared space. Bond points add up."],
              ["new", "discover", "Meet someone new", "Quick Match or an open table."],
              ["code", "key", "Invite with a code", "A private table for a friend, or join theirs."],
            ] as const).map(([id, icon, label, hint]) => (
              <button key={id} role="tab" aria-selected={who === id} onClick={() => { setWho(id); setError(null); }} className={`flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${who === id ? "border-violet bg-violet-soft" : "border-line bg-surface hover:border-line-strong"}`}>
                <Icon name={icon} className="mt-0.5 shrink-0 text-violet" />
                <span><span className="block font-semibold">{label}</span><span className="block text-xs text-muted">{hint}</span></span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            {error && <p role="alert" className="mb-3 text-sm font-medium text-danger">{error}</p>}
            {who === "connection" ? (
              connections === null ? (
                <Loader variant="hearts" caption="Finding your people" size={64} />
              ) : connections.length === 0 ? (
                <p className="text-muted">No connections yet. <Link href="/app/discover" className="font-semibold text-violet">Find someone in Discover</Link>, or meet someone new here.</p>
              ) : (
                <ul className="grid gap-2">
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
                  <div className="grid gap-2">
                    {[[false, "Free to switch", "Either of you can change the activity inside."], [true, `Only ${chosen.name}`, "The table stays on this activity."]].map(([value, label, hint]) => (
                      <label key={String(value)} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 ${locked === value ? "border-violet bg-violet-soft" : "border-line"}`}>
                        <input type="radio" name="locked" checked={locked === value} onChange={() => setLocked(value as boolean)} className="mt-1 accent-[var(--violet)]" />
                        <span><span className="block font-semibold">{label as string}</span><span className="block text-sm text-muted">{hint as string}</span></span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {who === "new" ? (
                  <div className="grid gap-4">
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
                    <div>
                      <p className="mb-2 font-bold">Open tables {activity ? `for ${chosen.name}` : ""}</p>
                      {tablesForActivity.length === 0 ? (
                        <p className="text-sm text-muted">None right now. Open one and it shows up for others.</p>
                      ) : (
                        <ul className="grid gap-2">
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
                  <div className="grid gap-4">
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
        </aside>
      </div>
    </div>
  );
}
