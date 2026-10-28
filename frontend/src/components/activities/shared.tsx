"use client";

import { useState, type ReactNode } from "react";
import type { Ack } from "@/lib/socket";
import { Button } from "../ui/Button";

export interface ActivityProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  game: any;
  me: number;
  hostId: number;
  partnerName: string;
  act: (action: Record<string, unknown>) => Promise<Ack>;
  restart: () => Promise<Ack>;
  /** Picks made for this pair: videos for Watch Together, prompts for Draw Together. */
  ideas?: { watch: { id: string; title: string; mood: string; url: string }[]; draw: string[] };
}

/** The host plays violet and the guest plays rose, everywhere in the room. */
export const seatColor = (userId: number, hostId: number) => (userId === hostId ? "#6d4fd1" : "#d0569f");

export function Panel({ title, subtitle, children, aside }: { title: string; subtitle?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="animate-rise" aria-label={title}>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}

export function Waiting({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 rounded-xl border border-dashed border-line-strong bg-paper px-3 py-2 text-sm text-muted" aria-live="polite">
      <span className="inline-flex gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal [animation-delay:200ms]" />
      </span>
      {children}
    </p>
  );
}

export function Progress({ value, total, label }: { value: number; total: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <span>{label}</span>
      <span className="flex gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1.5 w-5 rounded-lg ${i < value ? "bg-violet" : i === value ? "bg-coral" : "bg-line"}`} />
        ))}
      </span>
    </div>
  );
}

/** Runs an action, shows the server's message if it was refused. */
export function useAction(act: ActivityProps["act"]) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(action: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const res = await act(action);
    setBusy(false);
    if (!res.ok) setError(res.error ?? "That did not work");
    return res.ok;
  }
  return { run, error, busy, setError };
}

export function ActionError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="alert" className="mt-3 text-sm font-medium text-danger">{message}</p>;
}

export function Finished({ title, children, onAgain }: { title: string; children?: ReactNode; onAgain: () => void }) {
  return (
    <div className="animate-pop rounded-3xl border border-line bg-paper p-6 text-center">
      <p className="font-display text-2xl font-semibold">{title}</p>
      {children && <div className="mt-2 text-muted">{children}</div>}
      <p className="mt-2 text-sm text-muted">Saved to your moments.</p>
      <Button className="mt-4" onClick={onAgain}>Play again</Button>
    </div>
  );
}
