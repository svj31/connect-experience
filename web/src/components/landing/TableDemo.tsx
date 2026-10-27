"use client";

import { useState } from "react";
import { Avatar } from "../ui/Avatar";
import { Icon } from "../ui/Icon";

/**
 * A hands-on preview of one round, run entirely in the browser.
 * The other side is an example player and is labelled as one.
 */
const EXAMPLE_PICK = "b";
const LEVELS = ["Basics", "Bio", "Handle"];

export function TableDemo() {
  const [pick, setPick] = useState<"a" | "b" | null>(null);
  const [level, setLevel] = useState(0);
  const options = { a: "Sunrise hike", b: "Late night walk" } as const;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
        <p className="text-xs font-bold tracking-widest text-muted uppercase">Try a round</p>
        <h3 className="mt-1 font-display text-2xl font-semibold">Would you rather...</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {(["a", "b"] as const).map((key) => {
            const mine = pick === key;
            const theirs = pick !== null && EXAMPLE_PICK === key;
            return (
              <button
                key={key}
                onClick={() => setPick(key)}
                disabled={pick !== null}
                aria-pressed={mine}
                className={`min-h-28 rounded-md border-2 p-4 text-left transition-all disabled:cursor-default ${mine ? "border-ink" : "border-line enabled:hover:-translate-y-0.5 enabled:hover:border-ink"}`}
              >
                <span className="font-display text-lg font-medium">{options[key]}</span>
                <span className="mt-3 flex flex-wrap gap-1.5 text-xs font-semibold">
                  {mine && <span className="rounded-sm bg-coral-soft px-2 py-1 text-coral-dark">You</span>}
                  {theirs && <span className="animate-pop rounded-sm bg-teal-soft px-2 py-1 text-teal-dark">Example player</span>}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 min-h-14 text-[0.95rem]" aria-live="polite">
          {pick === null && <p className="text-muted">Pick one. On a real table, both answers flip over at the same moment.</p>}
          {pick !== null && (
            <div className="animate-rise">
              <p className="font-semibold">{pick === EXAMPLE_PICK ? "Same pick. That goes into your Common Ground." : "You split. Overlap turns that into a question to ask."}</p>
              <p className="mt-1 text-muted">
                {pick === EXAMPLE_PICK ? "Spark: \"You both picked a late night walk. Where would you go?\"" : "Spark: \"You chose a sunrise hike and they chose a late night walk. Ask what wins it for them.\""}
              </p>
              <button onClick={() => setPick(null)} className="mt-2 text-sm font-semibold text-teal underline underline-offset-2">Try again</button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
        <p className="text-xs font-bold tracking-widest text-muted uppercase">Reveal at your pace</p>
        <h3 className="mt-1 font-display text-2xl font-semibold">Profiles open up as you do</h3>
        <div className="mt-4 flex items-center gap-3">
          <Avatar shape="star" color="sun" name="Example" size={52} />
          <div>
            <p className="font-semibold">Example player <span className="font-normal text-muted">they/them</span></p>
            <p className="text-sm text-muted">Art, books, writing</p>
          </div>
        </div>
        <dl className="mt-4 space-y-2 text-[0.95rem]">
          <div className={`rounded-md border p-3 transition-colors ${level >= 1 ? "border-line bg-paper" : "border-dashed border-line-strong"}`}>
            <dt className="text-sm text-muted">Bio</dt>
            <dd>{level >= 1 ? "Draws on receipts. Reads on buses." : <span className="flex items-center gap-1.5 text-muted"><Icon name="lock" size={14} /> After 1 shared moment, if they choose</span>}</dd>
          </div>
          <div className={`rounded-md border p-3 transition-colors ${level >= 2 ? "border-line bg-paper" : "border-dashed border-line-strong"}`}>
            <dt className="text-sm text-muted">Handle</dt>
            <dd>{level >= 2 ? "@example.player" : <span className="flex items-center gap-1.5 text-muted"><Icon name="lock" size={14} /> After 3 shared moments, if they choose</span>}</dd>
          </div>
        </dl>
        <div className="mt-4" role="radiogroup" aria-label="Reveal level">
          <div className="grid grid-cols-3 gap-1 rounded-md bg-paper-deep p-1">
            {LEVELS.map((label, i) => (
              <button
                key={label}
                role="radio"
                aria-checked={level === i}
                onClick={() => setLevel(i)}
                className={`h-9 rounded-sm text-sm font-semibold transition-colors ${level === i ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
