"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { Button } from "../ui/Button";
import { TextArea } from "../ui/Field";
import { Modal } from "../ui/Modal";

export type ModAction = "warn" | "suspend" | "ban" | "reinstate";

const COPY: Record<ModAction, { title: string; body: string; button: string; variant: "primary" | "accent" | "danger" | "secondary" }> = {
  warn: { title: "Send a warning", body: "They get a live note from the team. Nothing else changes.", button: "Send warning", variant: "primary" },
  suspend: { title: "Pause this account", body: "They cannot sign in, chat or be found until the pause ends.", button: "Pause account", variant: "accent" },
  ban: { title: "Remove this account", body: "They can no longer sign in. Use this for serious or repeated harm.", button: "Remove account", variant: "danger" },
  reinstate: { title: "Restore this account", body: "Lifts any pause or removal straight away.", button: "Restore", variant: "secondary" },
};

/** Confirms a moderation action with a note. Every action is written to the audit log. */
export function ActionDialog({ action, user, reportId, onClose, onDone }: { action: ModAction | null; user: { id: number; name: string } | null; reportId?: number; onClose: () => void; onDone: () => void }) {
  const [note, setNote] = useState("");
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!action || !user) return null;
  const c = COPY[action];
  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/users/${user!.id}/action`, { body: { action, days, note, reportId } });
      setNote("");
      onDone();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal open onClose={onClose} title={`${c.title}: ${user.name}`}>
      <p className="text-muted">{c.body}</p>
      {action === "suspend" && (
        <label className="mt-4 block text-sm font-semibold">Length
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-1 block h-10 rounded-xl border border-line-strong bg-surface px-3">
            {[1, 3, 7, 14, 30].map((d) => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>)}
          </select>
        </label>
      )}
      <TextArea className="mt-4" label={action === "warn" ? "Message to the member" : "Note for the audit log"} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={c.variant} onClick={submit} loading={busy}>{c.button}</Button>
      </div>
    </Modal>
  );
}
