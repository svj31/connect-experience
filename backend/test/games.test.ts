import { describe, expect, it } from "vitest";
import { connect4, findLine, type Connect4State } from "../src/games/connect4.js";
import { constellation } from "../src/games/constellation.js";
import { draw } from "../src/games/draw.js";
import { insync } from "../src/games/insync.js";
import { memory, MEMORY_SYMBOLS, type MemoryState } from "../src/games/memory.js";
import { story } from "../src/games/story.js";
import { ttl } from "../src/games/ttl.js";
import type { GameDef, GameResult } from "../src/games/types.js";
import { parseVideoId, watch, currentPosition } from "../src/games/watch.js";
import { wyr } from "../src/games/wyr.js";

const A = 1;
const B = 2;
const players: [number, number] = [A, B];

/** Applies an action and fails the test if the reducer rejected it. */
function ok<S>(game: GameDef<S>, state: S, user: number, action: unknown): { state: S; events?: unknown[] } {
  const result = game.reduce(state, user, action, players) as GameResult<S>;
  if ("error" in result) throw new Error(`unexpected error: ${result.error}`);
  return result;
}
function err<S>(game: GameDef<S>, state: S, user: number, action: unknown): string {
  const result = game.reduce(state, user, action, players);
  if (!("error" in result)) throw new Error("expected an error");
  return result.error;
}

describe("Would You Rather", () => {
  it("hides the partner's pick until both have picked", () => {
    let s = wyr.init(players);
    s = ok(wyr, s, A, { type: "pick", choice: "a" }).state;
    const bView = wyr.view(s, B) as { partnerPicked: boolean; partnerPick: unknown };
    expect(bView.partnerPicked).toBe(true);
    expect(bView.partnerPick).toBeNull();
    const result = ok(wyr, s, B, { type: "pick", choice: "a" });
    expect(result.events).toHaveLength(2);
    const view = wyr.view(result.state, B) as { revealed: boolean; partnerPick: string; agreed: number };
    expect(view.revealed).toBe(true);
    expect(view.partnerPick).toBe("a");
    expect(view.agreed).toBe(1);
  });

  it("rejects double picks, bad choices and early next", () => {
    let s = wyr.init(players);
    expect(err(wyr, s, A, { type: "pick", choice: "c" })).toMatch(/Choose/);
    expect(err(wyr, s, A, { type: "next" })).toMatch(/Both/);
    s = ok(wyr, s, A, { type: "pick", choice: "b" }).state;
    expect(err(wyr, s, A, { type: "pick", choice: "a" })).toMatch(/Already/);
    expect(err(wyr, s, A, null)).toMatch(/Choose|Unknown/);
  });

  it("finishes after five rounds with a moment", () => {
    let s = wyr.init(players);
    let events: unknown[] | undefined;
    for (let round = 0; round < 5; round++) {
      s = ok(wyr, s, A, { type: "pick", choice: "a" }).state;
      s = ok(wyr, s, B, { type: "pick", choice: round % 2 ? "a" : "b" }).state;
      ({ state: s, events } = ok(wyr, s, A, { type: "next" }));
    }
    expect(s.done).toBe(true);
    expect(events?.[0]).toMatchObject({ type: "moment", data: { agreed: 2, total: 5 } });
    expect(err(wyr, s, A, { type: "pick", choice: "a" })).toMatch(/finished/);
  });
});

describe("In Sync", () => {
  it("lets the subject answer and the partner guess, then swaps roles", () => {
    let s = insync.init(players);
    expect(err(insync, s, B, { type: "answer", option: 1 })).toMatch(/partner/);
    expect(err(insync, s, B, { type: "guess", option: 1 })).toMatch(/Wait/);
    s = ok(insync, s, A, { type: "answer", option: 2 }).state;
    expect((insync.view(s, B) as { answer: unknown }).answer).toBeNull();
    expect((insync.view(s, A) as { answer: unknown }).answer).toBe(2);
    expect(err(insync, s, A, { type: "guess", option: 2 })).toMatch(/guessed/);
    s = ok(insync, s, B, { type: "guess", option: 2 }).state;
    expect(s.score).toBe(1);
    s = ok(insync, s, A, { type: "next" }).state;
    expect(s.subject).toBe(B);
  });

  it("validates option range", () => {
    const s = insync.init(players);
    expect(err(insync, s, A, { type: "answer", option: 4 })).toMatch(/options/);
    expect(err(insync, s, A, { type: "answer", option: 1.5 })).toMatch(/options/);
  });
});

