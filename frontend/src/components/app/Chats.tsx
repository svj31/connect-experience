"use client";

import Link from "next/link";
import { StoryRow } from "./StoryRow";
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
import { EmptyState } from "./widgets";

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

  // One slim header: who, bond level and streak, quick activities, then the messages get the room.
  const bond = room.detail?.bond;
  const header = (
    <header className="shrink-0 border-b border-line px-3 py-2.5 sm:px-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-lg p-1 text-muted hover:text-ink lg:hidden" aria-label="Back to conversations"><Icon name="arrowLeft" /></button>
        <Avatar name={c.person.displayName} config={c.person.avatar} size={38} online={online} />
        <div className="min-w-0 flex-1">
          <Link href={`/app/people/${c.person.id}`} className="block truncate font-display text-lg leading-tight hover:text-violet">{c.person.displayName}</Link>
          <p className="flex items-center gap-2 truncate text-xs text-muted">
            {online ? "Online now" : "Away"}
            {bond && <span className="flex items-center gap-1 font-semibold text-violet"><Icon name="orbit" size={12} />{bond.name}</span>}
            {bond && bond.streak > 0 && <span className="flex items-center gap-0.5 font-semibold text-rose"><Icon name="fire" size={12} />{bond.streak}</span>}
          </p>
        </div>
        <div className="no-scrollbar hidden max-w-[45%] gap-1.5 overflow-x-auto md:flex">
          {ideas.map((s) => (
            <button key={s.id} onClick={() => play(s.id)} title={s.reason} className="flex shrink-0 items-center gap-1.5 rounded-full border border-line-strong px-2.5 py-1 text-xs font-semibold hover:border-ink">
              <Icon name={s.id} size={13} /> {activityById(s.id).name}
            </button>
          ))}
        </div>
        <ButtonLink href={`/app/room/${c.roomCode}`} size="sm" variant="accent"><Icon name="orbit" size={15} /> <span className="hidden sm:inline">Together</span></ButtonLink>
        <button onClick={() => setSafety(true)} className="rounded-full p-2 text-muted hover:bg-rose-soft hover:text-danger"><Icon name="shield" size={18} label="Safety options" /></button>
      </div>
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
    // Exactly the viewport minus the app chrome (top bar, page padding, phone tab bar), so the chat
    // never makes the page scroll; only the message list and conversation list scroll inside.
    <div className="mx-auto flex h-[calc(100dvh-12.5rem)] min-h-[360px] max-w-6xl flex-col lg:h-[calc(100dvh-9.5rem)]">
      <div className={`${selected ? "hidden lg:block" : ""} mb-4 shrink-0`}>
        <h1 className="font-display text-[2.2rem] leading-none">Matches</h1>
        {/* The desktop sidebar already lists matches; phones get the stories row here. */}
        <div className="mt-4 lg:hidden [&>nav]:mb-0"><StoryRow /></div>
      </div>
      {list.length === 0 ? (
        <EmptyState title="No chats yet" body="Chats open when someone accepts your connection request." action={<ButtonLink href="/app/discover">Discover people</ButtonLink>} />
      ) : (
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[320px_1fr]">
          <aside className={`${selected ? "hidden lg:flex" : "flex"} min-h-0 flex-col rounded-[24px] border border-line bg-surface`} aria-label="Conversations">
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
              <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-line-strong bg-surface/60">
                <Loader variant="chat" caption="Pick a conversation to start" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
