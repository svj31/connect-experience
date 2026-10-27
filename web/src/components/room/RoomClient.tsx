"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { ACTIVITY_COMPONENTS } from "@/components/activities";
import { ACTIVITIES, activityById } from "@/lib/activities";
import { api, errorMessage } from "@/lib/api";
import { track } from "@/lib/consent";
import { useRequireUser } from "@/lib/session";
import { emitAck, openSocket } from "@/lib/socket";
import type { ActivityId, AvatarColor, AvatarShape, ChatMessage, Reaction, RoomDetail, Snapshot } from "@/lib/types";
import { LogoMark } from "../brand/Logo";
import { Avatar } from "../ui/Avatar";
import { Button, buttonClass } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Loader, PageLoader } from "../ui/Loader";
import { Modal } from "../ui/Modal";
import { ChatPanel } from "./ChatPanel";
import { CommonGroundPanel } from "./CommonGroundPanel";
import { RevealPanel } from "./RevealPanel";
import { SafetyPanel } from "./SafetyPanel";

const RoomScene = dynamic(() => import("../three/RoomScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

type Panel = "common" | "reveal" | "safety" | null;
interface FloatingReaction { id: number; kind: Reaction; mine: boolean; left: number }

export function RoomClient({ code }: { code: string }) {
  const router = useRouter();
  const { user, loading: sessionLoading } = useRequireUser();
  const [detail, setDetail] = useState<RoomDetail | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [pulse, setPulse] = useState({ me: 0, partner: 0 });
  const [panel, setPanel] = useState<Panel>(null);
  const [mobileTab, setMobileTab] = useState<"activity" | "chat">("activity");
  const [unread, setUnread] = useState(0);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileTabRef = useRef(mobileTab);
  useEffect(() => {
    mobileTabRef.current = mobileTab;
  }, [mobileTab]);

  const loadDetail = useCallback(async () => {
    try {
      setDetail(await api<RoomDetail>(`/rooms/${code}`));
    } catch (e) {
      setFatal(errorMessage(e));
    }
  }, [code]);

  // Initial data.
  useEffect(() => {
    api<RoomDetail>(`/rooms/${code}`).then(setDetail).catch((e) => setFatal(errorMessage(e)));
    api<{ messages: ChatMessage[] }>(`/rooms/${code}/messages`).then((r) => setMessages(r.messages)).catch(() => undefined);
    api<{ icebreakers: string[] }>("/meta").then((r) => setIcebreakers(r.icebreakers)).catch(() => undefined);
  }, [code]);

  // Live connection.
  useEffect(() => {
    if (!user) return;
    const socket = openSocket();
    socketRef.current = socket;

    socket.on("connect", async () => {
      setConnected(true);
      const res = await emitAck(socket, "room:join", code);
      if (!res.ok) setFatal(res.error ?? "Could not join this table");
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socket.on("room:snapshot", (s: Snapshot) => setSnapshot(s));
    socket.on("room:changed", () => void loadDetail());
    socket.on("room:closed", () => setFatal("This table has closed."));
    socket.on("presence", ({ online }: { online: number[] }) => setSnapshot((s) => (s ? { ...s, online } : s)));
    socket.on("chat:message", (m: ChatMessage) => {
      setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
      if (m.userId !== user.id) {
        setPartnerTyping(false);
        if (mobileTabRef.current !== "chat") setUnread((n) => n + 1);
      }
    });
    socket.on("chat:typing", () => {
      setPartnerTyping(true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setPartnerTyping(false), 3000);
    });
    socket.on("reaction", ({ kind, userId }: { kind: Reaction; userId: number }) => {
      const id = Date.now() + Math.random();
      const mine = userId === user.id;
      setReactions((prev) => [...prev.slice(-12), { id, kind, mine, left: (mine ? 15 : 60) + Math.random() * 25 }]);
      setPulse((p) => (mine ? { ...p, me: p.me + 1 } : { ...p, partner: p.partner + 1 }));
      setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 1900);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, code, loadDetail]);

  useEffect(() => {
    track("room_open");
  }, []);

  const act = useCallback(
    async (action: Record<string, unknown>) => {
      const socket = socketRef.current;
      if (!socket || !snapshot) return { ok: false, error: "Reconnecting. Try again in a moment." };
      return emitAck(socket, "game:action", { activity: snapshot.activity, action });
    },
    [snapshot],
  );

  const restart = useCallback(async () => {
    const socket = socketRef.current;
    if (!socket) return { ok: false, error: "Reconnecting" };
    return emitAck(socket, "game:restart");
  }, []);

  async function switchActivity(id: ActivityId) {
    const socket = socketRef.current;
    if (!socket || snapshot?.activity === id) return;
    await emitAck(socket, "room:activity", id);
    track(`activity_${id}`);
  }

  async function send(body: string) {
    const socket = socketRef.current;
    if (!socket) return "Reconnecting. Try again in a moment.";
    const res = await emitAck(socket, "chat:send", { body });
    return res.ok ? null : res.error ?? "Could not send";
  }

  async function leave() {
    await api(`/rooms/${code}/leave`, { method: "POST" }).catch(() => undefined);
    router.push("/lobby");
  }

  async function copyInvite() {
    const link = `${window.location.origin}/room/${code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", link);
    }
  }

  if (fatal) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <LogoMark size={56} className="mx-auto" />
        <h1 className="mt-4 font-display text-3xl font-semibold">{fatal}</h1>
        <p className="mt-2 text-muted">Head back to the lobby to find another table or start your own.</p>
        <Link href="/lobby" className={buttonClass("primary", "md", "mt-6")}>Back to the lobby</Link>
      </div>
    );
  }

  if (sessionLoading || !detail || !user) return <PageLoader variant="merge" caption="Pulling up a chair" />;

  const { room, partner } = detail;
  const online = snapshot?.online ?? [];
  const partnerOnline = partner ? online.includes(partner.id) : false;
  const meOnline = connected && online.includes(user.id);
  const ActivityView = snapshot ? ACTIVITY_COMPONENTS[snapshot.activity] : null;
  const current = activityById(snapshot?.activity ?? room.activity);

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-3 py-2.5 sm:px-5">
          <Link href="/lobby" className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-semibold text-muted hover:bg-paper-deep hover:text-ink">
            <Icon name="arrowLeft" size={16} /> <span className="sr-only sm:not-sr-only">Lobby</span>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg leading-tight font-semibold">{room.title}</h1>
            <p className="flex items-center gap-2 text-xs text-muted">
              <span className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-leaf" : "bg-sun"}`} aria-hidden="true" />
              {connected ? "Live" : "Connecting"}
              <span aria-hidden="true">|</span>
              <button onClick={copyInvite} className="font-mono font-semibold tracking-wider hover:text-ink" title="Copy invite link">
                {copied ? "Link copied" : room.code}
              </button>
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setPanel("common")} disabled={!partner}>
              <Icon name="insync" size={16} /> <span className="sr-only md:not-sr-only">Common Ground</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPanel("reveal")}>
              <Icon name="eye" size={16} /> <span className="sr-only md:not-sr-only">Reveal</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPanel("safety")} disabled={!partner}>
              <Icon name="shield" size={16} /> <span className="sr-only md:not-sr-only">Safety</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={leave}>
              <Icon name="door" size={16} /> <span className="sr-only sm:not-sr-only">Leave</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className={`min-w-0 space-y-4 ${mobileTab === "chat" ? "hidden lg:block" : ""}`}>
          {/* Shared scene */}
          <section aria-label="The table" className="relative overflow-hidden rounded-lg border border-line bg-surface">
            <div className="grid items-center sm:grid-cols-[1fr_minmax(0,300px)_1fr]">
              <SeatCard name={`${user.displayName} (you)`} shape={user.avatarShape} color={user.avatarColor} online={meOnline} align="left" />
              <div className="relative h-40 sm:h-44">
                <RoomScene
                  me={{ shape: user.avatarShape, color: user.avatarColor, online: meOnline }}
                  partner={partner ? { shape: partner.avatarShape, color: partner.avatarColor, online: partnerOnline } : null}
                  moments={detail.momentCount}
                  pulseMe={pulse.me}
                  pulsePartner={pulse.partner}
                />
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                  {reactions.map((r) => (
                    <span key={r.id} className={`absolute bottom-4 animate-float-up ${r.mine ? "text-coral" : "text-teal"}`} style={{ left: `${r.left}%` }}>
                      <Icon name={r.kind} size={28} strokeWidth={2.2} />
                    </span>
                  ))}
                </div>
              </div>
              {partner ? (
                <SeatCard name={partner.displayName} shape={partner.avatarShape} color={partner.avatarColor} online={partnerOnline} align="right" sub={partner.pronouns} />
              ) : (
                <div className="hidden px-4 text-right text-sm text-muted sm:block">Empty seat</div>
              )}
            </div>
            <p className="border-t border-line px-4 py-2 text-center text-xs text-muted">
              {detail.momentCount === 0
                ? "Each activity you finish together adds a bead to the thread between you."
                : `${detail.momentCount} ${detail.momentCount === 1 ? "moment" : "moments"} shared at this table.`}
            </p>
          </section>

          {!partner ? (
            <InvitePanel code={room.code} isPublic={room.isPublic} onCopy={copyInvite} copied={copied} />
          ) : (
            <>
              {/* Activity switcher */}
              <nav aria-label="Activities" className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
                <ul className="flex gap-1.5 pb-1 sm:flex-wrap">
                  {ACTIVITIES.map((a) => {
                    const active = snapshot?.activity === a.id;
                    return (
                      <li key={a.id}>
                        <button
                          onClick={() => switchActivity(a.id)}
                          aria-current={active ? "true" : undefined}
                          className={`flex h-10 items-center gap-1.5 rounded-md border px-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                            active ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink hover:border-ink"
                          }`}
                        >
                          <Icon name={a.id} size={16} /> {a.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="rounded-lg border border-line bg-surface p-4 sm:p-6">
                {!snapshot || !ActivityView ? (
                  <Loader variant="cards" caption={`Setting up ${current.name}`} />
                ) : !snapshot.game ? (
                  <Loader variant="merge" caption="Waiting for both seats" />
                ) : (
                  <ActivityView
                    key={snapshot.activity}
                    game={snapshot.game}
                    me={user.id}
                    hostId={room.hostId}
                    partnerName={partner.displayName}
                    act={act}
                    restart={restart}
                  />
                )}
                {!partnerOnline && snapshot?.game && (
                  <p className="mt-4 rounded-md bg-sun-soft px-3 py-2 text-sm text-ink">
                    {partner.displayName} is away right now. Moves are saved and they will see them when they return.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className={`min-h-0 lg:sticky lg:top-[68px] lg:h-[calc(100dvh-88px)] ${mobileTab === "activity" ? "hidden lg:block" : "h-[calc(100dvh-140px)]"}`}>
          <ChatPanel
            messages={messages}
            me={user.id}
            partnerName={partner?.displayName ?? "Your partner"}
            partnerTyping={partnerTyping}
            icebreakers={icebreakers}
            disabled={!partner || !connected}
            onSend={send}
            onTyping={() => socketRef.current?.emit("chat:typing")}
            onReact={(kind) => socketRef.current?.emit("reaction", kind)}
          />
        </div>
      </div>

      {/* Mobile tab bar */}
      <nav aria-label="Room views" className="sticky bottom-0 z-30 grid grid-cols-2 border-t border-line bg-surface lg:hidden">
        {(["activity", "chat"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setMobileTab(tab);
              if (tab === "chat") setUnread(0);
            }}
            aria-current={mobileTab === tab ? "true" : undefined}
            className={`flex h-14 items-center justify-center gap-2 text-sm font-semibold ${mobileTab === tab ? "text-ink" : "text-muted"}`}
          >
            <Icon name={tab === "chat" ? "chat" : current.id} size={18} />
            {tab === "chat" ? "Chat" : "Activity"}
            {tab === "chat" && unread > 0 && <span className="rounded-sm bg-coral px-1.5 text-xs text-white">{unread}</span>}
          </button>
        ))}
      </nav>

      <Modal open={panel === "common"} onClose={() => setPanel(null)} title="Common Ground" wide>
        {panel === "common" && partner && (
          <CommonGroundPanel
            code={room.code}
            partnerName={partner.displayName}
            onUseSpark={async (text) => {
              const err = await send(text);
              if (!err) {
                setPanel(null);
                setMobileTab("chat");
              }
            }}
          />
        )}
      </Modal>
      <Modal open={panel === "reveal"} onClose={() => setPanel(null)} title="Reveal at your pace">
        <RevealPanel
          code={room.code}
          myLevel={detail.myRevealLevel}
          momentCount={detail.momentCount}
          thresholds={detail.revealThresholds}
          partner={partner}
          onChanged={loadDetail}
        />
      </Modal>
      <Modal open={panel === "safety"} onClose={() => setPanel(null)} title="Report or block">
        {partner && <SafetyPanel partnerId={partner.id} partnerName={partner.displayName} code={room.code} onDone={leave} />}
      </Modal>
    </div>
  );
}

function SeatCard({ name, shape, color, online, align, sub }: { name: string; shape: AvatarShape; color: AvatarColor; online: boolean; align: "left" | "right"; sub?: string }) {
  return (
    <div className={`hidden items-center gap-3 px-4 sm:flex ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <Avatar shape={shape} color={color} name={name} size={44} online={online} />
      <div className="min-w-0">
        <p className="truncate font-semibold">{name}</p>
        <p className="text-xs text-muted">{online ? "Here now" : "Away"}{sub ? `, ${sub}` : ""}</p>
      </div>
    </div>
  );
}

function InvitePanel({ code, isPublic, onCopy, copied }: { code: string; isPublic: boolean; onCopy: () => void; copied: boolean }) {
  return (
    <section className="animate-rise rounded-lg border border-line bg-surface p-6 text-center sm:p-10">
      <Loader variant="orbit" caption={isPublic ? "Your table is listed in the lobby. Waiting for someone to sit down." : "Waiting for your guest."} />
      <p className="text-sm text-muted">Or invite someone directly with this code</p>
      <p className="mt-2 font-mono text-4xl font-bold tracking-[0.25em]">{code}</p>
      <Button className="mt-5" onClick={onCopy}>
        <Icon name="copy" size={16} /> {copied ? "Copied" : "Copy invite link"}
      </Button>
    </section>
  );
}
