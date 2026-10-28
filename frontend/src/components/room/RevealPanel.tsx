"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { Partner } from "@/lib/types";
import { Icon } from "../ui/Icon";

const LEVELS = [
  { title: "Basics", detail: "Name, pronouns, interests and avatar." },
  { title: "Your bio", detail: "The few lines you wrote about yourself." },
  { title: "Your handle", detail: "How to find you outside SaathVerse." },
];

/**
 * Progressive reveal: each person decides how much the other sees, one level at a time.
 * Higher levels unlock as you share moments, and you can always step back down.
 */
export function RevealPanel({
  code,
  myLevel,
  momentCount,
  thresholds,
  partner,
  onChanged,
}: {
  code: string;
  myLevel: number;
  momentCount: number;
  thresholds: number[];
  partner: Partner | null;
  onChanged: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<number | null>(null);

  async function choose(level: number) {
    setSaving(level);
    setError(null);
    try {
      await api(`/rooms/${code}/reveal`, { method: "PUT", body: { level } });
      onChanged();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-bold tracking-wide text-muted uppercase">What you share</h3>
        <p className="mt-1 text-sm text-muted">You have shared {momentCount} {momentCount === 1 ? "moment" : "moments"} at this table. Pick a level. You can lower it at any time.</p>
        <ol className="mt-3 space-y-2">
          {LEVELS.map((level, i) => {
            const locked = momentCount < thresholds[i];
            const active = myLevel === i;
            return (
              <li key={level.title}>
                <button
                  onClick={() => choose(i)}
                  disabled={locked || active || saving !== null}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                    active ? "border-ink bg-surface" : locked ? "border-line bg-paper text-muted" : "border-line bg-surface hover:border-ink"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-brand text-white" : "bg-paper-deep"}`}>
                    <Icon name={locked ? "lock" : active ? "check" : "unlock"} size={18} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold">Level {i}: {level.title}</span>
                    <span className="block text-sm text-muted">
                      {level.detail} {locked && `Unlocks after ${thresholds[i]} shared ${thresholds[i] === 1 ? "moment" : "moments"}.`}
                    </span>
                  </span>
                  {saving === i && <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" aria-label="Saving" />}
                </button>
              </li>
            );
          })}
        </ol>
        {error && <p role="alert" className="mt-2 text-sm font-medium text-danger">{error}</p>}
      </section>

      {partner && (
        <section>
          <h3 className="text-sm font-bold tracking-wide text-muted uppercase">What {partner.displayName} shares with you</h3>
          <dl className="mt-2 space-y-2 rounded-xl border border-line bg-paper p-3 text-[0.95rem]">
            <div>
              <dt className="text-sm text-muted">Interests</dt>
              <dd className="capitalize">{partner.interests.length ? partner.interests.join(", ") : "None listed"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Bio</dt>
              <dd>{partner.bio === null ? <span className="text-muted italic">Not shared yet</span> : partner.bio || "Left blank"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Handle</dt>
              <dd>{partner.handle === null ? <span className="text-muted italic">Not shared yet</span> : partner.handle || "Left blank"}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}
