"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cap, timeAgo } from "@/lib/labels";
import { quickExit } from "../room/SafetyPanel";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";
import { Chip, PageHeader } from "./widgets";

interface Overview {
  blocked: { id: number; display_name: string; created_at: string }[];
  reports: { id: number; reason: string; status: string; created_at: string; display_name: string }[];
}

const TIPS = [
  ["Stay on SaathVerse until you are ready", "Chat and play here first. You never need to share a number to keep talking."],
  ["Meet in public, the first few times", "A busy cafe or a park in the daytime. Arrange your own way there and back."],
  ["Tell a friend", "Share who, where and when. The planner below writes the message for you."],
  ["Trust your gut", "You can leave any chat or room at any moment, and you never owe anyone an explanation."],
  ["Never send money", "Nobody genuine will ask. Report anyone who does."],
];

const STATUS_TONE: Record<string, "violet" | "sun" | "mint" | "plain"> = { open: "violet", reviewing: "sun", resolved: "mint", dismissed: "plain" };

export function SafetyCentre() {
  const [data, setData] = useState<Overview | null>(null);
  const [plan, setPlan] = useState({ who: "", where: "", when: "" });
  const [copied, setCopied] = useState(false);
  const load = () => api<Overview>("/safety/overview").then(setData).catch(() => setData({ blocked: [], reports: [] }));
  useEffect(() => {
    void load();
  }, []);
  const message = `Hey! I'm meeting ${plan.who || "someone from SaathVerse"} at ${plan.where || "a public place"} ${plan.when ? `on ${plan.when}` : "soon"}. I'll text you when I get there and when I leave. If you don't hear from me, please call.`;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Safety centre" icon="shield" subtitle="Tools that are always here, and people who read every report." actions={<Button variant="accent" onClick={quickExit}><Icon name="exit" size={17} /> Quick exit</Button>} />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[24px] border border-line bg-surface p-5" aria-label="Date check-in planner">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold"><Icon name="pin" className="text-rose" />Date check-in planner</h2>
          <p className="mt-1 text-sm text-muted">Fill in the basics and send the message to someone you trust. Nothing here is saved.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {(["who", "where", "when"] as const).map((k) => (
              <label key={k} className="text-sm font-semibold">{cap(k)}
                <input value={plan[k]} onChange={(e) => setPlan({ ...plan, [k]: e.target.value })} className="mt-1 h-10 w-full rounded-2xl border border-transparent bg-paper-deep px-4 font-normal" placeholder={k === "who" ? "Their name" : k === "where" ? "Cafe name" : "Sat, 5 pm"} />
              </label>
            ))}
          </div>
          <p className="mt-3 rounded-2xl bg-paper-deep p-3 text-sm">{message}</p>
          <Button className="mt-3" size="sm" onClick={async () => { await navigator.clipboard.writeText(message).catch(() => undefined); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
            <Icon name="copy" size={15} /> {copied ? "Copied" : "Copy message"}
          </Button>
        </section>
        <section className="rounded-[24px] border border-line bg-surface p-5" aria-label="Safety tips">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold"><Icon name="heart" className="text-violet" />Good habits</h2>
          <ul className="mt-3 space-y-3">
            {TIPS.map(([t, b]) => <li key={t}><p className="font-semibold">{t}</p><p className="text-sm text-muted">{b}</p></li>)}
          </ul>
          <Link href="/safety" className="mt-3 inline-block text-sm font-semibold text-violet hover:underline">Read the full safety guide</Link>
        </section>
        <section className="rounded-[24px] border border-line bg-surface p-5" aria-label="Your reports">
          <h2 className="font-display text-2xl font-bold">Your reports</h2>
          {!data ? <Loader variant="shield" size={64} /> : data.reports.length === 0 ? <p className="mt-2 text-sm text-muted">You have not reported anyone. If something feels off, use the shield in any chat or room.</p> : (
            <ul className="mt-3 space-y-2">
              {data.reports.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 rounded-2xl border border-line p-3">
                  <span><span className="block font-semibold">{r.display_name}</span><span className="block text-xs text-muted">{cap(r.reason.replace("-", " "))} · {timeAgo(r.created_at)}</span></span>
                  <Chip tone={STATUS_TONE[r.status] ?? "plain"}>{cap(r.status)}</Chip>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-[24px] border border-line bg-surface p-5" aria-label="Blocked people">
          <h2 className="font-display text-2xl font-bold">Blocked</h2>
          {!data ? <Loader variant="shield" size={64} /> : data.blocked.length === 0 ? <p className="mt-2 text-sm text-muted">Nobody blocked.</p> : (
            <ul className="mt-3 space-y-2">
              {data.blocked.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-2 rounded-2xl border border-line p-3">
                  <span><span className="block font-semibold">{b.display_name}</span><span className="block text-xs text-muted">Blocked {timeAgo(b.created_at)}</span></span>
                  <Button size="sm" variant="secondary" onClick={async () => { await api(`/safety/block/${b.id}`, { method: "DELETE" }); void load(); }}>Unblock</Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
