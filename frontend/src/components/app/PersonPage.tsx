"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { activityById } from "@/lib/activities";
import { api, errorMessage } from "@/lib/api";
import { useLive } from "@/lib/live";
import { useSession } from "@/lib/session";
import type { Bond, Profile, Suggestion, Vibe } from "@/lib/types";
import { SafetyPanel } from "../room/SafetyPanel";
import { Button, ButtonLink } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { PageLoader } from "../ui/Loader";
import { Modal } from "../ui/Modal";
import { ConnectButton } from "./ConnectButton";
import { ProfileView } from "./ProfileView";
import { BondMeter, BondOrbit, EmptyState, VibeBreakdown } from "./widgets";

interface PersonData {
  profile: Profile;
  vibe: Vibe;
  bond: Bond | null;
  connection: { id: number; status: "pending" | "accepted"; outgoing: boolean; roomCode: string | null; note: string } | null;
  suggestions: Suggestion[];
}

export function PersonPage({ id }: { id: number }) {
  const router = useRouter();
  const { user } = useSession();
  const { celebrate } = useLive();
  const [data, setData] = useState<PersonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [safety, setSafety] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<PersonData>(`/people/${id}`).then(setData).catch((e) => setError(errorMessage(e)));
  }, [id]);
  useEffect(load, [load]);

  if (error) return <EmptyState title="Profile not available" body={error} action={<ButtonLink href="/app/discover">Back to Discover</ButtonLink>} />;
  if (!data || !user) return <PageLoader variant="hearts" caption="Opening their world" />;
  const { profile, connection, bond } = data;

  async function accept() {
    setBusy(true);
    const res = await api<{ roomCode: string }>(`/connections/${connection!.id}/accept`, { method: "POST" }).catch(() => null);
    setBusy(false);
    if (res) celebrate({ title: "It's a Saath!", message: `You and ${profile.displayName} are connected.`, them: { name: profile.displayName, avatar: profile.avatar }, href: `/app/room/${res.roomCode}`, cta: "Say hello" });
    load();
  }

  async function play(activity: string) {
    const res = await api<{ roomCode: string }>(`/connections/${connection!.id}/play`, { body: { activity } }).catch(() => null);
    if (res) router.push(`/app/room/${res.roomCode}`);
  }

  const actions = (
    <section className="rounded-[24px] border border-line bg-surface p-5" aria-label="Actions">
      {connection?.status === "accepted" ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <ButtonLink href={`/app/chats?c=${connection.id}`}><Icon name="chat" size={17} /> Chat</ButtonLink>
            <ButtonLink href={`/app/room/${connection.roomCode}`} variant="accent"><Icon name="orbit" size={17} /> Together</ButtonLink>
          </div>
          <p className="mt-4 text-sm font-bold">Picked for the two of you</p>
          <ul className="mt-2 space-y-1.5">
            {data.suggestions.map((s) => (
              <li key={s.id}>
                <button onClick={() => play(s.id)} className="flex w-full items-center gap-3 rounded-xl border border-line p-2.5 text-left hover:border-violet hover:bg-violet-soft">
                  <Icon name={s.id} className="text-violet" />
                  <span className="flex-1"><span className="block font-semibold">{activityById(s.id).name}</span><span className="block text-xs text-muted">{s.reason}</span></span>
                  <Icon name="play" size={16} className="text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : connection?.status === "pending" && !connection.outgoing ? (
        <>
          <p className="font-semibold">{profile.displayName} wants to connect</p>
          {connection.note && <p className="mt-1 rounded-xl bg-paper-deep p-3 text-sm">&ldquo;{connection.note}&rdquo;</p>}
          <div className="mt-3 flex gap-2">
            <Button onClick={accept} loading={busy}><Icon name="heart" size={17} /> Accept</Button>
            <Button variant="secondary" onClick={async () => { await api(`/connections/${connection.id}/decline`, { method: "POST" }); router.push("/app/connections"); }}>Not now</Button>
          </div>
        </>
      ) : connection?.status === "pending" ? (
        <p className="flex items-center gap-2 font-semibold text-muted"><Icon name="hourglass" size={18} /> Request sent. Waiting for {profile.displayName}.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <ConnectButton person={{ id: profile.id, displayName: profile.displayName, avatar: profile.avatar }} onDone={load} />
          <p className="text-sm text-muted">Connecting opens a private space for chat and activities.</p>
        </div>
      )}
      <button onClick={() => setSafety(true)} className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-danger"><Icon name="flag" size={15} /> Report or block</button>
    </section>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/app/discover" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-violet"><Icon name="arrowLeft" size={16} /> Back</Link>
      <ProfileView
        profile={profile}
        shared={data.vibe.sharedInterests}
        aside={
          <>
            {actions}
            {bond && (
              <section className="rounded-[24px] border border-line bg-surface p-5" aria-label="Your bond">
                <h2 className="font-display text-xl font-bold">Your bond</h2>
                <BondOrbit bond={bond} me={{ name: user.displayName, avatar: user.avatar }} them={{ name: profile.displayName, avatar: profile.avatar }} />
                <BondMeter bond={bond} />
                <ul className="mt-3 space-y-1 text-sm">
                  {bond.breakdown.map((b) => <li key={b.label} className="flex justify-between"><span className="text-muted">{b.label}</span><span className="font-bold">{b.points}</span></li>)}
                </ul>
              </section>
            )}
            <section className="rounded-[24px] border border-line bg-surface p-5" aria-label="Vibe Match">
              <h2 className="mb-3 font-display text-xl font-bold">Vibe Match</h2>
              <VibeBreakdown vibe={data.vibe} />
            </section>
          </>
        }
      />
      <Modal open={safety} onClose={() => setSafety(false)} title={`Report or block ${profile.displayName}`}>
        <SafetyPanel partnerId={profile.id} partnerName={profile.displayName} code={connection?.roomCode ?? undefined} onDone={() => router.push("/app/discover")} />
      </Modal>
    </div>
  );
}
