"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { api, errorMessage } from "@/lib/api";
import { track } from "@/lib/consent";
import { INTENT_SHORT, cap } from "@/lib/labels";
import { useLive } from "@/lib/live";
import type { PersonCard } from "@/lib/types";
import { AVATAR_HEX, Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { TextArea } from "../ui/Field";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";
import { Modal } from "../ui/Modal";
import { Chip, EmptyState } from "./widgets";

type Decision = "like" | "pass" | "superlike";
interface Quota { likesLeft: number; superlikesLeft: number }
interface SwipeResult { status: "liked" | "passed" | "matched" | "connected"; match: { person: PersonCard; roomCode: string } | null; quota: Quota }

/** How far a card must travel, in px, before letting go counts as a decision. */
const THRESHOLD = 110;

export const distanceLabel = (km: number | null | undefined) =>
  km === null || km === undefined ? null : km < 5 ? "Nearby" : `${km} km away`;

/** The card: full bleed photos you tap through, the essentials over a dark fade, and an info sheet. */
function SwipeCard({ person, onReply, interactive = true }: { person: PersonCard; onReply: () => void; interactive?: boolean }) {
  const photos = person.photos?.length ? person.photos : person.avatar.photo ? [person.avatar.photo] : [];
  const [index, setIndex] = useState(0);
  const [info, setInfo] = useState(false);
  const distance = distanceLabel(person.distanceKm);
  const [body] = AVATAR_HEX[person.avatar.color] ?? AVATAR_HEX.violet;
  const step = (dir: 1 | -1) => setIndex((i) => Math.min(photos.length - 1, Math.max(0, i + dir)));
  return (
    <article className="relative h-full overflow-hidden rounded-[28px] bg-black text-white shadow-[0_24px_60px_-24px_rgb(0_0_0/0.6)]" aria-label={`${person.displayName}'s card`}>
      {photos.length ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photos[index]} alt={`${person.displayName}, photo ${index + 1} of ${photos.length}`} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: body }}>
          <div className="bg-brand absolute inset-0 opacity-60" />
          <div className="relative"><Avatar name={person.displayName} config={person.avatar} size={200} decorative /></div>
        </div>
      )}

      {photos.length > 1 && (
        <>
          <div className="absolute inset-x-3 top-3 z-10 flex gap-1" aria-hidden="true">
            {photos.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-full ${i === index ? "bg-white" : "bg-white/35"}`} />)}
          </div>
          {interactive && (
            <>
              <button type="button" data-tapzone className="absolute inset-y-0 left-0 z-[5] w-1/3" onClick={() => step(-1)} aria-label="Previous photo" />
              <button type="button" data-tapzone className="absolute inset-y-0 right-0 z-[5] w-1/3" onClick={() => step(1)} aria-label="Next photo" />
            </>
          )}
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent px-5 pt-28 pb-5">
        <div className="pointer-events-auto flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[2.1rem] leading-none font-extrabold tracking-tight">
              {person.displayName}{person.age ? <span className="ml-2 font-semibold text-white/90">{person.age}</span> : null}
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-white/85">
              {person.online && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#3ee6a0]" />Active now</span>}
              {person.city && <span className="flex items-center gap-1"><Icon name="pin" size={14} />{distance ?? person.city}</span>}
              <span className="flex items-center gap-1"><Icon name="search" size={14} />{INTENT_SHORT[person.intent] ?? "Open to anything"}</span>
            </p>
          </div>
          {interactive && (
            <button type="button" onClick={() => setInfo(true)} onPointerDown={(e) => e.stopPropagation()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30" aria-label={`More about ${person.displayName}`}>
              <Icon name="info" size={20} />
            </button>
          )}
        </div>
        {person.vibe.score !== null && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold backdrop-blur-md">
            <Icon name="sparkle" size={15} /> {person.vibe.score}% vibe{person.vibe.reasons[0] ? ` · ${person.vibe.reasons[0]}` : ""}
          </p>
        )}
        {person.interests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {person.interests.slice(0, 4).map((i) => (
              <span key={i} className={`rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md ${person.vibe.sharedInterests.includes(i) ? "bg-brand" : "bg-white/15"}`}>{cap(i)}</span>
            ))}
          </div>
        )}
      </div>

      {info && (
        <div className="absolute inset-0 z-20 flex flex-col bg-surface text-ink" onPointerDown={(e) => e.stopPropagation()} style={{ touchAction: "pan-y" }}>
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <p className="font-display text-xl font-extrabold">{person.displayName}{person.age ? `, ${person.age}` : ""}</p>
            <button type="button" onClick={() => setInfo(false)} className="bg-brand flex h-10 w-10 items-center justify-center rounded-full" aria-label="Close details"><Icon name="close" size={18} /></button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {person.pronouns && <p className="text-sm font-semibold text-muted">{person.pronouns}</p>}
            {person.vibe.reasons.length > 0 && (
              <ul className="space-y-1.5">
                {person.vibe.reasons.map((r) => <li key={r} className="flex gap-2 text-sm font-bold text-violet"><Icon name="sparkle" size={16} className="mt-0.5 shrink-0" />{r}</li>)}
              </ul>
            )}
            {person.prompt && (
              <blockquote className="relative rounded-[24px] bg-paper-deep p-5 pr-16">
                <span className="block text-xs font-extrabold tracking-wide text-muted uppercase">{person.prompt.text}</span>
                <span className="mt-1.5 block font-display text-2xl leading-snug font-bold">{person.prompt.answer}</span>
                <button type="button" onClick={onReply} className="bg-brand shadow-brand absolute right-4 bottom-4 flex h-11 w-11 items-center justify-center rounded-full" aria-label={`Like ${person.displayName}'s prompt with a note`}>
                  <Icon name="heart" size={20} />
                </button>
              </blockquote>
            )}
            {person.bio && <p className="leading-relaxed">{person.bio}</p>}
            {person.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {person.interests.map((i) => <Chip key={i} tone={person.vibe.sharedInterests.includes(i) ? "rose" : "plain"}>{cap(i)}</Chip>)}
              </div>
            )}
            <Link href={`/app/people/${person.id}`} className="inline-flex items-center gap-1 text-sm font-extrabold text-violet hover:underline">
              <Icon name="user" size={15} /> Open full profile
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}

