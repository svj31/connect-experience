"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { timeAgo } from "@/lib/labels";
import { useSession } from "@/lib/session";
import { EmptyState, PageHeader, StatTile } from "../app/widgets";
import { Avatar } from "../ui/Avatar";
import { Loader } from "../ui/Loader";

interface Action { id: number; action: string; note: string; created_at: string; admin_name: string | null; target_name: string | null; report_id: number | null }

function ActionTable({ actions }: { actions: Action[] }) {
  if (actions.length === 0) return <EmptyState title="No actions yet" body="Every warning, pause, removal and report decision is recorded here." />;
  return (
    <div className="overflow-x-auto rounded-[24px] border border-line bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-muted"><tr><th className="px-4 py-3">When</th><th>Admin</th><th>Action</th><th>Member</th><th className="px-4">Note</th></tr></thead>
        <tbody>
          {actions.map((a) => (
            <tr key={a.id} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5 whitespace-nowrap text-muted">{timeAgo(a.created_at)}</td>
              <td className="font-semibold">{a.admin_name ?? "Removed admin"}</td>
              <td><code className="rounded-md bg-paper-deep px-1.5 py-0.5 text-xs">{a.action}</code>{a.report_id ? <span className="ml-1 text-xs text-muted">report #{a.report_id}</span> : null}</td>
              <td>{a.target_name ?? "Not set"}</td>
              <td className="px-4 text-muted">{a.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminAudit() {
  const [actions, setActions] = useState<Action[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<{ actions: Action[] }>("/admin/audit").then((r) => setActions(r.actions)).catch((e) => setError(errorMessage(e)));
  }, []);
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Audit log" icon="list" subtitle="Every moderation decision, who made it and why. Entries cannot be edited." />
      {error ? <EmptyState title="Could not load the log" body={error} /> : !actions ? <Loader variant="shield" /> : <ActionTable actions={actions} />}
    </div>
  );
}

export function AdminProfile() {
  const { user } = useSession();
  const [data, setData] = useState<{ admin: { displayName: string; email: string; createdAt: string }; actions: Action[] } | null>(null);
  useEffect(() => {
    api<typeof data>("/admin/me").then(setData).catch(() => undefined);
  }, []);
  if (!data || !user) return <Loader variant="shield" />;
  const count = (prefix: string) => data.actions.filter((a) => a.action.startsWith(prefix)).length;
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="My admin profile" icon="user" />
      <section className="flex flex-wrap items-center gap-5 rounded-[24px] border border-line bg-surface p-6">
        <Avatar name={data.admin.displayName} config={user.avatar} size={88} />
        <div>
          <p className="font-display text-3xl font-bold">{data.admin.displayName}</p>
          <p className="text-muted">{data.admin.email} · Admin since {new Date(data.admin.createdAt.replace(" ", "T") + "Z").toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
        </div>
      </section>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Actions taken" value={data.actions.length} icon="list" />
        <StatTile label="Warnings" value={count("warn")} icon="info" tone="sun" />
        <StatTile label="Pauses and removals" value={count("suspend") + count("ban")} icon="shield" tone="rose" />
        <StatTile label="Reports closed" value={count("report:resolved") + count("report:dismissed")} icon="checkCircle" tone="mint" />
      </div>
      <h2 className="mt-8 mb-3 font-display text-2xl font-bold">Your recent actions</h2>
      <ActionTable actions={data.actions} />
      <section className="mt-8 rounded-[24px] border border-line bg-surface p-5 text-sm">
        <h2 className="font-display text-xl font-bold">How we moderate</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          <li>Admins never read private chats. Only messages a reporter chose to attach are visible, inside that report.</li>
          <li>Emails are partly hidden in the member list. Profiles are not shown here.</li>
          <li>Every action needs a reason and is written to the audit log for accountability.</li>
          <li>Pauses end on their own. Removal is for serious or repeated harm.</li>
        </ul>
      </section>
    </div>
  );
}
