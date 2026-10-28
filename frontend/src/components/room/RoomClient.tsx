"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ACTIVITY_COMPONENTS } from "@/components/activities";
import { ACTIVITIES, CATEGORIES, activityById } from "@/lib/activities";
import { api } from "@/lib/api";
import { track } from "@/lib/consent";
import { useLive } from "@/lib/live";
import { useRequireUser } from "@/lib/session";
import type { ActivityId, ChatMessage, Suggestion, WatchPick } from "@/lib/types";
import { useRoom } from "@/lib/useRoom";
import { BondMeter, VibeRing } from "../app/widgets";
import { LogoMark } from "../brand/Logo";
import { Burst } from "../fx/Burst";
import { ThemeToggle } from "../site/ThemeToggle";
import { Avatar } from "../ui/Avatar";
import { Button, buttonClass } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Loader, PageLoader } from "../ui/Loader";
import { Modal } from "../ui/Modal";
import { ChatPanel } from "./ChatPanel";
import { CommonGroundPanel } from "./CommonGroundPanel";
import { RevealPanel } from "./RevealPanel";
import { SafetyPanel } from "./SafetyPanel";

const RoomScene = dynamic(() => import("../three/RoomScene"), { ssr: false, loading: () => <div className="h-full w-full" /> });

type PanelId = "common" | "reveal" | "safety" | "ideas" | null;
interface Ideas { sharedInterests: string[]; activities: Suggestion[]; watch: WatchPick[]; draw: string[] }

/**
 * The room: one shared stage for two people. The activity takes the whole stage; chat lives
 * behind a floating button so it never crowds a game, with an unread badge when it is closed.
 */
