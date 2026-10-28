"use client";

import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ActionError, Finished, Panel, Progress, Waiting, useAction, type ActivityProps } from "./shared";

export function WouldYouRather({ game, partnerName, act, restart }: ActivityProps) {
  const { run, error, busy } = useAction(act);
  if (game.done) {
    return (
      <Panel title="Would You Rather">
        <Finished title={`You agreed on ${game.agreed} of ${game.total}`} onAgain={restart}>
          Open Common Ground to see where you split and what to ask about it.
        </Finished>
      </Panel>
    );
  }

  const options: ("a" | "b")[] = ["a", "b"];
  return (
    <Panel
      title="Would You Rather"
      subtitle="Pick in secret. Both answers show at the same time."
      aside={<Progress value={game.round} total={game.total} label={`Round ${game.round + 1} of ${game.total}`} />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((key) => {
          const mine = game.myPick === key;
          const theirs = game.revealed && game.partnerPick === key;
          return (
            <button
              key={`${game.question.id}-${key}`}
              disabled={Boolean(game.myPick) || busy}
              onClick={() => run({ type: "pick", choice: key })}
              aria-pressed={mine}
              className={`group relative min-h-36 rounded-lg border-2 p-5 text-left transition-all duration-200 ${
                mine ? "border-ink bg-surface" : "border-line bg-surface hover:-translate-y-0.5 hover:border-ink"
              } ${game.myPick && !mine ? "opacity-70" : ""} disabled:cursor-default`}
            >
              <span className="text-xs font-bold tracking-widest text-muted uppercase">Option {key.toUpperCase()}</span>
              <span className="mt-2 block font-display text-xl leading-snug font-medium">{game.question[key]}</span>
              <span className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                {mine && <span className="rounded-lg bg-coral-soft px-2 py-1 text-coral-dark">Your pick</span>}
                {theirs && <span className="animate-pop rounded-lg bg-teal-soft px-2 py-1 text-teal-dark">{partnerName}&apos;s pick</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-12">
        {!game.myPick && game.partnerPicked && <Waiting>{partnerName} has picked. Your turn.</Waiting>}
        {game.myPick && !game.revealed && <Waiting>Waiting for {partnerName} to pick</Waiting>}
        {game.revealed && (
          <div className="flex flex-wrap items-center justify-between gap-3 animate-rise">
            <p className="flex items-center gap-2 font-semibold">
              <Icon name={game.myPick === game.partnerPick ? "check" : "wyr"} />
              {game.myPick === game.partnerPick ? "Same pick." : "You split on this one. Ask them why."}
            </p>
            <Button onClick={() => run({ type: "next" })} loading={busy}>
              {game.round + 1 === game.total ? "See result" : "Next question"} <Icon name="arrowRight" size={16} />
            </Button>
          </div>
        )}
      </div>
      <ActionError message={error} />
    </Panel>
  );
}
