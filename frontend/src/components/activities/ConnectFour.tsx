"use client";

import { Button } from "../ui/Button";
import { ActionError, Panel, Waiting, seatColor, useAction, type ActivityProps } from "./shared";

export function ConnectFour({ game, me, hostId, partnerName, act }: ActivityProps) {
  const { run, error, busy } = useAction(act);
  const board: number[][] = game.board;
  const over = Boolean(game.winner) || game.draw;
  const myTurn = game.turn === me && !over;
  const winning = new Set((game.line ?? []).map(([r, c]: [number, number]) => `${r}-${c}`));
  const partnerId = Object.keys(game.wins).map(Number).find((id) => id !== me);
  const myWins = game.wins[me] ?? 0;
  const theirWins = partnerId ? game.wins[partnerId] ?? 0 : 0;
  const partnerColor = me === hostId ? seatColor(-1, hostId) : seatColor(hostId, hostId);

  let status = myTurn ? "Your turn. Pick a column." : `${partnerName}'s turn`;
  if (game.winner === me) status = "You win this round.";
  else if (game.winner) status = `${partnerName} wins this round.`;
  else if (game.draw) status = "A draw.";

  return (
    <Panel
      title="Connect Four"
      subtitle={<span className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full" style={{ background: seatColor(me, hostId) }} /> You {myWins}
        <span className="mx-1 text-line-strong">|</span>
        <span className="inline-block h-3 w-3 rounded-full" style={{ background: partnerColor }} /> {partnerName} {theirWins}
      </span>}
    >
      <p className="mb-3 font-semibold" aria-live="polite">{status}</p>
      <div className="mx-auto w-full max-w-md rounded-lg bg-ink p-2 sm:p-3">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {board[0].map((_, col) => (
            <button
              key={col}
              disabled={!myTurn || busy || Boolean(board[0][col])}
              onClick={() => run({ type: "drop", col })}
              aria-label={`Drop in column ${col + 1}`}
              className="group flex flex-col gap-1.5 rounded-xl p-0.5 enabled:hover:bg-white/10 sm:gap-2"
            >
              {board.map((row, r) => {
                const cell = row[col];
                return (
                  <span
                    key={r}
                    className={`block aspect-square w-full rounded-full transition-all duration-300 ${winning.has(`${r}-${col}`) ? "ring-4 ring-sun" : ""}`}
                    style={{ background: cell ? seatColor(cell, hostId) : "var(--bg)" }}
                  />
                );
              })}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 min-h-12">
        {over ? (
          <Button onClick={() => run({ type: "rematch" })} loading={busy}>Rematch</Button>
        ) : (
          !myTurn && <Waiting>{partnerName} is thinking</Waiting>
        )}
      </div>
      <ActionError message={error} />
    </Panel>
  );
}
