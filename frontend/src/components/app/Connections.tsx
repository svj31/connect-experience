"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ACTIVITIES } from "@/lib/activities";
import { api, errorMessage } from "@/lib/api";
import { timeAgo } from "@/lib/labels";
import { useLive } from "@/lib/live";
import { useSession } from "@/lib/session";
import type { BondLevel, Connection } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { Button, ButtonLink } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";
import { Modal } from "../ui/Modal";
import { BondMeter, BondOrbit, EmptyState, PageHeader, VibeRing, ViewToggle, useView } from "./widgets";

interface Data { connections: Connection[]; incoming: Connection[]; outgoing: Connection[]; levels: BondLevel[] }

function PlayMenu({ c }: { c: Connection }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  async function play(activity: string) {
    const res = await api<{ roomCode: string }>(`/connections/${c.id}/play`, { body: { activity } }).catch(() => null);
    if (res) router.push(`/app/room/${res.roomCode}`);
  }
  return (
    <div ref={ref} className="relative">
      <Button size="sm" variant="soft" onClick={() => setOpen((o) => !o)} aria-expanded={open}><Icon name="orbit" size={15} /> Do something <Icon name="chevronDown" size={14} /></Button>
      {open && (
        <ul className="absolute right-0 z-30 mt-1 w-56 animate-pop rounded-2xl border border-line-strong bg-surface p-1.5 shadow-[var(--shadow)]">
          {ACTIVITIES.map((a) => (
            <li key={a.id}>
              <button onClick={() => play(a.id)} className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm font-semibold hover:bg-violet-soft">
                <Icon name={a.id} size={16} className="text-violet" /> {a.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ c, onRemove }: { c: Connection; onRemove: (c: Connection) => void }) {
  const p = c.person;
  return (
    <li className="lift flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-4">
      <Avatar name={p.displayName} config={p.avatar} size={56} online={p.online} />
      <div className="min-w-[10rem] flex-1">
        <Link href={`/app/people/${p.id}`} className="font-display text-lg font-semibold hover:text-violet">{p.displayName}</Link>
        <p className="truncate text-sm text-muted">{c.lastMessage ? `${c.lastMessage.mine ? "You: " : ""}${c.lastMessage.body}` : `Connected ${timeAgo(c.since)}`}</p>
      </div>
      <div className="w-44">{c.bond && <BondMeter bond={c.bond} compact />}</div>
      <VibeRing score={p.vibe.score} size={44} />
      <div className="flex flex-wrap gap-2">
        <ButtonLink href={`/app/chats?c=${c.id}`} size="sm" variant="secondary"><Icon name="chat" size={15} /> Chat</ButtonLink>
        <PlayMenu c={c} />
        <button onClick={() => onRemove(c)} className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-rose-soft hover:text-danger" title="Remove connection"><Icon name="trash" size={16} label={`Remove ${p.displayName}`} /></button>
      </div>
    </li>
  );
}

export function Connections() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useSession();
  const { celebrate } = useLive();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tab = (params.get("tab") as "all" | "requests" | "sent") ?? "all";
  const [view, setView] = useView<"list" | "cards" | "ladder">("connections", "list");
  const [removing, setRemoving] = useState<Connection | null>(null);

  const load = useCallback(() => {
    api<Data>("/connections").then(setData).catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  async function accept(c: Connection) {
    const res = await api<{ roomCode: string }>(`/connections/${c.id}/accept`, { method: "POST" }).catch(() => null);
    if (res) celebrate({ title: "It's a Saath!", message: `You and ${c.person.displayName} are connected.`, them: { name: c.person.displayName, avatar: c.person.avatar }, href: `/app/room/${res.roomCode}`, cta: "Say hello" });
    load();
  }
  async function decline(c: Connection) {
    await api(c.outgoing ? `/connections/${c.id}` : `/connections/${c.id}/decline`, { method: c.outgoing ? "DELETE" : "POST" }).catch(() => undefined);
    load();
  }

  const tabs = [
    { id: "all", label: "Connections", n: data?.connections.length },
    { id: "requests", label: "Requests", n: data?.incoming.length },
    { id: "sent", label: "Sent", n: data?.outgoing.length },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Connections"
        icon="users"
        subtitle="Everyone you are connected with, how close your bond is, and what to do next."
        actions={tab === "all" && <ViewToggle value={view} onChange={setView} options={[{ id: "list", label: "List", icon: "list" }, { id: "cards", label: "Cards", icon: "grid" }, { id: "ladder", label: "Bond ladder", icon: "layers" }]} />}
      />
      <div role="tablist" className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => router.replace(t.id === "all" ? "/app/connections" : `/app/connections?tab=${t.id}`)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 font-bold whitespace-nowrap ${tab === t.id ? "border-violet text-violet" : "border-transparent text-muted hover:text-ink"}`}
          >
            {t.label}
            {t.n ? <span className={`rounded-md px-1.5 text-xs ${t.id === "requests" ? "bg-rose text-on-primary" : "bg-paper-deep"}`}>{t.n}</span> : null}
          </button>
        ))}
      </div>

      {error ? (
        <EmptyState title="Could not load connections" body={error} />
      ) : !data || !user ? (
        <Loader variant="hearts" caption="Gathering your people" />
      ) : tab === "requests" || tab === "sent" ? (
        (tab === "requests" ? data.incoming : data.outgoing).length === 0 ? (
          <EmptyState title={tab === "requests" ? "No requests right now" : "Nothing pending"} body={tab === "requests" ? "When someone wants to connect, they show up here." : "Requests you send wait here until they reply."} action={<ButtonLink href="/app/discover">Discover people</ButtonLink>} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {(tab === "requests" ? data.incoming : data.outgoing).map((c) => (
              <li key={c.id} className="animate-rise rounded-3xl border border-line bg-surface p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={c.person.displayName} config={c.person.avatar} size={60} online={c.person.online} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/app/people/${c.person.id}`} className="font-display text-xl font-semibold hover:text-violet">{c.person.displayName}{c.person.age ? `, ${c.person.age}` : ""}</Link>
                    <p className="text-sm text-muted">{c.outgoing ? "Sent" : "Asked"} {timeAgo(c.since)}</p>
                  </div>
                  <VibeRing score={c.person.vibe.score} />
                </div>
                {c.note && <p className="mt-3 rounded-2xl bg-violet-soft p-3 text-sm">&ldquo;{c.note}&rdquo;</p>}
                {c.person.vibe.reasons[0] && <p className="mt-2 flex gap-1.5 text-sm font-semibold text-rose"><Icon name="sparkle" size={15} className="mt-0.5" />{c.person.vibe.reasons[0]}</p>}
                <div className="mt-4 flex gap-2">
                  {c.outgoing ? (
                    <Button size="sm" variant="secondary" onClick={() => decline(c)}>Cancel request</Button>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => accept(c)}><Icon name="heart" size={15} /> Accept</Button>
                      <Button size="sm" variant="secondary" onClick={() => decline(c)}>Not now</Button>
                      <ButtonLink size="sm" variant="ghost" href={`/app/people/${c.person.id}`}>View profile</ButtonLink>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : data.connections.length === 0 ? (
        <EmptyState title="No connections yet" body="Find someone in Discover. When they say yes, you get a private space to chat and play." action={<ButtonLink href="/app/discover">Discover people</ButtonLink>} />
      ) : view === "list" ? (
        <ul className="space-y-3">{data.connections.map((c) => <Row key={c.id} c={c} onRemove={setRemoving} />)}</ul>
      ) : view === "cards" ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.connections.map((c) => (
            <li key={c.id} className="lift rounded-3xl border border-line bg-surface p-5 text-center">
              {c.bond && <BondOrbit bond={c.bond} me={{ name: user.displayName, avatar: user.avatar }} them={{ name: c.person.displayName, avatar: c.person.avatar }} size={200} />}
              <Link href={`/app/people/${c.person.id}`} className="font-display text-xl font-semibold hover:text-violet">{c.person.displayName}</Link>
              <div className="mt-2 text-left">{c.bond && <BondMeter bond={c.bond} />}</div>
              <div className="mt-4 flex justify-center gap-2">
                <ButtonLink href={`/app/chats?c=${c.id}`} size="sm" variant="secondary"><Icon name="chat" size={15} /> Chat</ButtonLink>
                <PlayMenu c={c} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid gap-3 md:grid-cols-5">
          {data.levels.map((l) => {
            const here = data.connections.filter((c) => c.bond?.level === l.level);
            return (
              <section key={l.level} className="rounded-2xl border border-line bg-surface/80 p-3" aria-label={`${l.name} bonds`}>
                <h2 className="font-display text-lg font-semibold">{l.name}</h2>
                <p className="text-xs text-muted">From {l.min} points</p>
                <ul className="mt-3 space-y-2">
                  {here.length === 0 && <li className="rounded-xl border border-dashed border-line-strong p-2 text-center text-xs text-muted">Nobody yet</li>}
                  {here.map((c) => (
                    <li key={c.id}>
                      <Link href={`/app/people/${c.person.id}`} className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2 hover:border-violet">
                        <Avatar name={c.person.displayName} config={c.person.avatar} size={32} decorative />
                        <span className="truncate text-sm font-bold">{c.person.displayName}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <Modal open={Boolean(removing)} onClose={() => setRemoving(null)} title="Remove connection?">
        <p className="text-muted">You and {removing?.person.displayName} will no longer be connected and your shared space will close. Your moments stay in your gallery.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRemoving(null)}>Keep</Button>
          <Button variant="danger" onClick={async () => { await api(`/connections/${removing!.id}`, { method: "DELETE" }); setRemoving(null); load(); }}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
