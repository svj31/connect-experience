"use client";

import Link from "next/link";
import { TitleWords } from "../ui/TitleWords";
import { PhotoPlanet } from "../ui/PhotoPlanet";
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
import { BondMeter, BondOrbit, EmptyState, VibeRing, ViewToggle, useView } from "./widgets";

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
        <Link href={`/app/people/${p.id}`} className="font-display text-lg font-bold hover:text-violet">{p.displayName}</Link>
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
  const tab = (params.get("tab") as "all" | "requests" | "sent") ?? "requests";
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
    { id: "requests", label: "Likes you", n: data?.incoming.length },
    { id: "all", label: "Matches", n: data?.connections.length },
    { id: "sent", label: "Sent", n: data?.outgoing.length },
  ];

  return (
    // One screen tall, like Discover and Matches.
    <div className="mx-auto flex h-[calc(100dvh-13rem)] min-h-[420px] max-w-6xl flex-col lg:h-[calc(100dvh-10rem)]">
      {/* One slim toolbar: title, tabs and (for Matches) the view switch, so the cards get the room. */}
      <div className="mb-4 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3">
        <h1 className="font-display text-[2.4rem] leading-none sm:text-5xl"><TitleWords text="Likes" /></h1>
        <div role="tablist" aria-label="Likes" className={`no-scrollbar flex gap-1 overflow-x-auto ${tab === "all" ? "order-last w-full sm:order-none sm:w-auto" : ""}`}>
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => router.replace(t.id === "requests" ? "/app/connections" : `/app/connections?tab=${t.id}`)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${tab === t.id ? "bg-brand shadow-brand" : "text-muted hover:bg-paper-deep hover:text-ink"}`}
            >
              {t.label}
              {t.n ? <span className={`rounded-full px-2 py-0.5 text-xs ${tab === t.id ? "bg-white/25" : t.id === "requests" ? "bg-saffron" : "bg-paper-deep"}`}>{t.n}</span> : null}
            </button>
          ))}
        </div>
        {tab === "all" && <div className="ml-auto"><ViewToggle value={view} onChange={setView} options={[{ id: "list", label: "List", icon: "list" }, { id: "cards", label: "Cards", icon: "grid" }, { id: "ladder", label: "Bond ladder", icon: "layers" }]} /></div>}
      </div>

      {/* Only the cards scroll; the title, tabs and filters stay in place. */}
      <div className="no-scrollbar -mx-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-4">
      {error ? (
        <EmptyState title="Could not load connections" body={error} />
      ) : !data || !user ? (
        <Loader variant="hearts" caption="Gathering your people" />
      ) : tab === "requests" || tab === "sent" ? (
        (tab === "requests" ? data.incoming : data.outgoing).length === 0 ? (
          <EmptyState title={tab === "requests" ? "No new likes yet" : "Nothing pending"} body={tab === "requests" ? "When someone likes you, they show up here. Like them back to match." : "Likes you send wait here until they like you back."} action={<ButtonLink href="/app/discover">Discover people</ButtonLink>} />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {[...(tab === "requests" ? data.incoming : data.outgoing)].sort((a, b) => Number(Boolean(b.superLike)) - Number(Boolean(a.superLike))).map((c) => {
              const photo = c.person.photos?.[0] ?? c.person.avatar.photo;
              return (
                <li key={c.id} className={`animate-rise flex flex-col overflow-hidden rounded-[24px] border bg-surface ${c.superLike ? "border-[#f2a900]" : "border-line"}`}>
                  <Link href={`/app/people/${c.person.id}`} className="relative block" aria-label={`${c.person.displayName}${c.person.age ? `, ${c.person.age}` : ""}`}>
                    <PhotoPlanet photo={photo} planet={c.person.avatar} alt="" className="aspect-[4/5] w-full" />
                    {c.superLike && <span className="bg-saffron absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"><Icon name="star" size={13} />{c.outgoing ? "You super liked" : "Super like"}</span>}
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-14 text-white sm:p-4">
                      <span className="block font-display text-xl leading-none sm:text-[1.7rem]">{c.person.displayName}{c.person.age ? `, ${c.person.age}` : ""}</span>
                      <span className="mt-1 block text-xs text-white/80">{c.outgoing ? "You liked" : "Liked you"} {timeAgo(c.since)}{c.person.vibe.score !== null ? ` · ${c.person.vibe.score}% vibe` : ""}</span>
                    </span>
                  </Link>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    {c.note ? <p className="rounded-2xl bg-paper-deep p-3 text-sm">&ldquo;{c.note}&rdquo;</p> : c.person.vibe.reasons[0] ? <p className="flex gap-1.5 text-sm text-violet"><Icon name="sparkle" size={15} className="mt-0.5 shrink-0" />{c.person.vibe.reasons[0]}</p> : null}
                    <div className="mt-auto flex flex-wrap gap-2 pt-4">
                      {c.outgoing ? (
                        <Button size="sm" variant="secondary" onClick={() => decline(c)}>Cancel like</Button>
                      ) : (
                        <>
                          <Button size="sm" onClick={() => accept(c)}><Icon name="heart" size={15} /> Like back</Button>
                          <Button size="sm" variant="secondary" onClick={() => decline(c)}>Not now</Button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )
      ) : data.connections.length === 0 ? (
        <EmptyState title="No connections yet" body="Find someone in Discover. When they say yes, you get a private space to chat and play." action={<ButtonLink href="/app/discover">Discover people</ButtonLink>} />
      ) : view === "list" ? (
        <ul className="space-y-3">{data.connections.map((c) => <Row key={c.id} c={c} onRemove={setRemoving} />)}</ul>
      ) : view === "cards" ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.connections.map((c) => (
            <li key={c.id} className="lift rounded-[24px] border border-line bg-surface p-5 text-center">
              {c.bond && <BondOrbit bond={c.bond} me={{ name: user.displayName, avatar: user.avatar }} them={{ name: c.person.displayName, avatar: c.person.avatar }} size={200} />}
              <Link href={`/app/people/${c.person.id}`} className="font-display text-xl font-bold hover:text-violet">{c.person.displayName}</Link>
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
                <h2 className="font-display text-lg font-bold">{l.name}</h2>
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

      </div>
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
