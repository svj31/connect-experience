"use client";

import { useState, type FormEvent } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ActionError, Finished, Panel, Waiting, useAction, type ActivityProps } from "./shared";

function Writer({ onSubmit, busy }: { onSubmit: (statements: string[], lie: number) => void; busy: boolean }) {
  const [statements, setStatements] = useState(["", "", ""]);
  const [lie, setLie] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (statements.some((s) => s.trim().length < 3)) return setError("Write all three, at least 3 characters each");
    if (lie === null) return setError("Mark which one is the lie");
    setError(null);
    onSubmit(statements, lie);
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      {statements.map((value, i) => (
        <div key={i} className={`flex items-center gap-2 rounded-xl border-2 bg-surface p-2 ${lie === i ? "border-coral" : "border-line"}`}>
          <label className="sr-only" htmlFor={`ttl-${i}`}>Statement {i + 1}</label>
          <input
            id={`ttl-${i}`}
            value={value}
            maxLength={120}
            placeholder={["I once...", "I have never...", "I can..."][i]}
            onChange={(e) => setStatements((prev) => prev.map((p, j) => (j === i ? e.target.value : p)))}
            className="h-10 flex-1 bg-transparent px-2 focus:outline-none"
          />
          <label className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-semibold ${lie === i ? "bg-coral-soft text-coral-dark" : "text-muted hover:bg-paper-deep"}`}>
            <input type="radio" name="lie" className="accent-coral" checked={lie === i} onChange={() => setLie(i)} />
            The lie
          </label>
        </div>
      ))}
      {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}
      <Button type="submit" loading={busy}>Send to your partner</Button>
    </form>
  );
}

export function TwoTruths({ game, partnerName, act, restart }: ActivityProps) {
  const { run, error, busy } = useAction(act);
  if (game.done) {
    return (
      <Panel title="Two Truths and a Lie">
        <Finished title={`${game.score} of ${game.total} lies caught`} onAgain={restart} />
      </Panel>
    );
  }

  const isAuthor = game.role === "author";
  return (
    <Panel
      title="Two Truths and a Lie"
      subtitle={isAuthor ? "Write two true things about you and one invention." : `Which of ${partnerName}'s statements is made up?`}
      aside={<span className="text-sm text-muted">Round {game.round + 1} of {game.total}</span>}
    >
      {isAuthor && !game.statements && <Writer busy={busy} onSubmit={(statements, lie) => run({ type: "submit", statements, lie })} />}
      {!isAuthor && !game.statements && <Waiting>{partnerName} is writing three statements</Waiting>}

      {game.statements && (
        <ol className="space-y-2">
          {game.statements.map((s: string, i: number) => {
            const isLie = game.lie === i;
            const picked = game.guess === i;
            let tone = "border-line bg-surface";
            if (game.revealed && isLie) tone = "border-coral bg-coral-soft";
            else if (game.revealed) tone = "border-teal bg-teal-soft";
            else if (isAuthor && isLie) tone = "border-coral border-dashed bg-surface";
            return (
              <li key={i}>
                <button
                  disabled={isAuthor || game.revealed || busy}
                  onClick={() => run({ type: "guess", index: i })}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left font-medium transition-colors enabled:hover:border-ink disabled:cursor-default ${tone}`}
                >
                  <span>{s}</span>
                  <span className="shrink-0 text-xs font-bold uppercase">
                    {game.revealed ? (isLie ? "Lie" : "True") : isAuthor && isLie ? "Your lie" : ""}
                    {picked && " (guessed)"}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-4 min-h-12">
        {isAuthor && game.statements && !game.revealed && <Waiting>{partnerName} is deciding</Waiting>}
        {game.revealed && (
          <div className="flex flex-wrap items-center justify-between gap-3 animate-rise">
            <p className="font-semibold">{game.guess === game.lie ? "Caught it." : "Fooled them."} Ask about the true ones.</p>
            <Button onClick={() => run({ type: "next" })} loading={busy}>
              Swap roles <Icon name="arrowRight" size={16} />
            </Button>
          </div>
        )}
      </div>
      <ActionError message={error} />
    </Panel>
  );
}