export function RoomClient({ code }: { code: string }) {
  const router = useRouter();
  const { user, loading: sessionLoading } = useRequireUser();
  const { connected, celebrate } = useLive();
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [panel, setPanel] = useState<PanelId>(null);
  const [ideas, setIdeas] = useState<Ideas | null>(null);
  const [copied, setCopied] = useState(false);
  const [momentBurst, setMomentBurst] = useState(0);
  const chatOpenRef = useRef(chatOpen);
  useEffect(() => {
    chatOpenRef.current = chatOpen;
  }, [chatOpen]);

  const onMessage = useCallback(
    (m: ChatMessage) => {
      if (m.userId !== user?.id && !chatOpenRef.current) setUnread((n) => n + 1);
    },
    [user?.id],
  );
  const room = useRoom(code, user?.id, { onMessage });
  const { detail, snapshot } = room;

  useEffect(() => {
    track("room_open");
    api<Ideas>(`/rooms/${code}/suggestions`).then(setIdeas).catch(() => undefined);
  }, [code]);

  // Celebrate new moments and bond level ups.
  const lastMoments = useRef<number | null>(null);
  const lastLevel = useRef<number | null>(null);
  useEffect(() => {
    if (!detail) return;
    if (lastMoments.current !== null && detail.momentCount > lastMoments.current) setMomentBurst((n) => n + 1);
    lastMoments.current = detail.momentCount;
    const level = detail.bond?.level ?? null;
    if (level !== null && lastLevel.current !== null && level > lastLevel.current && detail.partner) {
      celebrate({ title: `Bond level up: ${detail.bond!.name}!`, message: `You and ${detail.partner.displayName} reached level ${level}. ${detail.bond!.nextName ? `Next up: ${detail.bond!.nextName}.` : "That is the top of the verse."}`, them: { name: detail.partner.displayName, avatar: { ...detail.partner.avatar, shape: detail.partner.avatarShape, color: detail.partner.avatarColor } } });
    }
    lastLevel.current = level;
  }, [detail, celebrate]);

  async function leave() {
    await api(`/rooms/${code}/leave`, { method: "POST" }).catch(() => undefined);
    router.push(detail?.room.kind === "connection" ? "/app/connections" : "/app/together");
  }

  async function copyInvite() {
    const link = `${window.location.origin}/app/room/${code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", link);
    }
  }

  async function pick(id: ActivityId) {
    if (snapshot?.activity === id) return;
    const res = await room.switchActivity(id);
    if (res.ok) track(`activity_${id}`);
  }

  if (room.fatal) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="animate-float"><LogoMark size={120} live title="" /></div>
        <h1 className="mt-4 font-display text-3xl font-bold">{room.fatal}</h1>
        <p className="mt-2 text-muted">Head back to find someone else, or start something new.</p>
        <Link href="/app/together" className={buttonClass("primary", "md", "mt-6")}>Back to Together</Link>
      </div>
    );
  }
  if (sessionLoading || !detail || !user) return <PageLoader variant="cards" caption="Pulling up two chairs" />;

  const { room: info, partner } = detail;
  const online = snapshot?.online ?? [];
  const partnerOnline = partner ? online.includes(partner.id) : false;
  const meOnline = room.joined && online.includes(user.id);
  const ActivityView = snapshot ? ACTIVITY_COMPONENTS[snapshot.activity] : null;
  const current = activityById(snapshot?.activity ?? info.activity);
  const partnerAvatar = partner ? { ...partner.avatar, shape: partner.avatarShape, color: partner.avatarColor } : undefined;
  const topIdeas = ideas?.activities.filter((a) => a.score > 0).slice(0, 3) ?? [];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-5">
          <Link href={info.kind === "connection" ? "/app/connections" : "/app/together"} className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold text-muted hover:bg-violet-soft hover:text-violet">
            <Icon name="arrowLeft" size={16} /> <span className="sr-only sm:not-sr-only">Back</span>
          </Link>
          {partner ? (
            <Link href={`/app/people/${partner.id}`} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-1 hover:bg-violet-soft">
              <Avatar name={partner.displayName} config={partnerAvatar} size={40} online={partnerOnline} />
              <span className="min-w-0">
                <span className="block truncate font-display text-lg leading-tight font-bold">{partner.displayName}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <span className={`h-2 w-2 rounded-full ${connected ? "bg-mint" : "bg-sun"}`} aria-hidden="true" />
                  {partnerOnline ? "Here now" : "Away"} · {current.name}{info.locked ? " · one activity" : ""}
                </span>
              </span>
            </Link>
          ) : (
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-lg font-bold">{info.title}</h1>
              <p className="text-xs text-muted">Waiting for someone to sit down</p>
            </div>
          )}
          <div className="hidden w-44 md:block">{detail.bond ? <BondMeter bond={detail.bond} compact /> : detail.vibe !== null && <span className="flex items-center gap-2 text-sm font-semibold"><VibeRing score={detail.vibe} size={36} /> Vibe Match</span>}</div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" onClick={() => setPanel("ideas")} disabled={!partner}><Icon name="sparkle" size={16} /> <span className="sr-only lg:not-sr-only">Ideas</span></Button>
            <Button variant="ghost" size="sm" onClick={() => setPanel("common")} disabled={!partner}><Icon name="insync" size={16} /> <span className="sr-only lg:not-sr-only">Common Ground</span></Button>
            {info.kind !== "connection" && <Button variant="ghost" size="sm" onClick={() => setPanel("reveal")}><Icon name="eye" size={16} /> <span className="sr-only lg:not-sr-only">Reveal</span></Button>}
            <Button variant="ghost" size="sm" onClick={() => setPanel("safety")} disabled={!partner}><Icon name="shield" size={16} /> <span className="sr-only lg:not-sr-only">Safety</span></Button>
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={leave}><Icon name="door" size={16} /> <span className="sr-only sm:not-sr-only">Leave</span></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-3 py-4 sm:px-5">
        <section aria-label="The table" className="relative overflow-hidden rounded-[24px] border border-line bg-surface">
          <div className="relative h-36 sm:h-40">
            <RoomScene
              me={{ shape: user.avatarShape, color: user.avatarColor, online: meOnline }}
              partner={partner ? { shape: partner.avatarShape, color: partner.avatarColor, online: partnerOnline } : null}
              moments={detail.momentCount}
              pulseMe={room.pulse.me}
              pulsePartner={room.pulse.partner}
            />
            {momentBurst > 0 && <Burst key={momentBurst} count={16} distance={90} />}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              {room.reactions.map((r) => (
                <span key={r.id} className={`absolute bottom-4 animate-float-up ${r.mine ? "text-violet" : "text-rose"}`} style={{ left: `${r.left}%` }}>
                  <Icon name={r.kind} size={30} strokeWidth={2.2} />
                </span>
              ))}
            </div>
          </div>
          <p className="border-t border-line px-4 py-2 text-center text-xs text-muted">
            {detail.momentCount === 0 ? "Each activity you finish together adds a bead to the thread between you." : `${detail.momentCount} ${detail.momentCount === 1 ? "moment" : "moments"} shared here.`}
          </p>
        </section>

        {!partner ? (
          <section className="animate-rise rounded-[24px] border border-line bg-surface p-6 text-center sm:p-10">
            <Loader variant="orbit" caption={info.isPublic ? "Your table is listed in Together. Waiting for someone to sit down." : "Waiting for your guest."} />
            <p className="text-sm text-muted">Or invite someone directly with this code</p>
            <p className="mt-2 font-mono text-4xl font-bold tracking-[0.25em]">{info.code}</p>
            <Button className="mt-5" onClick={copyInvite}><Icon name="copy" size={16} /> {copied ? "Copied" : "Copy invite link"}</Button>
          </section>
        ) : (
          <>
            {info.locked ? (
              <p className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm"><Icon name="lock" size={16} className="text-violet" /> This table is set to <strong>{current.name}</strong>.</p>
            ) : (
              <nav aria-label="Activities" className="rounded-[24px] border border-line bg-surface p-3">
                <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
                  {CATEGORIES.map((c) => (
                    <div key={c.id} className="shrink-0">
                      <p className="mb-1 px-1 text-[11px] font-bold tracking-wider text-muted uppercase">{c.name}</p>
                      <ul className="flex gap-1.5">
                        {ACTIVITIES.filter((a) => a.category === c.id).map((a) => {
                          const active = snapshot?.activity === a.id;
                          const suggested = topIdeas.some((s) => s.id === a.id);
                          return (
                            <li key={a.id}>
                              <button
                                onClick={() => pick(a.id)}
                                aria-current={active ? "true" : undefined}
                                title={suggested ? topIdeas.find((s) => s.id === a.id)?.reason : a.short}
                                className={`relative flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold whitespace-nowrap transition-colors ${active ? "border-transparent bg-brand" : "border-line bg-paper hover:border-violet hover:text-violet"}`}
                              >
                                <Icon name={a.id} size={16} /> {a.name}
                                {suggested && !active && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose" aria-label="Suggested for you two" />}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </nav>
            )}

            <div className="rounded-[24px] border border-line bg-surface p-4 sm:p-6">
              {!snapshot || !ActivityView ? (
                <Loader variant={current.category === "watch" ? "reel" : current.id === "constellation" ? "stars" : current.category === "talk" ? "chat" : "cards"} caption={`Setting up ${current.name}`} />
              ) : !snapshot.game ? (
                <Loader variant="orbit" caption="Waiting for both seats" />
              ) : (
                <ActivityView
                  key={snapshot.activity}
                  game={snapshot.game}
                  me={user.id}
                  hostId={info.hostId}
                  partnerName={partner.displayName}
                  act={room.act}
                  restart={room.restart}
                  ideas={ideas ? { watch: ideas.watch, draw: ideas.draw } : undefined}
                />
              )}
              {!partnerOnline && snapshot?.game && (
                <p className="mt-4 rounded-2xl bg-sun-soft px-3 py-2 text-sm">{partner.displayName} is away right now. Your moves are saved and they will see them when they are back.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating chat: always one tap away, never in the way. */}
      <button
        onClick={() => {
          setChatOpen((o) => !o);
          setUnread(0);
        }}
        aria-expanded={chatOpen}
        aria-controls="room-chat"
        className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-[0_10px_30px_-8px_var(--violet)] transition-transform hover:scale-105 active:scale-95"
      >
        <Icon name={chatOpen ? "close" : "chat"} size={24} label={chatOpen ? "Close chat" : unread ? `Open chat, ${unread} unread` : "Open chat"} />
        {unread > 0 && !chatOpen && <span className="absolute -top-1.5 -right-1.5 flex h-6 min-w-6 animate-pop items-center justify-center rounded-full border-2 border-paper bg-rose px-1 text-xs font-bold text-on-primary">{unread}</span>}
      </button>
      <div
        id="room-chat"
        hidden={!chatOpen}
        className="fixed inset-x-2 bottom-20 z-40 h-[min(560px,calc(100dvh-7rem))] animate-pop shadow-[var(--shadow)] sm:inset-x-auto sm:right-4 sm:w-[380px]"
      >
        <ChatPanel
          messages={room.messages}
          me={user.id}
          partnerName={partner?.displayName ?? "your partner"}
          partnerTyping={room.partnerTyping}
          disabled={!partner || !room.joined}
          onSend={room.send}
          onTyping={room.typing}
          onReact={room.react}
          extraPrompts={ideas?.sharedInterests.slice(0, 2).map((i) => `We both like ${i}. What got you into it?`)}
          header={
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="font-display text-lg font-bold">Chat with {partner?.displayName ?? "your partner"}</h2>
              <button onClick={() => setChatOpen(false)} className="rounded-lg p-1 text-muted hover:text-ink"><Icon name="close" size={18} label="Close chat" /></button>
            </header>
          }
        />
      </div>

      <Modal open={panel === "ideas"} onClose={() => setPanel(null)} title="Ideas for the two of you" wide>
        {!ideas ? (
          <Loader variant="stars" caption="Thinking about what you both like" />
        ) : (
          <div className="space-y-5">
            {ideas.sharedInterests.length > 0 && <p className="text-muted">You both like <strong className="text-ink">{ideas.sharedInterests.join(", ")}</strong>.</p>}
            <ul className="grid gap-2 sm:grid-cols-2">
              {ideas.activities.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <button disabled={info.locked} onClick={() => { void pick(s.id); setPanel(null); }} className="flex w-full items-center gap-3 rounded-2xl border border-line p-3 text-left hover:border-violet hover:bg-violet-soft disabled:opacity-50">
                    <Icon name={s.id} className="text-violet" />
                    <span><span className="block font-bold">{activityById(s.id).name}</span><span className="block text-xs text-muted">{s.reason}</span></span>
                  </button>
                </li>
              ))}
            </ul>
            {info.locked && <p className="text-sm text-muted">This table is set to one activity, so switching is off.</p>}
          </div>
        )}
      </Modal>
      <Modal open={panel === "common"} onClose={() => setPanel(null)} title="Common Ground" wide>
        {panel === "common" && partner && (
          <CommonGroundPanel
            code={info.code}
            partnerName={partner.displayName}
            onUseSpark={async (text) => {
              const res = await room.send(text);
              if (!res.error) {
                setPanel(null);
                setChatOpen(true);
              }
            }}
          />
        )}
      </Modal>
      <Modal open={panel === "reveal"} onClose={() => setPanel(null)} title="Reveal at your pace">
        <RevealPanel code={info.code} myLevel={detail.myRevealLevel} momentCount={detail.momentCount} thresholds={detail.revealThresholds} partner={partner} onChanged={room.loadDetail} />
      </Modal>
      <Modal open={panel === "safety"} onClose={() => setPanel(null)} title="Safety">
        {partner && <SafetyPanel partnerId={partner.id} partnerName={partner.displayName} code={info.code} onDone={() => router.push("/app")} />}
      </Modal>
    </div>
  );
}
