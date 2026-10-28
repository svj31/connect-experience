"use client";

/* eslint-disable @next/next/no-img-element -- member photos come from any https host or an upload */
import Link from "next/link";
import { PhotoPlanet } from "../ui/PhotoPlanet";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { api, errorMessage } from "@/lib/api";
import { track } from "@/lib/consent";
import { GENDER_LABELS, INTENT_LABELS, cap } from "@/lib/labels";
import { useLive } from "@/lib/live";
import type { PersonCard, Profile, Vibe } from "@/lib/types";
import { Button } from "../ui/Button";
import { TextArea } from "../ui/Field";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";
import { Modal } from "../ui/Modal";
import { EmptyState } from "./widgets";

interface Quota { likesLeft: number; superlikesLeft: number }
interface Full { profile: Profile; vibe: Vibe }
/** What the like is about: a photo or a prompt, so the comment has context (Hinge style). */
type Target = { kind: "photo"; src: string; index: number } | { kind: "prompt"; text: string; answer: string } | { kind: "profile" };

function LikeButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title="Like this" className="absolute right-4 bottom-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-violet shadow-[0_6px_20px_-6px_rgb(0_0_0/0.35)] transition-transform hover:scale-110 active:scale-95">
      <Icon name="heart" size={22} />
    </button>
  );
}

function Vital({ icon, children }: { icon: string; children: ReactNode }) {
  return <li className="flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium"><Icon name={icon} size={17} className="text-muted" />{children}</li>;
}

