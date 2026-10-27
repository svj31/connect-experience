"use client";

import { useState, type FormEvent } from "react";
import { api, errorMessage } from "@/lib/api";
import { Button } from "../ui/Button";

const REASONS = [
  { value: "harassment", label: "Harassment or threats" },
  { value: "inappropriate", label: "Sexual or inappropriate content" },
  { value: "spam", label: "Spam, scams or selling" },
  { value: "underage", label: "May be under 18" },
  { value: "other", label: "Something else" },
];

export function SafetyPanel({ partnerId, partnerName, code, onDone }: { partnerId: number; partnerName: string; code: string; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function report(e: FormEvent) {
    e.preventDefault();
    if (!reason) return setError("Choose a reason");
    setBusy(true);
    try {
      await api("/safety/report", { body: { userId: partnerId, reason, details, roomCode: code } });
      onDone();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  async function block() {
    setBusy(true);
    try {
      await api("/safety/block", { body: { userId: partnerId } });
      onDone();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-[0.95rem] text-muted">
        Blocking ends this table and {partnerName} will not be able to find or join you again. Reporting also blocks,
        and sends what happened to our safety team.
      </p>
      <form onSubmit={report} className="space-y-3" noValidate>
        <fieldset>
          <legend className="mb-2 font-semibold">What happened?</legend>
          <div className="space-y-1.5">
            {REASONS.map((r) => (
              <label key={r.value} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 ${reason === r.value ? "border-ink" : "border-line"}`}>
                <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} className="accent-coral" />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="report-details" className="mb-1 block text-sm font-semibold">Details (optional)</label>
          <textarea id="report-details" value={details} maxLength={500} onChange={(e) => setDetails(e.target.value)} className="min-h-20 w-full rounded-md border border-line-strong p-2 focus:border-teal focus:outline-none" />
        </div>
        {error && <p role="alert" className="text-sm font-medium text-coral-dark">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="accent" loading={busy}>Report and block</Button>
          <Button type="button" variant="secondary" onClick={block} disabled={busy}>Block only</Button>
        </div>
      </form>
    </div>
  );
}
