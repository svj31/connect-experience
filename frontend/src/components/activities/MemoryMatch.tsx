"use client";

import { Icon } from "../ui/Icon";
import { ActionError, Finished, Panel, Waiting, useAction, type ActivityProps } from "./shared";

export function MemoryMatch({ game, me, partnerName, act, restart }: ActivityProps) {
  const { run, error, busy } = useAction(act);
  const myTurn = game.turn === me;

  return (
    <Panel
      title="Memory Match"
      subtitle="Clear the board together. Find a pair and you go again."
      aside={<span className="text-sm text-muted">{game.pairs} of 8 pairs, {game.moves} moves</span>}
    >
      {game.done ? (
        <Finished title={`Cleared in ${game.moves} moves`} onAgain={restart} />
      ) : (
        <>
          <p className="mb-3 font-semibold" aria-live="polite">{myTurn ? "Your turn. Flip a card." : `${partnerName} is flipping`}</p>
          <div className="mx-auto grid max-w-md grid-cols-4 gap-2 sm:gap-3">
            {game.cards.map((card: { symbol: string | null; matched: boolean }, i: number) => {
              const faceUp = card.symbol !== null;
              return (
                <button
                  key={i}
                  disabled={!myTurn || busy || card.matched || game.open.includes(i)}
                  onClick={() => run({ type: "flip", index: i })}
                  aria-label={faceUp ? `Card ${i + 1}: ${card.symbol}` : `Card ${i + 1}, face down`}
                  className={`flex aspect-[3/4] items-center justify-center rounded-xl border-2 transition-all duration-300 ${
                    card.matched
                      ? "border-teal bg-teal-soft text-teal-dark"
                      : faceUp
                        ? "animate-pop border-ink bg-surface text-ink"
                        : "border-transparent bg-brand text-white enabled:hover:-translate-y-0.5"
                  }`}
                >
                  {faceUp ? <Icon name={card.symbol!} size={30} /> : <span className="h-3 w-3 rounded-full border-2 border-white/60" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
          {!myTurn && <div className="mt-4"><Waiting>Watch closely, it helps on your turn</Waiting></div>}
        </>
      )}
      <ActionError message={error} />
    </Panel>
  );
}
