"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { activityById } from "@/lib/activities";
import { api, errorMessage } from "@/lib/api";
import { timeAgo } from "@/lib/labels";
import { useSession } from "@/lib/session";
import type { Connection, Suggestion } from "@/lib/types";
import { useRoom } from "@/lib/useRoom";
import { ChatPanel } from "../room/ChatPanel";
import { SafetyPanel } from "../room/SafetyPanel";
import { Avatar } from "../ui/Avatar";
import { ButtonLink } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";
import { Modal } from "../ui/Modal";
import { BondMeter, EmptyState, PageHeader } from "./widgets";

function Conversation({ c, me, onBack }: { c: Connection; me: number; onBack: () => void }) {
  const router = useRouter();
  const room = useRoom(c.roomCode, me);
  const [ideas, setIdeas] = useState<Suggestion[]>([]);
  const [safety, setSafety] = useState(false);
  useEffect(() => {
    api<{ activities: Suggestion[] }>(`/me/suggestions?with=${c.person.id}`).then((r) => setIdeas(r.activities.slice(0, 3))).catch(() => undefined);
  }, [c.person.id]);
  const online = room.snapshot?.online.includes(c.person.id) ?? c.person.online;

  async function play(activity: string) {
    const res = await api<{ roomCode: string }>(`/connections/${c.id}/play`, { body: { activity } }).catch(() => null);
    if (res) router.push(`/app/room/${res.roomCode}`);
  }

  const header = (
    <header className="border-b border-line px-4 py-3">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-lg p-1 text-muted hover:text-ink lg:hidden" aria-label="Back to conversations"><Icon name="arrowLeft" /></button>
        <Avatar name={c.person.displayName} config={c.person.avatar} size={44} online={online} />
        <div className="min-w-0 flex-1">
          <Link href={`/app/people/${c.person.id}`} className="font-display text-lg font-semibold hover:text-violet">{c.person.displayName}</Link>
          <p className="text-xs text-muted">{online ? "Online now" : "Away"}</p>
        </div>
        <ButtonLink href={`/app/room/${c.roomCode}`} size="sm" variant="accent"><Icon name="orbit" size={15} /> <span className="hidden sm:inline">Together</span></ButtonLink>
        <button onClick={() => setSafety(true)} className="rounded-xl p-2 text-muted hover:bg-rose-soft hover:text-danger"><Icon name="shield" size={18} label="Safety options" /></button>
      </div>
      {room.detail?.bond && <div className="mt-2"><BondMeter bond={room.detail.bond} compact /></div>}
      {ideas.length > 0 && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {ideas.map((s) => (
            <button key={s.id} onClick={() => play(s.id)} title={s.reason} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line-strong px-2 py-1 text-xs font-bold hover:border-violet hover:text-violet">
              <Icon name={s.id} size={14} /> {activityById(s.id).name}
            </button>
          ))}
        </div>
      )}
    </header>
  );

  return (
    <>
      <ChatPanel
        header={header}
        messages={room.messages}
        me={me}
        partnerName={c.person.displayName}
        partnerTyping={room.partnerTyping}
        disabled={!room.joined}
        loading={!room.detail && !room.fatal}
        onSend={room.send}
        onTyping={room.typing}
        onReact={room.react}
        extraPrompts={c.person.vibe.sharedInterests.slice(0, 2).map((i) => `We both like ${i}. What got you into it?`)}
      />
      <Modal open={safety} onClose={() => setSafety(false)} title={`Report or block ${c.person.displayName}`}>
        <SafetyPanel partnerId={c.person.id} partnerName={c.person.displayName} code={c.roomCode ?? undefined} onDone={() => router.push("/app/connections")} />
      </Modal>
    </>
  );
}

export function Chats() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useSession();
  const [list, setList] = useState<Connection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const selectedId = Number(params.get("c") ?? 0);

  useEffect(() => {
    api<{ connections: Connection[] }>("/connections").then((r) => setList(r.connections)).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <EmptyState title="Chats are not loading" body={error} />;
  if (!list || !user) return <Loader variant="chat" caption="Opening your conversations" />;
  const selected = list.find((c) => c.id === selectedId) ?? null;
  const shown = list.filter((c) => c.person.displayName.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Chats" icon="chat" subtitle="Private conversations with your connections. Jump into an activity any time." />
      {list.length === 0 ? (
        <EmptyState title="No chats yet" body="Chats open when someone accepts your connection request." action={<ButtonLink href="/app/discover">Discover people</ButtonLink>} />
      ) : (
        <div className="grid h-[calc(100dvh-15rem)] min-h-[480px] gap-4 lg:grid-cols-[320px_1fr]">
          <aside className={`${selected ? "hidden lg:flex" : "flex"} min-h-0 flex-col rounded-3xl border border-line bg-surface`} aria-label="Conversations">
            <div className="border-b border-line p-3">
              <label htmlFor="chat-search" className="sr-only">Search conversations</label>
              <div className="flex items-center gap-2 rounded-xl border border-line-strong px-3">
                <Icon name="search" size={16} className="text-muted" />
                <input id="chat-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-10 w-full bg-transparent focus:outline-none" />
              </div>
            </div>
            <ul className="flex-1 overflow-y-auto p-2">
              {shown.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => router.replace(`/app/chats?c=${c.id}`)}
                    aria-current={c.id === selectedId ? "true" : undefined}
                    className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors ${c.id === selectedId ? "bg-violet-soft" : "hover:bg-paper-deep"}`}
                  >
                    <Avatar name={c.person.displayName} config={c.person.avatar} size={46} online={c.person.online} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-bold">{c.person.displayName}</span>
                        {c.lastMessage && <span className="shrink-0 text-[11px] text-muted">{timeAgo(c.lastMessage.at)}</span>}
                      </span>
                      <span className="block truncate text-sm text-muted">{c.lastMessage ? `${c.lastMessage.mine ? "You: " : ""}${c.lastMessage.body}` : "Say hello"}</span>
                      {c.bond && (
                        <span className="mt-0.5 flex items-center gap-2 text-[11px] font-bold text-violet">
                          {c.bond.name}{c.bond.streak > 0 && <span className="flex items-center gap-0.5 text-rose"><Icon name="fire" size={11} />{c.bond.streak}</span>}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <div className={`${selected ? "flex" : "hidden lg:flex"} min-h-0 flex-col`}>
            {selected ? (
              <Conversation key={selected.id} c={selected} me={user.id} onBack={() => router.replace("/app/chats")} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-line-strong bg-surface/60">
                <Loader variant="chat" caption="Pick a conversation to start" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
