"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { activityById } from "@/lib/activities";
import { api, errorMessage } from "@/lib/api";
import { INTENT_SHORT, timeAgo } from "@/lib/labels";
import { BarChart, HBarChart } from "../app/charts";
import { EmptyState, PageHeader, StatTile } from "../app/widgets";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";

interface OverviewData {
  totals: Record<string, number>;
  signups: { day: string; n: number }[];
  activities: { activity: string; n: number }[];
  intents: { intent: string; n: number }[];
  bonds: { level: number; name: string; n: number }[];
  hours: { hour: number; n: number }[];
  events: { name: string; path: string; count: number }[];
  recentActions: { id: number; action: string; note: string; created_at: string; admin_name: string | null; target_name: string | null }[];
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-5" aria-label={title}>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {sub && <p className="mb-4 text-sm text-muted">{sub}</p>}
      {children}
    </section>
  );
}

export function AdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<OverviewData>("/admin/overview").then(setData).catch((e) => setError(errorMessage(e)));
  }, []);
  if (error) return <EmptyState title="Could not load analytics" body={error} />;
  if (!data) return <Loader variant="shield" caption="Counting the stars" />;
  const t = data.totals;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Community overview" icon="chart" subtitle="Counts and trends only. Private chats are never shown here." />
      {t.openReports > 0 && (
        <Link href="/admin/reports" className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-rose/40 bg-rose-soft p-4 font-semibold">
          <span className="flex items-center gap-2"><Icon name="flag" className="text-rose" /> {t.openReports} report{t.openReports === 1 ? "" : "s"} waiting for review</span>
          <Icon name="arrowRight" />
        </Link>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Members" value={t.users} icon="users" hint={`${t.newThisWeek} new this week`} />
        <StatTile label="Active today" value={t.activeToday} icon="zap" tone="mint" />
        <StatTile label="Connections" value={t.connections} icon="heart" tone="rose" hint={`${t.pendingRequests} pending`} />
        <StatTile label="Moments" value={t.moments} icon="star" tone="sun" hint={`${t.liveTables} open tables`} />
        <StatTile label="Messages" value={t.messages} icon="chat" hint={`${t.flaggedMessages} flagged by the kindness check`} />
        <StatTile label="Paused or removed" value={t.suspended} icon="shield" tone="rose" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="New members" sub="Sign ups per day, last 14 days">
          <BarChart label="Sign ups per day" data={data.signups.map((d) => ({ label: d.day.slice(8), long: new Date(d.day + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" }), value: d.n }))} />
        </Panel>
        <Panel title="When people chat" sub="Messages by hour of day (UTC), last 7 days">
          <BarChart label="Messages by hour" data={data.hours.map((h) => ({ label: String(h.hour), long: `${h.hour}:00`, value: h.n }))} />
        </Panel>
        <Panel title="Most loved activities" sub="Moments finished, by activity">
          {data.activities.length ? <HBarChart label="Moments by activity" data={data.activities.map((a) => ({ label: activityById(a.activity).name, value: a.n }))} /> : <p className="text-sm text-muted">No moments yet.</p>}
        </Panel>
        <Panel title="Bond levels" sub="How close connected pairs have grown">
          <HBarChart label="Connections by bond level" data={data.bonds.map((b) => ({ label: `${b.level}. ${b.name}`, value: b.n }))} />
        </Panel>
        <Panel title="What members are looking for" sub="Profile intent">
          <HBarChart label="Members by intent" data={data.intents.map((i) => ({ label: INTENT_SHORT[i.intent] ?? i.intent, value: i.n }))} />
        </Panel>
        <Panel title="Recent moderator actions">
          {data.recentActions.length === 0 ? <p className="text-sm text-muted">Nothing yet.</p> : (
            <ul className="space-y-2 text-sm">
              {data.recentActions.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 rounded-xl bg-paper-deep p-2.5">
                  <span><strong>{a.admin_name ?? "An admin"}</strong> · {a.action} {a.target_name ? `on ${a.target_name}` : ""}{a.note ? <span className="block text-muted">{a.note}</span> : null}</span>
                  <span className="shrink-0 text-xs text-muted">{timeAgo(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/audit" className="mt-3 inline-block text-sm font-semibold text-violet hover:underline">Full audit log</Link>
        </Panel>
      </div>
      <div className="mt-5">
        <Panel title="Site analytics" sub="Consent based page events, last 30 days. Event name and path only.">
          {data.events.length === 0 ? <p className="text-sm text-muted">No events yet. Events only arrive from visitors who accepted analytics.</p> : (
            <table className="w-full text-left text-sm">
              <thead><tr className="text-muted"><th className="py-1.5">Event</th><th>Path</th><th className="text-right">Count</th></tr></thead>
              <tbody>{data.events.map((e) => <tr key={e.name + e.path} className="border-t border-line"><td className="py-1.5 font-semibold">{e.name}</td><td className="text-muted">{e.path}</td><td className="text-right tabular-nums">{e.count}</td></tr>)}</tbody>
            </table>
          )}
        </Panel>
      </div>
    </div>
  );
}
