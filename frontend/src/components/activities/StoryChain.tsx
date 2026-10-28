"use client";

import { useState, type FormEvent } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ActionError, Finished, Panel, Waiting, seatColor, useAction, type ActivityProps } from "./shared";

export function StoryChain({ game, me, hostId, partnerName, act, restart }: ActivityProps) {
  const { run, error, busy } = useAction(act);
  const [text, setText] = useState("");
  const myTurn = game.turn === me;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (text.trim().length < 2) return;
    if (await run({ type: "add", text })) setText("");
  }

  return (
    <Panel title="Story Chain" subtitle="Take turns adding the next line." aside={<span className="text-sm text-muted">{game.lines.length} of {game.max} lines</span>}>
      <article className="rounded-lg border border-line bg-surface p-5 font-display text-lg leading-relaxed">
        <p className="text-muted italic">{game.opener}</p>
        {game.lines.map((line: { uid: number; text: string }, i: number) => (
          <p key={i} className="mt-2 animate-rise border-l-4 pl-3" style={{ borderColor: seatColor(line.uid, hostId) }}>
            {line.text}
          </p>
        ))}
      </article>

      {game.done ? (
        <div className="mt-4"><Finished title="The end" onAgain={restart} /></div>
      ) : (
        <div className="mt-4">
          {myTurn ? (
            <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="story-line" className="sr-only">Your next line</label>
              <input
                id="story-line"
                value={text}
                maxLength={160}
                autoFocus
                onChange={(e) => setText(e.target.value)}
                placeholder="What happens next?"
                className="h-11 flex-1 rounded-xl border border-line-strong bg-surface px-3 focus:border-teal focus:outline-none"
              />
              <Button type="submit" loading={busy} disabled={text.trim().length < 2}>Add line <Icon name="arrowRight" size={16} /></Button>
            </form>
          ) : (
            <Waiting>{partnerName} is writing the next line</Waiting>
          )}
          {game.lines.length >= 2 && (
            <button onClick={() => run({ type: "finish" })} className="mt-3 text-sm font-semibold text-teal underline underline-offset-2">
              End the story here and save it
            </button>
          )}
        </div>
      )}
      <ActionError message={error} />
    </Panel>
  );
}