describe("Two Truths and a Lie", () => {
  const statements = ["I have climbed a volcano", "I can juggle", "I have met a famous chef"];

  it("hides the lie from the guesser until they guess", () => {
    let s = ttl.init(players);
    expect(err(ttl, s, B, { type: "submit", statements, lie: 1 })).toMatch(/partner/);
    s = ok(ttl, s, A, { type: "submit", statements, lie: 1 }).state;
    expect((ttl.view(s, B) as { lie: unknown }).lie).toBeNull();
    s = ok(ttl, s, B, { type: "guess", index: 1 }).state;
    expect(s.score).toBe(1);
    expect((ttl.view(s, B) as { lie: number }).lie).toBe(1);
  });

  it("validates statements", () => {
    const s = ttl.init(players);
    expect(err(ttl, s, A, { type: "submit", statements: ["a", "b"], lie: 0 })).toMatch(/three/);
    expect(err(ttl, s, A, { type: "submit", statements: ["ok one", "no", "ok three"], lie: 0 })).toMatch(/3 to 120/);
    expect(err(ttl, s, A, { type: "submit", statements, lie: 3 })).toMatch(/lie/);
  });
});

describe("Draw Together", () => {
  it("adds strokes, clamps coordinates and only undoes your own stroke", () => {
    let s = draw.init(players);
    s = ok(draw, s, A, { type: "stroke", color: "#c2452d", size: 99, points: [[0.1, 0.2], [1.5, -3]] }).state;
    s = ok(draw, s, B, { type: "stroke", color: "not-a-color", points: [[0.5, 0.5]] }).state;
    expect(s.strokes[0].points[1]).toEqual([1, 0]);
    expect(s.strokes[0].size).toBe(24);
    expect(s.strokes[1].color).toBe("#1f1d1a");
    s = ok(draw, s, A, { type: "undo" }).state;
    expect(s.strokes.map((x) => x.uid)).toEqual([B]);
    expect(err(draw, s, A, { type: "undo" })).toMatch(/Nothing/);
  });

  it("rejects malformed points and saves a moment", () => {
    const s = draw.init(players);
    expect(err(draw, s, A, { type: "stroke", points: [[0, "x"]] })).toMatch(/Bad/);
    expect(err(draw, s, A, { type: "stroke", points: [] })).toMatch(/Bad/);
    expect(err(draw, s, A, { type: "save" })).toMatch(/Draw/);
    const drawn = ok(draw, s, A, { type: "stroke", points: [[0, 0]] }).state;
    expect(ok(draw, drawn, B, { type: "save" }).events?.[0]).toMatchObject({ type: "moment" });
  });
});

describe("Story Chain", () => {
  it("alternates turns and finishes at the line limit", () => {
    let s = story.init(players, () => 0);
    expect(err(story, s, B, { type: "add", text: "Hello there" })).toMatch(/turn/);
    for (let i = 0; i < 9; i++) s = ok(story, s, i % 2 ? B : A, { type: "add", text: `Line ${i}` }).state;
    expect(s.done).toBe(false);
    const last = ok(story, s, B, { type: "add", text: "The end" });
    expect(last.state.done).toBe(true);
    expect(last.events?.[0]).toMatchObject({ type: "moment" });
  });

  it("needs two lines before finishing early", () => {
    const s = story.init(players);
    expect(err(story, s, A, { type: "finish" })).toMatch(/two lines/);
    expect(err(story, s, A, { type: "add", text: "x" })).toMatch(/2 to 160/);
  });
});

describe("Constellation", () => {
  it("places stars inside bounds and names the sky", () => {
    let s = constellation.init(players);
    expect(err(constellation, s, A, { type: "place", x: 2, y: 0, z: 0 })).toMatch(/Bad/);
    for (let i = 0; i < 3; i++) s = ok(constellation, s, i % 2 ? B : A, { type: "place", x: 0.1 * i, y: 0, z: -0.5 }).state;
    expect(err(constellation, s, A, { type: "name", name: "x" })).toMatch(/2 to 40/);
    const named = ok(constellation, s, B, { type: "name", name: "The Kite" });
    expect(named.state.done).toBe(true);
    expect(named.events?.[0]).toMatchObject({ title: 'Constellation named "The Kite"' });
    expect(err(constellation, named.state, A, { type: "place", x: 0, y: 0, z: 0 })).toMatch(/named/);
    expect(ok(constellation, named.state, A, { type: "reset" }).state.stars).toHaveLength(0);
  });

  it("needs three stars to name", () => {
    const s = constellation.init(players);
    expect(err(constellation, s, A, { type: "name", name: "Nope" })).toMatch(/three/);
  });
});

