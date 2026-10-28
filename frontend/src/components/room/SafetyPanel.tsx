"use client";

import { useState, type FormEvent } from "react";
import { api, errorMessage } from "@/lib/api";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

const REASONS = [
  { value: "harassment", label: "Harassment or threats", icon: "flag" },
  { value: "inappropriate", label: "Sexual or inappropriate content", icon: "eyeOff" },
  { value: "scam", label: "Asking for money or a scam", icon: "gift" },
  { value: "fake-profile", label: "Fake profile or impersonation", icon: "user" },
  { value: "spam", label: "Spam or selling", icon: "send" },
  { value: "underage", label: "May be under 18", icon: "info" },
  { value: "other", label: "Something else", icon: "chat" },
];

/** Leaves at once and lands on a neutral page. For moments when someone needs out, fast. */
export function quickExit() {
  window.location.replace("https://www.google.com/search?q=weather");
}

/**
 * Report or block, in as few taps as possible. Reporting also blocks. Messages are only
 * attached when the reporter ticks the box, and only from this conversation.
 */
export function SafetyPanel({ partnerId, partnerName, code, onDone }: { partnerId: number; partnerName: string; code?: string; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [include, setInclude] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"reported" | "blocked" | null>(null);

  async function report(e: FormEvent) {
    e.preventDefault();
    if (!reason) return setError("Choose what happened");
    setBusy(true);
    try {
      await api("/safety/report", { body: { userId: partnerId, reason, details, roomCode: code, includeMessages: Boolean(code) && include } });
      setDone("reported");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  async function block() {
    setBusy(true);
    try {
      await api("/safety/block", { body: { userId: partnerId } });
      setDone("blocked");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-soft text-mint"><Icon name="shield" size={28} /></span>
        <p className="mt-3 font-display text-2xl font-semibold">{done === "reported" ? "Thank you for telling us" : "Blocked"}</p>
        <p className="mt-1 text-muted">
          {partnerName} can no longer find you, message you or join you.{done === "reported" ? " Our team will review the report, and you can follow it in the Safety centre." : ""}
        </p>
        <Button className="mt-5" onClick={onDone}>Done</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 rounded-2xl bg-rose-soft p-3 text-sm">
        <p>Feeling unsafe right now? Quick exit leaves immediately.</p>
        <button onClick={quickExit} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-rose px-2.5 py-1.5 font-bold text-on-primary"><Icon name="exit" size={15} /> Quick exit</button>
      </div>
      <form onSubmit={report} className="space-y-3" noValidate>
        <fieldset>
          <legend className="mb-2 font-semibold">What happened?</legend>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {REASONS.map((r) => (
              <label key={r.value} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${reason === r.value ? "border-violet bg-violet-soft" : "border-line hover:border-line-strong"}`}>
                <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => { setReason(r.value); setError(null); }} className="sr-only" />
                <Icon name={r.icon} size={16} className={reason === r.value ? "text-violet" : "text-muted"} />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="report-details" className="mb-1 block text-sm font-semibold">Anything else we should know? (optional)</label>
          <textarea id="report-details" value={details} maxLength={500} onChange={(e) => setDetails(e.target.value)} className="min-h-20 w-full rounded-xl border border-line-strong bg-surface p-2.5 focus:border-violet focus:outline-none" />
        </div>
        {code && (
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={include} onChange={(e) => setInclude(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--violet)]" />
            <span>Attach the last 20 messages from this conversation so a moderator can see what happened. Nothing else from your chats is shared.</span>
          </label>
        )}
        {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="submit" variant="accent" loading={busy}><Icon name="flag" size={16} /> Report and block</Button>
          <Button type="button" variant="secondary" onClick={block} disabled={busy}>Block only</Button>
        </div>
      </form>
    </div>
  );
}
