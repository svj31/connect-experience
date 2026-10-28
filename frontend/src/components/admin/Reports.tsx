"use client";

import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { cap, timeAgo } from "@/lib/labels";
import { Chip, EmptyState, PageHeader } from "../app/widgets";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";
import { ActionDialog, type ModAction } from "./ActionDialog";

interface Report {
  id: number;
  reason: string;
  details: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
  adminNote: string;
  evidence: { from: "reporter" | "reported"; body: string; at: string }[];
  reporter: { id: number; name: string };
  reported: { id: number; name: string; status: string; totalReports: number };
}

const TABS = [["active", "Needs review"], ["resolved", "Resolved"], ["dismissed", "Dismissed"], ["all", "All"]] as const;
const TONE: Record<string, "violet" | "sun" | "mint" | "plain"> = { open: "violet", reviewing: "sun", resolved: "mint", dismissed: "plain" };

export function AdminReports() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("active");
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ action: ModAction; report: Report } | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(() => {
    api<{ reports: Report[] }>(`/admin/reports?status=${tab}`).then((r) => setReports(r.reports)).catch((e) => setError(errorMessage(e)));
  }, [tab]);
  useEffect(load, [load]);

  async function setStatus(r: Report, status: Report["status"], note = "") {
    await api(`/admin/reports/${r.id}`, { method: "PUT", body: { status, note } }).catch(() => undefined);
    load();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Reports" icon="flag" subtitle="Review what members told us. Messages appear only when the reporter chose to attach them." />
      <div role="tablist" className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => { setTab(id); setReports(null); }} className={`-mb-px border-b-2 px-4 py-2.5 font-bold whitespace-nowrap ${tab === id ? "border-rose text-rose" : "border-transparent text-muted hover:text-ink"}`}>{label}</button>
        ))}
      </div>
      {error ? <EmptyState title="Could not load reports" body={error} /> : !reports ? <Loader variant="shield" caption="Opening the queue" /> : reports.length === 0 ? (
        <EmptyState title="All clear" body="Nothing here right now. Thank you for keeping the verse kind." />
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="animate-rise rounded-3xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone="rose">{cap(r.reason.replace("-", " "))}</Chip>
                    <Chip tone={TONE[r.status]}>{cap(r.status)}</Chip>
                    {r.reported.totalReports > 1 && <Chip tone="sun"><Icon name="info" size={12} />{r.reported.totalReports} reports about this member</Chip>}
                  </div>
                  <p className="mt-2 font-semibold">{r.reporter.name} reported <span className="text-rose">{r.reported.name}</span> <span className="font-normal text-muted">· {timeAgo(r.createdAt)} · account {r.reported.status}</span></p>
                  {r.details && <p className="mt-1 rounded-xl bg-paper-deep p-3 text-sm">&ldquo;{r.details}&rdquo;</p>}
                  {r.adminNote && <p className="mt-2 text-sm text-muted"><strong>Note:</strong> {r.adminNote}</p>}
                </div>
              </div>
              {r.evidence.length > 0 && (
                <div className="mt-3">
                  <button onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id} className="flex items-center gap-1.5 text-sm font-semibold text-violet"><Icon name="chat" size={15} /> {open === r.id ? "Hide" : "Show"} {r.evidence.length} attached messages <Icon name="chevronDown" size={14} className={open === r.id ? "rotate-180" : ""} /></button>
                  {open === r.id && (
                    <ol className="mt-2 max-h-64 space-y-1.5 overflow-y-auto rounded-2xl border border-line p-3">
                      {r.evidence.map((m, i) => (
                        <li key={i} className={`flex ${m.from === "reported" ? "justify-start" : "justify-end"}`}>
                          <span className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-sm ${m.from === "reported" ? "bg-rose-soft" : "bg-paper-deep"}`}><span className="block text-[10px] font-bold text-muted">{m.from === "reported" ? r.reported.name : r.reporter.name}</span>{m.body}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
              {(r.status === "open" || r.status === "reviewing") && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  {r.status === "open" && <Button size="sm" variant="secondary" onClick={() => setStatus(r, "reviewing", "Looking into it")}><Icon name="eye" size={15} /> Start review</Button>}
                  <Button size="sm" onClick={() => setDialog({ action: "warn", report: r })}>Warn</Button>
                  <Button size="sm" variant="accent" onClick={() => setDialog({ action: "suspend", report: r })}>Pause account</Button>
                  <Button size="sm" variant="danger" onClick={() => setDialog({ action: "ban", report: r })}>Remove account</Button>
                  <Button size="sm" variant="ghost" onClick={() => setStatus(r, "dismissed", "No action needed")}>Dismiss</Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <ActionDialog action={dialog?.action ?? null} user={dialog ? { id: dialog.report.reported.id, name: dialog.report.reported.name } : null} reportId={dialog?.report.id} onClose={() => setDialog(null)} onDone={() => { setDialog(null); load(); }} />
    </div>
  );
}
