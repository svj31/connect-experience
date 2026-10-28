"use client";

import { useState, type FormEvent } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ActionError, Finished, Panel, Progress, Waiting, useAction, type ActivityProps } from "./shared";

const DEPTH = ["", "Warm up", "Getting closer", "The deep end"];

/** Deep Talk: both answer the same card in secret, then the two answers turn over together. */
export function DeepTalk({ game, act, restart, partnerName }: ActivityProps) {
  const { run, error, busy } = useAction(act);
  const [text, setText] = useState("");

  if (game.done) {
    return (
      <Finished title="Six honest answers" onAgain={restart}>
        You went from small talk to the deep end together.
      </Finished>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (await run({ type: "answer", text })) setText("");
  }

  return (
    <Panel title="Deep Talk" subtitle="Answer honestly. Nobody sees an answer until you both have one." aside={<Progress value={game.round} total={game.total} label={DEPTH[game.card.level]} />}>
      <div key={game.card.id} className="animate-pop rounded-[24px] border-2 border-violet/30 bg-violet-soft p-6 text-center">
        <p className="text-xs font-bold tracking-widest text-violet uppercase">{DEPTH[game.card.level]}</p>
        <p className="mx-auto mt-2 max-w-xl font-display text-2xl font-bold text-balance sm:text-3xl">{game.card.text}</p>
      </div>

      {game.revealed ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="animate-rise rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs font-bold text-violet">You</p>
            <p className="mt-1">{game.myAnswer}</p>
          </div>
          <div className="animate-rise rounded-2xl border border-line bg-surface p-4 [animation-delay:150ms]">
            <p className="text-xs font-bold text-rose">{partnerName}</p>
            <p className="mt-1">{game.partnerAnswer}</p>
          </div>
          <div className="sm:col-span-2">
            <Button onClick={() => run({ type: "next" })} loading={busy}>
              {game.round + 1 >= game.total ? "Finish" : "Next card"} <Icon name="arrowRight" size={16} />
            </Button>
          </div>
        </div>
      ) : game.myAnswer ? (
        <div className="mt-5 space-y-3">
          <p className="rounded-2xl border border-line bg-surface p-4"><span className="text-xs font-bold text-violet">Your answer</span><br />{game.myAnswer}</p>
          <Waiting>{partnerName} is still writing. Their answer stays hidden until it is done.</Waiting>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5">
          <label htmlFor="deep-answer" className="mb-1.5 block text-sm font-semibold">Your answer</label>
          <textarea id="deep-answer" value={text} onChange={(e) => setText(e.target.value)} maxLength={280} className="min-h-24 w-full rounded-2xl border border-line-strong bg-surface p-3 focus:border-violet focus:outline-none" placeholder="Take your time" />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs text-muted">{text.length}/280{game.partnerAnswered ? ` · ${partnerName} has answered` : ""}</span>
            <Button type="submit" loading={busy} disabled={text.trim().length < 2}>Lock in my answer</Button>
          </div>
        </form>
      )}
      <ActionError message={error} />
    </Panel>
  );
}