function Stamp({ label, tone, opacity, rotate, className }: { label: string; tone: string; opacity: number; rotate: number; className: string }) {
  return (
    <span className={`pointer-events-none absolute z-30 rounded-xl border-4 px-3 py-1 font-display text-3xl font-bold tracking-wider ${tone} ${className}`} style={{ opacity, transform: `rotate(${rotate}deg)` }} aria-hidden="true">
      {label}
    </span>
  );
}

function ActionButton({ label, icon, onClick, disabled, tone, big = false, hint }: { label: string; icon: string; onClick: () => void; disabled?: boolean; tone: string; big?: boolean; hint?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={hint ?? label}
      className={`flex items-center justify-center rounded-full shadow-[0_10px_30px_-10px_rgb(0_0_0/0.35)] transition-transform ${tone.includes("bg-brand") ? "" : "bg-surface ring-1 ring-line"} hover:scale-110 active:scale-90 disabled:pointer-events-none disabled:opacity-40 ${tone} ${big ? "h-[68px] w-[68px]" : "h-[52px] w-[52px]"}`}
    >
      <Icon name={icon} size={big ? 30 : 22} />
    </button>
  );
}

/**
 * Discover as a swipe deck. Drag or use the buttons: left passes, right likes, up super likes.
 * Keyboard: arrow keys, and Z to undo the last pass. Liking someone who already liked you is a match.
 */
