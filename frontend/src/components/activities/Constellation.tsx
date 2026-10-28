"use client";

import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";
import { Loader } from "../ui/Loader";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ActionError, Panel, seatColor, useAction, type ActivityProps } from "./shared";
import type { StarPoint } from "./ConstellationScene";

const ConstellationScene = dynamic(() => import("./ConstellationScene"), {
  ssr: false,
  loading: () => <Loader variant="stars" caption="Unrolling the sky" />,
});

export function Constellation({ game, me, hostId, act }: ActivityProps) {
  const { run, error, busy } = useAction(act);
  const [name, setName] = useState("");
  const stars: StarPoint[] = game.stars;
  const mine = stars.filter((s) => s.uid === me).length;

  async function submitName(e: FormEvent) {
    e.preventDefault();
    if (await run({ type: "name", name })) setName("");
  }

  return (
    <Panel
      title={game.done ? `"${game.name}"` : "Constellation"}
      subtitle={game.done ? "Named and saved to your moments." : "Tap the globe to place a star. Drag to turn it. Lines join stars in the order you place them."}
      aside={<span className="text-sm text-muted">{stars.length} of {game.max} stars, {mine} yours</span>}
    >
      <div className="relative h-[340px] overflow-hidden rounded-lg border border-line bg-[#f4f7f6] sm:h-[400px]">
        <ConstellationScene
          stars={stars}
          done={game.done}
          colorFor={(uid) => seatColor(uid, hostId)}
          onPlace={(p) => void run({ type: "place", ...p })}
        />
        <div className="pointer-events-none absolute top-3 left-3 flex gap-3 rounded-xl bg-surface/90 px-2.5 py-1.5 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: seatColor(me, hostId) }} />Your stars</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: seatColor(me === hostId ? -1 : hostId, hostId) }} />Theirs</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        {game.done ? (
          <Button variant="secondary" onClick={() => run({ type: "reset" })}><Icon name="refresh" size={16} /> Start a new sky</Button>
        ) : (
          <>
            <Button variant="secondary" size="md" onClick={() => run({ type: "undo" })} disabled={mine === 0}><Icon name="undo" size={16} /> Remove my last star</Button>
            <form onSubmit={submitName} className="flex flex-1 gap-2">
              <label htmlFor="constellation-name" className="sr-only">Name your constellation</label>
              <input
                id="constellation-name"
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                placeholder={stars.length < 3 ? "Place three stars to name it" : "Name it together"}
                disabled={stars.length < 3}
                className="h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-surface px-3 focus:border-teal focus:outline-none disabled:bg-paper"
              />
              <Button type="submit" loading={busy} disabled={stars.length < 3 || name.trim().length < 2}>Name it</Button>
            </form>
          </>
        )}
      </div>
      <ActionError message={error} />
    </Panel>
  );
}
