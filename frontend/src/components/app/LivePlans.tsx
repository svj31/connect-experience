"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { activityById } from "@/lib/activities";
import { api, errorMessage } from "@/lib/api";
import { timeAgo } from "@/lib/labels";
import { useLive } from "@/lib/live";
import type { AvatarConfig, Room } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

export interface Plan {
  id: number;
  activity: string;
  status: "pending" | "accepted" | "declined";
  role: "host" | "guest";
  roomCode: string;
  createdAt: string;
  respondedAt: string | null;
  person: { id: number; displayName: string; avatar: AvatarConfig; online: boolean | null } | null;
}
interface LiveData { received: Plan[]; sent: Plan[]; tables: Room[] }

/** Three bouncing dots: the other person has not answered yet. */
function Waiting() {
  return (
    <span className="sv-wait inline-flex gap-0.5" aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

/**
 * Everything happening in Together right now: invites waiting for your answer, plans you sent
 * (with their answer), and tables you opened. Each one can be joined, answered or called off.
 */
export function LivePlans({ onCount }: { onCount?: (n: number) => void }) {
  const router = useRouter();
  const { socket, toast } = useLive();
  const [data, setData] = useState<LiveData | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    api<LiveData>("/together/live").then(setData).catch(() => setData((d) => d ?? { received: [], sent: [], tables: [] }));
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const t = setInterval(load, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load]);

  useEffect(() => {
    if (!socket) return;
    socket.on("room:invite", load);
    socket.on("together:update", load);
    return () => {
      socket.off("room:invite", load);
      socket.off("together:update", load);
    };
  }, [socket, load]);

  const total = data ? data.received.length + data.sent.length + data.tables.length : 0;
  useEffect(() => onCount?.(total), [onCount, total]);

  async function act(key: string, path: string, then?: (body: { roomCode?: string }) => void) {
    setBusy(key);
    try {
      const body = await api<{ roomCode?: string }>(path, { method: "POST" });
      then?.(body);
      load();
    } catch (e) {
      toast("That did not go through", errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  if (!data || total === 0) {
    return data ? (
      <div className="rounded-2xl border border-dashed border-line-strong p-4 text-sm text-muted">
        <p className="flex items-center gap-2 font-semibold text-ink"><Icon name="sparkle" size={16} className="text-violet" />Nothing live yet</p>
        <p className="mt-1">Invites you send or receive, and tables you open, show up here so you can join, answer or call them off.</p>
      </div>
    ) : null;
  }

  return (
    <div className="space-y-4" aria-label="Live in Together">
      {data.received.length > 0 && (
        <section>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><span className="sv-ping h-2 w-2 rounded-full bg-rose" />Invited you</p>
          <ul className="space-y-2">
            {data.received.map((p) => {
              const a = activityById(p.activity);
              return (
                <li key={p.id} className="animate-pop rounded-2xl border-2 border-violet bg-violet-soft p-3">
                  <div className="flex items-center gap-3">
                    {p.person && <Avatar name={p.person.displayName} config={p.person.avatar} size={44} online={p.person.online ?? undefined} />}
                    <p className="min-w-0 flex-1 text-sm">
                      <span className="font-bold">{p.person?.displayName}</span> wants to play <span className="font-bold">{a.name}</span>
                      <span className="block text-xs text-muted">{timeAgo(p.createdAt)} · {a.minutes}</span>
                    </p>
                    <Icon name={p.activity} size={22} className="shrink-0 text-violet" />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" loading={busy === `a${p.id}`} onClick={() => act(`a${p.id}`, `/together/${p.id}/accept`, (b) => router.push(`/app/room/${b.roomCode}`))}>
                      <Icon name="play" size={15} /> Join
                    </Button>
                    <Button size="sm" variant="secondary" disabled={busy !== null} onClick={() => act(`d${p.id}`, `/together/${p.id}/decline`)}>Not now</Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {data.sent.length > 0 && (
        <section>
          <p className="mb-2 text-sm font-semibold">You invited</p>
          <ul className="space-y-2">
            {data.sent.map((p) => {
              const a = activityById(p.activity);
              const name = p.person?.displayName ?? "They";
              return (
                <li key={p.id} className={`rounded-2xl border p-3 ${p.status === "declined" ? "border-line bg-paper-deep" : "border-line"}`}>
                  <div className="flex items-center gap-3">
                    {p.person && <Avatar name={name} config={p.person.avatar} size={40} online={p.person.online ?? undefined} />}
                    <p className="min-w-0 flex-1 text-sm">
                      <span className="font-bold">{a.name}</span> with {name}
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        {p.status === "pending" ? <>Waiting for {name} <Waiting /></> : p.status === "accepted" ? <span className="font-semibold text-mint">{name} said yes</span> : <>{name} can&apos;t right now</>}
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.status !== "declined" && (
                      <Link href={`/app/room/${p.roomCode}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-bold text-paper hover:opacity-90"><Icon name="play" size={15} /> Open</Link>
                    )}
                    <Button size="sm" variant={p.status === "declined" ? "secondary" : "ghost"} disabled={busy !== null} onClick={() => act(`e${p.id}`, `/together/${p.id}/end`)}>
                      {p.status === "pending" ? "Cancel invite" : p.status === "accepted" ? "End plan" : "Clear"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {data.tables.length > 0 && (
        <section>
          <p className="mb-2 text-sm font-semibold">Your tables</p>
          <ul className="space-y-2">
            {data.tables.map((t) => (
              <li key={t.code} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                <Icon name={t.activity} size={20} className="shrink-0 text-violet" />
                <p className="min-w-0 flex-1 text-sm">
                  <span className="block truncate font-bold">{t.title}</span>
                  <span className="block text-xs text-muted">
                    {t.isPublic ? "Public" : <>Code <span className="font-mono tracking-wider">{t.code}</span></>} · {t.guestId ? "someone is seated" : "waiting for a guest"}
                  </span>
                </p>
                <Link href={`/app/room/${t.code}`} className="text-sm font-bold text-violet hover:underline">Open</Link>
                <button type="button" disabled={busy !== null} onClick={() => act(`t${t.code}`, `/rooms/${t.code}/leave`)} className="text-sm font-semibold text-muted hover:text-danger">End</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