export function SwipeDeck() {
  const { celebrate, toast } = useLive();
  const [stack, setStack] = useState<PersonCard[] | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [leaving, setLeaving] = useState<Decision | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const busy = useRef(false);
  const fetching = useRef(false);

  const load = useCallback(async (refresh: boolean) => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const res = await api<{ people: PersonCard[]; quota: Quota }>(`/discover/feed?limit=10${refresh ? "&refresh=1" : ""}`);
      setStack((s) => {
        const have = new Set((refresh ? [] : s ?? []).map((p) => p.id));
        return [...(refresh ? [] : s ?? []), ...res.people.filter((p) => !have.has(p.id))];
      });
      setQuota(res.quota);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      fetching.current = false;
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(true), 0);
    return () => clearTimeout(t);
  }, [load]);

  const top = stack?.[0];

  const decide = useCallback(
    async (decision: Decision, withNote = "") => {
      if (!top || busy.current) return;
      if (decision === "superlike" && quota?.superlikesLeft === 0) {
        toast("No super likes left", "You get 3 a day. A plain like still counts.");
        return;
      }
      busy.current = true;
      setLeaving(decision);
      const person = top;
      try {
        const res = await api<SwipeResult>("/discover/swipes", { body: { targetId: person.id, decision, note: withNote } });
        setQuota(res.quota);
        setCanUndo(decision === "pass");
        track(`swipe_${decision}`);
        if (res.match) {
          celebrate({ title: "It's a Saath!", message: `You and ${person.displayName} liked each other. Your shared space is open, so start with something fun.`, them: { name: person.displayName, avatar: person.avatar }, href: `/app/room/${res.match.roomCode}`, cta: "Say hello" });
        } else if (decision === "superlike") {
          toast("Super like sent", `${person.displayName} will see you at the top of their likes.`);
        }
      } catch (e) {
        toast("That did not go through", errorMessage(e));
        setLeaving(null);
        busy.current = false;
        setDrag({ x: 0, y: 0, active: false });
        return;
      }
      setTimeout(() => {
        // Top up the stack before it runs out, so the next card is always ready.
        if ((stack?.length ?? 0) <= 3) load(false);
        setStack((s) => s?.filter((p) => p.id !== person.id) ?? null);
        setLeaving(null);
        setDrag({ x: 0, y: 0, active: false });
        busy.current = false;
      }, 260);
    },
    [top, quota, stack, load, celebrate, toast],
  );

  const undo = useCallback(async () => {
    try {
      const res = await api<{ person: PersonCard }>("/discover/swipes/undo", { method: "POST" });
      setStack((s) => [res.person, ...(s ?? []).filter((p) => p.id !== res.person.id)]);
      setCanUndo(false);
    } catch (e) {
      toast("Nothing to undo", errorMessage(e));
    }
  }, [toast]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select, dialog, [role=dialog]")) return;
      if (e.key === "ArrowLeft") decide("pass");
      else if (e.key === "ArrowRight") decide("like");
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        decide("superlike");
      } else if (e.key.toLowerCase() === "z" && canUndo) undo();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [decide, undo, canUndo]);

  function onPointerDown(e: ReactPointerEvent) {
    if (busy.current || (e.target as HTMLElement).closest("a, button:not([data-tapzone])")) return;
    start.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerMove(e: ReactPointerEvent) {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    // Only a real drag takes the pointer, so a tap still reaches the photo tap zones.
    if (!drag.active && Math.hypot(dx, dy) < 8) return;
    if (!drag.active) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ x: dx, y: dy, active: true });
  }
  function onPointerUp() {
    if (!start.current) return;
    start.current = null;
    if (!drag.active) return;
    if (drag.x > THRESHOLD) decide("like");
    else if (drag.x < -THRESHOLD) decide("pass");
    else if (drag.y < -THRESHOLD * 1.2 && Math.abs(drag.x) < THRESHOLD) decide("superlike");
    else setDrag({ x: 0, y: 0, active: false });
  }

  if (error && !stack) return <EmptyState title="Discover is resting" body={error} action={<Button onClick={() => load(true)}>Try again</Button>} />;
  if (!stack) return <Loader variant="compass" caption="Finding people in your orbit" />;

  const fly = leaving === "pass" ? { x: -700, y: drag.y, r: -24 } : leaving === "like" ? { x: 700, y: drag.y, r: 24 } : leaving === "superlike" ? { x: 0, y: -900, r: 0 } : null;
  const x = fly?.x ?? drag.x;
  const y = fly?.y ?? (drag.active ? drag.y * 0.4 : 0);
  const rotate = fly?.r ?? drag.x / 18;

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col">
      {quota && (
        <p className="mb-3 flex items-center justify-center gap-4 text-xs font-bold text-muted" aria-live="polite">
          <span className="flex items-center gap-1"><Icon name="heart" size={13} className="text-violet" />{quota.likesLeft} likes left today</span>
          <span className="flex items-center gap-1"><Icon name="star" size={13} className="text-sky" />{quota.superlikesLeft} super likes</span>
        </p>
      )}
      <div className="relative h-[clamp(380px,calc(100dvh-340px),620px)] lg:h-[clamp(440px,calc(100dvh-290px),680px)]">
        {!top ? (
          <EmptyState
            title="You have seen everyone nearby"
            body="New people join every day. Widen your age or distance in Settings, or come back later."
            action={<div className="flex flex-wrap justify-center gap-2">{canUndo && <Button variant="secondary" onClick={undo}><Icon name="undo" size={16} /> Undo last pass</Button>}<Button onClick={() => load(true)}><Icon name="refresh" size={16} /> Check again</Button></div>}
          />
        ) : (
          <>
            {stack.slice(1, 3).reverse().map((p, i, arr) => {
              const depth = arr.length - i;
              const lift = drag.active || leaving ? Math.min(1, Math.abs(drag.x) / THRESHOLD) : 0;
              const scale = 1 - depth * 0.04 + (depth === 1 ? lift * 0.04 : 0);
              return (
                <div key={p.id} className="absolute inset-0 transition-transform duration-200" style={{ transform: `translateY(${depth * 12 - (depth === 1 ? lift * 12 : 0)}px) scale(${scale})` }} aria-hidden="true">
                  <SwipeCard person={p} onReply={() => undefined} interactive={false} />
                </div>
              );
            })}
            <div
              key={top.id}
              className={`absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing ${drag.active && !leaving ? "" : "transition-transform duration-300 ease-out"}`}
              style={{ transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)` }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <Stamp label="LIKE" tone="border-[#3ee6a0] text-[#3ee6a0]" className="top-8 left-6" rotate={-14} opacity={leaving === "like" ? 1 : Math.max(0, drag.x / THRESHOLD)} />
              <Stamp label="NOPE" tone="border-[#ff4458] text-[#ff4458]" className="top-8 right-6" rotate={14} opacity={leaving === "pass" ? 1 : Math.max(0, -drag.x / THRESHOLD)} />
              <Stamp label="SUPER" tone="border-[#2b9bff] text-[#2b9bff]" className="bottom-1/3 left-1/2 -translate-x-1/2" rotate={0} opacity={leaving === "superlike" ? 1 : Math.max(0, -drag.y / (THRESHOLD * 1.2)) * (Math.abs(drag.x) < THRESHOLD ? 1 : 0)} />
              <SwipeCard person={top} onReply={() => setNoteOpen(true)} />
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4" role="group" aria-label="Decide on this person">
        <ActionButton label="Undo last pass" hint="Undo last pass (Z)" icon="undo" tone="text-[#f5a524]" onClick={undo} disabled={!canUndo} />
        <ActionButton label={top ? `Pass on ${top.displayName}` : "Pass"} hint="Pass (left arrow)" icon="close" tone="text-[#ff4458]" big onClick={() => decide("pass")} disabled={!top} />
        <ActionButton label={top ? `Super like ${top.displayName}` : "Super like"} hint="Super like (up arrow)" icon="star" tone="text-[#2b9bff]" onClick={() => decide("superlike")} disabled={!top || quota?.superlikesLeft === 0} />
        <ActionButton label={top ? `Like ${top.displayName}` : "Like"} hint="Like (right arrow)" icon="heart" tone="bg-brand shadow-brand" big onClick={() => decide("like")} disabled={!top || quota?.likesLeft === 0} />
        <ActionButton label="Like with a note" icon="chat" tone="text-[#a855f7]" onClick={() => setNoteOpen(true)} disabled={!top} />
      </div>

      {top && (
        <Modal open={noteOpen} onClose={() => setNoteOpen(false)} title={`Like ${top.displayName} with a note`}>
          {top.prompt && <p className="mb-3 rounded-2xl bg-paper-deep p-3 text-sm"><span className="font-bold">Replying to:</span> {top.prompt.text}: {top.prompt.answer}</p>}
          <TextArea label="Your note" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} hint="Notes on a prompt get far more replies than a plain like." />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setNoteOpen(false);
                decide("like", note.trim());
                setNote("");
              }}
            >
              <Icon name="heart" size={16} /> Send like
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