/** One profile, read top to bottom: photos and prompts interleaved, each one likeable. */
function ProfileStory({ card, full, onLike }: { card: PersonCard; full: Full | null; onLike: (t: Target) => void }) {
  const p = full?.profile;
  const photos = p?.photos?.length ? p.photos : card.photos?.length ? card.photos : card.avatar.photo ? [card.avatar.photo] : [];
  const prompts = p?.prompts ?? (card.prompt ? [card.prompt] : []);
  const km = card.distanceKm;
  const where = [card.city, km === null || km === undefined ? null : km < 5 ? "Nearby" : `${km} km away`].filter(Boolean).join(" · ");
  const vitals: [string, string][] = [
    card.age ? ["user", String(card.age)] : null,
    p?.gender ? ["users", GENDER_LABELS[p.gender] ?? p.gender] : null,
    p?.heightCm ? ["ruler", `${p.heightCm} cm`] : null,
    where ? ["pin", where] : null,
    ["search", INTENT_LABELS[card.intent] ?? "Open to anything"],
    p?.job ? ["briefcase", p.job] : null,
    p?.education ? ["grad", p.education] : null,
    p?.starSign ? ["star", cap(p.starSign)] : null,
    p?.languages?.length ? ["globe", p.languages.join(", ")] : null,
  ].filter(Boolean) as [string, string][];

  const photoBlock = (i: number) =>
    photos[i] ? (
      <figure key={`ph${i}`} className="relative overflow-hidden rounded-[20px] bg-paper-deep">
        <PhotoPlanet photo={photos[i]} planet={card.avatar} trigger="both" alt={`${card.displayName}, photo ${i + 1}`} loading={i ? "lazy" : "eager"} className="aspect-[4/5] w-full" />
        <LikeButton label={`Like ${card.displayName}'s photo ${i + 1}`} onClick={() => onLike({ kind: "photo", src: photos[i], index: i })} />
      </figure>
    ) : null;
  const promptBlock = (i: number) =>
    prompts[i] ? (
      <section key={`pr${i}`} className="relative rounded-[20px] border border-line bg-surface px-6 pt-7 pb-20">
        <p className="text-sm font-semibold">{prompts[i].text}</p>
        <p className="mt-3 font-display text-[1.9rem] leading-[1.15]">{prompts[i].answer}</p>
        <LikeButton label={`Like ${card.displayName}'s answer to ${prompts[i].text}`} onClick={() => onLike({ kind: "prompt", text: prompts[i].text, answer: prompts[i].answer })} />
      </section>
    ) : null;

  const blocks: ReactNode[] = [];
  if (photos[0]) blocks.push(photoBlock(0));
  else
    blocks.push(
      <div key="planet" className="relative overflow-hidden rounded-[20px]">
        <PhotoPlanet planet={card.avatar} alt={`${card.displayName}'s planet`} className="aspect-[4/5] w-full" />
        <LikeButton label={`Like ${card.displayName}`} onClick={() => onLike({ kind: "profile" })} />
      </div>,
    );
  blocks.push(promptBlock(0));
  blocks.push(
    <ul key="vitals" className="no-scrollbar flex divide-x divide-line overflow-x-auto rounded-[20px] border border-line bg-surface" aria-label="Basics">
      {vitals.map(([icon, text]) => <Vital key={text} icon={icon}>{text}</Vital>)}
    </ul>,
  );
  blocks.push(photoBlock(1));
  if (card.vibe.score !== null) {
    blocks.push(
      <section key="vibe" className="rounded-[20px] bg-violet-soft p-6">
        <p className="flex items-center justify-between text-sm font-semibold text-violet"><span className="flex items-center gap-1.5"><Icon name="sparkle" size={16} />Why you might click</span><span>{card.vibe.score}% Vibe Match</span></p>
        <ul className="mt-3 space-y-1.5">
          {(full?.vibe.reasons ?? card.vibe.reasons).slice(0, 4).map((r) => <li key={r} className="font-display text-xl leading-snug">{r}</li>)}
        </ul>
      </section>,
    );
  }
  blocks.push(promptBlock(1));
  for (let i = 2; i < photos.length; i++) blocks.push(photoBlock(i));
  blocks.push(promptBlock(2));
  if (p?.bio ?? card.bio) {
    blocks.push(
      <section key="bio" className="rounded-[20px] border border-line bg-surface p-6">
        <p className="text-sm font-semibold">About me</p>
        <p className="mt-2 text-[1.05rem] leading-relaxed">{p?.bio ?? card.bio}</p>
      </section>,
    );
  }
  if (card.interests.length) {
    blocks.push(
      <section key="interests" className="rounded-[20px] border border-line bg-surface p-6">
        <p className="text-sm font-semibold">Interests</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {card.interests.map((i) => (
            <li key={i} className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${card.vibe.sharedInterests.includes(i) ? "border-violet bg-violet-soft text-violet" : "border-line-strong"}`}>{cap(i)}</li>
          ))}
        </ul>
      </section>,
    );
  }

  return (
    <article aria-label={`${card.displayName}'s profile`} className="space-y-3">
      {blocks}
      <p className="pt-2 text-center">
        <Link href={`/app/people/${card.id}`} className="text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline">Open full profile, report or block</Link>
      </p>
    </article>
  );
}

/**
 * Discover, Hinge style: one person at a time as a vertical profile. Like a specific photo or
 * prompt (optionally with a comment or as a super like), or pass with the floating button.
 */
export function ProfileFeed() {
  const { celebrate, toast } = useLive();
  // The live context recreates toast on each render; a ref keeps load stable.
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);
  const [queue, setQueue] = useState<PersonCard[] | null>(null);
  const [full, setFull] = useState<Full | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [note, setNote] = useState("");
  const [asSuper, setAsSuper] = useState(false);
  const [busy, setBusy] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const fetching = useRef(false);

  const load = useCallback(async (refresh: boolean) => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const res = await api<{ people: PersonCard[]; quota: Quota; recycled?: boolean }>(`/discover/feed?limit=10${refresh ? "&refresh=1" : ""}`);
      if (res.recycled) toastRef.current("You've seen everyone nearby", "Here are people you passed on, in case you want a second look.");
      setQueue((q) => {
        const base = refresh ? [] : q ?? [];
        const have = new Set(base.map((p) => p.id));
        return [...base, ...res.people.filter((p) => !have.has(p.id))];
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

  const current = queue?.[0];
  useEffect(() => {
    if (!current) return;
    let live = true;
    api<Full>(`/people/${current.id}`)
      .then((r) => live && setFull(r))
      .catch(() => live && setFull(null));
    return () => {
      live = false;
    };
  }, [current]);

  const advance = useCallback(
    (id: number) => {
      setFull(null);
      setQueue((q) => q?.filter((p) => p.id !== id) ?? null);
      if ((queue?.length ?? 0) <= 3) load(false);
      top.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [queue, load],
  );

  async function decide(decision: "like" | "pass" | "superlike", comment = "") {
    if (!current || busy) return;
    setBusy(true);
    const person = current;
    try {
      const res = await api<{ match: { roomCode: string } | null; quota: Quota }>("/discover/swipes", { body: { targetId: person.id, decision, note: comment } });
      setQuota(res.quota);
      setCanUndo(decision === "pass");
      track(`swipe_${decision}`);
      if (res.match) {
        celebrate({ title: "It's a Saath!", message: `You and ${person.displayName} liked each other. Start with a game, or just say hi.`, them: { name: person.displayName, avatar: person.avatar }, href: `/app/room/${res.match.roomCode}`, cta: "Say hello" });
      } else if (decision !== "pass") {
        toast(decision === "superlike" ? "Super like sent" : "Like sent", `${person.displayName} will see it in Likes You.`);
      }
      advance(person.id);
    } catch (e) {
      toast("That did not go through", errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function undo() {
    try {
      const res = await api<{ person: PersonCard }>("/discover/swipes/undo", { method: "POST" });
      setFull(null);
      setQueue((q) => [res.person, ...(q ?? []).filter((p) => p.id !== res.person.id)]);
      setCanUndo(false);
    } catch (e) {
      toast("Nothing to undo", errorMessage(e));
    }
  }

  function openLike(t: Target) {
    setTarget(t);
    setNote("");
    setAsSuper(false);
  }

  if (error && !queue) return <EmptyState title="Discover is resting" body={error} action={<Button onClick={() => load(true)}>Try again</Button>} />;
  if (!queue) return <Loader variant="compass" caption="Finding people for you" />;

  return (
    <div className="mx-auto flex h-full w-full max-w-[520px] flex-col">
      {!current ? (
        <EmptyState
          title="You're all caught up"
          body="New people join every day. Check Standouts, or widen your age or distance in Settings."
          action={<div className="flex flex-wrap justify-center gap-2">{canUndo && <Button variant="secondary" onClick={undo}><Icon name="undo" size={16} /> Undo last pass</Button>}<Button onClick={() => load(true)}><Icon name="refresh" size={16} /> Check again</Button></div>}
        />
      ) : (
        <>
          <header className="mb-3 flex shrink-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate font-display text-[2rem] leading-none sm:text-[2.3rem]">{current.displayName}</h2>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-muted">
                {current.online ? <><span className="h-2 w-2 rounded-full bg-mint" />Active now</> : current.pronouns || "\u00a0"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={undo} disabled={!canUndo} aria-label="Undo last pass" title="Undo last pass" className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-surface text-muted transition-opacity disabled:opacity-35">
                <Icon name="undo" size={17} />
              </button>
              <button type="button" onClick={() => decide("pass")} disabled={busy} aria-label={`Pass on ${current.displayName}`} title="Pass" className="flex h-12 w-12 items-center justify-center rounded-full border border-line-strong bg-surface text-ink transition-transform hover:scale-105 active:scale-95">
                <Icon name="close" size={22} />
              </button>
              <button type="button" onClick={() => openLike({ kind: "profile" })} disabled={busy} aria-label={`Like ${current.displayName}`} title="Like" className="bg-brand flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95">
                <Icon name="heart" size={21} />
              </button>
            </div>
          </header>

          <div ref={top} className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[20px]">
          <ProfileStory key={current.id} card={current} full={full} onLike={openLike} />

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" size="lg" onClick={() => decide("pass")} disabled={busy}><Icon name="close" size={18} /> Pass</Button>
            <Button size="lg" onClick={() => openLike({ kind: "profile" })} disabled={busy}><Icon name="heart" size={18} /> Like</Button>
          </div>
          {quota && <p className="mt-3 pb-2 text-center text-xs text-muted">{quota.likesLeft} likes and {quota.superlikesLeft} super likes left today</p>}
          </div>

          <Modal open={target !== null} onClose={() => setTarget(null)} title={`Like ${current.displayName}`}>
            {target?.kind === "photo" && <img src={target.src} alt="" className="mb-4 aspect-[4/5] max-h-64 w-full rounded-2xl object-cover" />}
            {target?.kind === "prompt" && (
              <div className="mb-4 rounded-2xl border border-line bg-paper p-4">
                <p className="text-xs font-semibold text-muted">{target.text}</p>
                <p className="mt-1 font-display text-xl">{target.answer}</p>
              </div>
            )}
            <TextArea label="Add a comment" maxLength={180} value={note} onChange={(e) => setNote(e.target.value)} hint="A comment on something specific gets far more replies than a like alone." />
            <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-line p-4">
              <span>
                <span className="flex items-center gap-1.5 font-semibold"><Icon name="star" size={16} className="text-saffron" />Send as a Super like</span>
                <span className="block text-sm text-muted">{quota ? `${quota.superlikesLeft} left today.` : ""} You show up first in their likes.</span>
              </span>
              <input type="checkbox" checked={asSuper} disabled={quota?.superlikesLeft === 0} onChange={(e) => setAsSuper(e.target.checked)} className="h-5 w-5 accent-[var(--violet)]" />
            </label>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button>
              <Button
                loading={busy}
                onClick={() => {
                  const what = target?.kind === "photo" ? "your photo" : target?.kind === "prompt" ? `"${target.text}"` : "";
                  const comment = note.trim() ? (what ? `On ${what}: ${note.trim()}` : note.trim()) : what ? `Liked ${what}` : "";
                  setTarget(null);
                  decide(asSuper ? "superlike" : "like", comment.slice(0, 200));
                }}
              >
                <Icon name="heart" size={16} /> Send like
              </Button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
