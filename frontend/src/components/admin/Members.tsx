"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { cap, timeAgo } from "@/lib/labels";
import { Chip, EmptyState, PageHeader } from "../app/widgets";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";
import { ActionDialog, type ModAction } from "./ActionDialog";

interface Member {
  id: number; displayName: string; email: string; role: string; status: "active" | "suspended" | "banned"; suspendedUntil: string | null;
  createdAt: string; lastActiveAt: string | null; city: string; reportsAgainst: number; connections: number; online: boolean;
}

export function AdminMembers() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ action: ModAction; user: Member } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      api<{ users: Member[] }>(`/admin/users?q=${encodeURIComponent(q)}`).then((r) => setUsers(r.users)).catch((e) => setError(errorMessage(e)));
    }, 250);
    return () => clearTimeout(t);
  }, [q, tick]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Members" icon="users" subtitle="Account status and safety signals. Emails are partly hidden; profiles and chats are not shown here." />
      <div className="mb-4 flex max-w-md items-center gap-2 rounded-xl border border-line-strong bg-surface px-3">
        <Icon name="search" size={16} className="text-muted" />
        <label htmlFor="member-search" className="sr-only">Search members</label>
        <input id="member-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className="h-11 w-full bg-transparent focus:outline-none" />
      </div>
      {error ? <EmptyState title="Could not load members" body={error} /> : !users ? <Loader variant="shield" /> : (
        <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr><th className="px-4 py-3">Member</th><th>Status</th><th>City</th><th>Connections</th><th>Reports</th><th>Last active</th><th className="px-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0 hover:bg-paper-deep">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-semibold">{u.online && <span className="h-2 w-2 rounded-full bg-mint" title="Online" />}{u.displayName}{u.role === "admin" && <Chip tone="rose">Admin</Chip>}</span>
                    <span className="text-xs text-muted">{u.email}</span>
                  </td>
                  <td><Chip tone={u.status === "active" ? "mint" : u.status === "suspended" ? "sun" : "rose"}>{cap(u.status)}</Chip>{u.suspendedUntil && <span className="block text-xs text-muted">until {u.suspendedUntil.slice(0, 10)}</span>}</td>
                  <td className="text-muted">{u.city || "Not set"}</td>
                  <td className="tabular-nums">{u.connections}</td>
                  <td className={`tabular-nums ${u.reportsAgainst ? "font-bold text-rose" : ""}`}>{u.reportsAgainst}</td>
                  <td className="text-muted">{u.lastActiveAt ? timeAgo(u.lastActiveAt) : "Never"}</td>
                  <td className="px-4 text-right">
                    {u.role !== "admin" && (
                      <span className="inline-flex gap-1">
                        <button onClick={() => setDialog({ action: "warn", user: u })} className="rounded-lg px-2 py-1 text-xs font-bold text-violet hover:bg-violet-soft">Warn</button>
                        {u.status === "active" ? (
                          <>
                            <button onClick={() => setDialog({ action: "suspend", user: u })} className="rounded-lg px-2 py-1 text-xs font-bold text-sun hover:bg-sun-soft">Pause</button>
                            <button onClick={() => setDialog({ action: "ban", user: u })} className="rounded-lg px-2 py-1 text-xs font-bold text-danger hover:bg-rose-soft">Remove</button>
                          </>
                        ) : (
                          <button onClick={() => setDialog({ action: "reinstate", user: u })} className="rounded-lg px-2 py-1 text-xs font-bold text-mint hover:bg-mint-soft">Restore</button>
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ActionDialog action={dialog?.action ?? null} user={dialog ? { id: dialog.user.id, name: dialog.user.displayName } : null} onClose={() => setDialog(null)} onDone={() => { setDialog(null); setTick((t) => t + 1); }} />
    </div>
  );
}
