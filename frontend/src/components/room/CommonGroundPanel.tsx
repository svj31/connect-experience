"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { CommonGround } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { Loader } from "../ui/Loader";

/**
 * Everything here is counted from answers the two of you gave at this table.
 * No scores are estimated or invented.
 */
export function CommonGroundPanel({ code, partnerName, onUseSpark }: { code: string; partnerName: string; onUseSpark: (text: string) => void }) {
  const [data, setData] = useState<CommonGround | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ commonGround: CommonGround }>(`/rooms/${code}/common-ground`)
      .then((r) => setData(r.commonGround))
      .catch((e) => setError(errorMessage(e)));
  }, [code]);

  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <Loader variant="hearts" caption="Comparing your answers" />;

  const pct = data.agreementRate === null ? null : Math.round(data.agreementRate * 100);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-bold tracking-wide text-muted uppercase">Would You Rather</h3>
        {pct === null ? (
          <p className="mt-1">Play a round of Would You Rather to compare answers.</p>
        ) : (
          <>
            <p className="mt-1 font-display text-3xl font-bold">
              {data.questionsAgreed} of {data.questionsCompared} <span className="text-lg font-normal text-muted">same picks</span>
            </p>
            <div className="mt-2 flex h-2 overflow-hidden rounded-lg bg-coral-soft" role="img" aria-label={`${pct} percent of picks matched`}>
              <span className="bg-teal" style={{ width: `${pct}%` }} />
            </div>
          </>
        )}
      </section>

      <section>
        <h3 className="text-sm font-bold tracking-wide text-muted uppercase">Shared interests</h3>
        {data.sharedInterests.length ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {data.sharedInterests.map((i) => <li key={i} className="rounded-lg bg-teal-soft px-2 py-1 text-sm font-semibold text-teal-dark capitalize">{i}</li>)}
          </ul>
        ) : (
          <p className="mt-1 text-muted">None listed in common yet. That is what the games are for.</p>
        )}
        {data.agreedTopics.length > 0 && (
          <p className="mt-2 text-sm text-muted">You picked the same side on: {data.agreedTopics.join(", ")}.</p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-bold tracking-wide text-muted uppercase">Conversation sparks</h3>
        <p className="mt-1 text-sm text-muted">Drawn from where you and {partnerName} agreed and where you split.</p>
        <ul className="mt-2 space-y-2">
          {data.sparks.map((s) => (
            <li key={s} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-paper p-3">
              <span className="text-[0.95rem]">{s}</span>
              <button onClick={() => onUseSpark(s)} className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-teal hover:bg-teal-soft">
                <Icon name="chat" size={16} /> Use
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
