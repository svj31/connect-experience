"use client";

import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ActionError, Finished, Panel, Progress, Waiting, useAction, type ActivityProps } from "./shared";

export function InSync({ game, partnerName, act, restart }: ActivityProps) {
  const { run, error, busy } = useAction(act);
  if (game.done) {
    return (
      <Panel title="In Sync">
        <Finished title={`${game.score} of ${game.total} guessed right`} onAgain={restart} />
      </Panel>
    );
  }

  const isSubject = game.role === "subject";
  const prompt = isSubject ? `About you: ${game.question.prompt}` : `How would ${partnerName} answer: ${game.question.prompt}`;
  const canPick = isSubject ? !game.answered : game.answered && game.guess === null;
  const actionType = isSubject ? "answer" : "guess";

  return (
    <Panel
      title="In Sync"
      subtitle={isSubject ? `Answer honestly. ${partnerName} will try to guess.` : `Guess what ${partnerName} picked about themselves.`}
      aside={<Progress value={game.round} total={game.total} label={`Score ${game.score}`} />}
    >
      <p className="mb-4 font-display text-xl font-medium">{prompt}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {game.question.options.map((option: string, i: number) => {
          const isAnswer = game.answer === i;
          const isGuess = game.guess === i;
          let tone = "border-line bg-surface hover:border-ink";
          if (game.revealed && isAnswer) tone = "border-teal bg-teal-soft";
          else if (game.revealed && isGuess) tone = "border-coral bg-coral-soft";
          else if (isSubject && isAnswer) tone = "border-ink bg-surface";
          return (
            <button
              key={`${game.question.id}-${i}`}
              disabled={!canPick || busy}
              onClick={() => run({ type: actionType, option: i })}
              className={`flex min-h-14 items-center justify-between gap-2 rounded-md border-2 px-4 py-3 text-left font-semibold transition-colors disabled:cursor-default ${tone}`}
            >
              {option}
              {game.revealed && isAnswer && <Icon name="check" label="Their answer" />}
              {game.revealed && isGuess && !isAnswer && <Icon name="close" label="The guess" />}
            </button>
          );
        })}
      </div>
      <div className="mt-4 min-h-12">
        {isSubject && game.answered && !game.revealed && <Waiting>{partnerName} is guessing</Waiting>}
        {!isSubject && !game.answered && <Waiting>{partnerName} is answering first</Waiting>}
        {game.revealed && (
          <div className="flex flex-wrap items-center justify-between gap-3 animate-rise">
            <p className="font-semibold">{game.guess === game.answer ? "In sync." : "Not quite. Now you know."}</p>
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