describe("Connect Four", () => {
  it("detects horizontal, vertical and diagonal lines", () => {
    const board = Array.from({ length: 6 }, () => Array(7).fill(0));
    board[5][0] = board[5][1] = board[5][2] = board[5][3] = 1;
    expect(findLine(board, 5, 2)).toHaveLength(4);
    const diag = Array.from({ length: 6 }, () => Array(7).fill(0));
    diag[5][0] = diag[4][1] = diag[3][2] = diag[2][3] = 2;
    expect(findLine(diag, 3, 2)).toHaveLength(4);
    const none = Array.from({ length: 6 }, () => Array(7).fill(0));
    none[5][0] = none[5][1] = none[5][2] = 1;
    expect(findLine(none, 5, 0)).toBeNull();
  });

  it("enforces turns, wins vertically and supports rematch", () => {
    let s: Connect4State = connect4.init(players);
    expect(err(connect4, s, B, { type: "drop", col: 0 })).toMatch(/turn/);
    for (let i = 0; i < 3; i++) {
      s = ok(connect4, s, A, { type: "drop", col: 0 }).state;
      s = ok(connect4, s, B, { type: "drop", col: 1 }).state;
    }
    const win = ok(connect4, s, A, { type: "drop", col: 0 });
    expect(win.state.winner).toBe(A);
    expect(win.state.wins[A]).toBe(1);
    expect(err(connect4, win.state, B, { type: "drop", col: 2 })).toMatch(/over/);
    const again = ok(connect4, win.state, B, { type: "rematch" }).state;
    expect(again.turn).toBe(B);
    expect(again.board.flat().every((c) => c === 0)).toBe(true);
  });

  it("rejects full columns", () => {
    let s = connect4.init(players);
    for (let i = 0; i < 6; i++) s = ok(connect4, s, i % 2 ? B : A, { type: "drop", col: 3 }).state;
    expect(err(connect4, s, A, { type: "drop", col: 3 })).toMatch(/full/);
    expect(err(connect4, s, A, { type: "drop", col: 7 })).toMatch(/Bad/);
  });
});

describe("Memory Match", () => {
  const fixed = (): MemoryState => {
    const deck = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS];
    return { ...memory.init(players), deck, matched: deck.map(() => false) };
  };

  it("keeps the turn on a match and passes it on a miss", () => {
    let s = fixed();
    s = ok(memory, s, A, { type: "flip", index: 0 }).state;
    s = ok(memory, s, A, { type: "flip", index: 8 }).state;
    expect(s.pairs).toBe(1);
    expect(s.turn).toBe(A);
    s = ok(memory, s, A, { type: "flip", index: 1 }).state;
    s = ok(memory, s, A, { type: "flip", index: 2 }).state;
    expect(s.turn).toBe(B);
    const view = memory.view(s, B) as { cards: { symbol: string | null }[] };
    expect(view.cards[1].symbol).toBe(MEMORY_SYMBOLS[1]);
    expect(view.cards[3].symbol).toBeNull();
    s = ok(memory, s, B, { type: "flip", index: 3 }).state;
    expect(s.open).toEqual([3]);
  });

  it("finishes when all pairs are found", () => {
    let s = fixed();
    let events: unknown[] | undefined;
    for (let i = 0; i < 8; i++) {
      s = ok(memory, s, A, { type: "flip", index: i }).state;
      ({ state: s, events } = ok(memory, s, A, { type: "flip", index: i + 8 }));
    }
    expect(s.done).toBe(true);
    expect(events?.[0]).toMatchObject({ type: "moment" });
    expect(err(memory, s, A, { type: "flip", index: 0 })).toMatch(/All pairs/);
  });

  it("rejects flipping a matched card or out of turn", () => {
    let s = fixed();
    expect(err(memory, s, B, { type: "flip", index: 0 })).toMatch(/partner/);
    s = ok(memory, s, A, { type: "flip", index: 0 }).state;
    expect(err(memory, s, A, { type: "flip", index: 0 })).toMatch(/already/);
  });
});

describe("Watch Together", () => {
  it("parses YouTube ids and URLs", () => {
    expect(parseVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10")).toBe("dQw4w9WgXcQ");
    expect(parseVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseVideoId("https://evil.example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseVideoId("hello")).toBeNull();
  });

  it("tracks play, pause and seek", () => {
    let s = watch.init(players);
    expect(err(watch, s, A, { type: "play" })).toMatch(/Load/);
    s = ok(watch, s, A, { type: "load", url: "https://youtu.be/dQw4w9WgXcQ" }).state;
    s = ok(watch, s, B, { type: "play", position: 10 }).state;
    expect(s.playing).toBe(true);
    expect(currentPosition(s, s.updatedAt + 5000)).toBeCloseTo(15);
    s = ok(watch, s, A, { type: "pause", position: 20 }).state;
    expect(currentPosition(s, s.updatedAt + 5000)).toBe(20);
    expect(err(watch, s, A, { type: "seek", position: -1 })).toMatch(/Bad/);
  });
});
