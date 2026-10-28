import { describe, expect, it } from "vitest";
import { computeBond, streakDays } from "../src/bond.js";
import { deeptalk } from "../src/games/deeptalk.js";
import { wyr } from "../src/games/wyr.js";
import { WOULD_YOU_RATHER } from "../src/content/questions.js";
import { checkMessage } from "../src/moderation.js";
import { canSee, completeness, effectiveStatus, profileFor } from "../src/people.js";
import { questionOfTheDay, suggestActivities, watchPicks } from "../src/personalize.js";
import { computeVibe, intentFit, mutualFit, type VibeProfile } from "../src/vibe.js";
import { userRow } from "./fixtures.js";

const base: VibeProfile = { interests: [], intent: "", quiz: {}, lifestyle: {}, personality: "", loveLanguage: "", city: "" };

describe("Vibe Match", () => {
  it("returns null until at least two parts can be compared", () => {
    expect(computeVibe(base, base).score).toBeNull();
    expect(computeVibe({ ...base, interests: ["music"] }, { ...base, interests: ["music"] }).score).toBeNull();
  });

  it("scores identical full profiles at 100 and explains why", () => {
    const p: VibeProfile = { interests: ["music", "films", "food"], intent: "long-term", quiz: { a: 1, b: 2 }, lifestyle: { sleep: "night-owl", drinking: "never" }, personality: "ambivert", loveLanguage: "time", city: "Mumbai" };
    const v = computeVibe(p, { ...p, city: "mumbai" });
    expect(v.score).toBe(100);
    expect(v.reasons).toContain("Two night owls");
    expect(v.reasons.some((r) => r.includes("music"))).toBe(true);
    expect(v.sharedInterests).toEqual(["music", "films", "food"]);
  });

  it("ranks a closer profile above a distant one", () => {
    const me: VibeProfile = { ...base, interests: ["music", "travel", "food"], intent: "long-term", lifestyle: { kids: "want" } };
    const close = computeVibe(me, { ...base, interests: ["music", "travel"], intent: "long-term", lifestyle: { kids: "want" } }).score!;
    const far = computeVibe(me, { ...base, interests: ["gaming"], intent: "short-term-fun", lifestyle: { kids: "dont-want" } }).score!;
    expect(close).toBeGreaterThan(far);
    expect(far).toBeLessThan(30);
  });

  it("treats intent pairs sensibly", () => {
    expect(intentFit("long-term", "long-term")).toBe(1);
    expect(intentFit("long-term", "short-term-fun")).toBeLessThan(intentFit("long-term", "long-term-open"));
    expect(intentFit("new-friends", "long-term")).toBeLessThan(0.5);
  });

  it("only pairs people who would both want to see each other", () => {
    expect(mutualFit({ gender: "woman", lookingFor: "men" }, { gender: "man", lookingFor: "women" })).toBe(true);
    expect(mutualFit({ gender: "woman", lookingFor: "men" }, { gender: "man", lookingFor: "men" })).toBe(false);
    expect(mutualFit({ gender: "non-binary", lookingFor: "everyone" }, { gender: "man", lookingFor: "everyone" })).toBe(true);
    expect(mutualFit({ gender: "", lookingFor: "everyone" }, { gender: "man", lookingFor: "women" })).toBe(true);
  });
});

describe("Bond", () => {
  const today = new Date("2026-10-28T12:00:00Z");

  it("counts a streak ending today or yesterday", () => {
    expect(streakDays(["2026-10-28", "2026-10-27", "2026-10-26"], today)).toBe(3);
    expect(streakDays(["2026-10-27", "2026-10-26"], today)).toBe(2);
    expect(streakDays(["2026-10-25"], today)).toBe(0);
    expect(streakDays([], today)).toBe(0);
  });

  it("levels up from real activity and shows how far to the next level", () => {
    const start = computeBond({ moments: 0, messages: 0, answers: 0, activeDays: [] }, today);
    expect(start).toMatchObject({ level: 1, name: "Stardust", nextName: "Spark", toNext: 30 });
    const later = computeBond({ moments: 5, messages: 40, answers: 10, activeDays: ["2026-10-28", "2026-10-27"] }, today);
    // 60 + 20 + 40 + 12 = 132
    expect(later).toMatchObject({ points: 132, level: 3, name: "Orbit", streak: 2, toNext: 68 });
    expect(later.breakdown.reduce((s, b) => s + b.points, 0)).toBe(132);
  });

  it("caps message points so spam cannot buy a bond", () => {
    expect(computeBond({ moments: 0, messages: 5000, answers: 0, activeDays: [] }).points).toBe(200);
  });
});

describe("privacy", () => {
  const row = userRow({
    bio: "Hello", job: "Designer", handle: "@me", birth_year: 2000, lifestyle: '{"drinking":"never"}',
    privacy: JSON.stringify({ basics: "everyone", about: "everyone", prompts: "everyone", lifestyle: "connections", work: "spark", socials: "orbit", discoverable: true, showOnline: true, showVibe: true }),
  });

  it("maps visibility to bond levels", () => {
    expect(canSee("everyone", { self: false, connected: false, bondLevel: 0 })).toBe(true);
    expect(canSee("connections", { self: false, connected: false, bondLevel: 0 })).toBe(false);
    expect(canSee("spark", { self: false, connected: true, bondLevel: 1 })).toBe(false);
    expect(canSee("spark", { self: false, connected: true, bondLevel: 2 })).toBe(true);
    expect(canSee("private", { self: false, connected: true, bondLevel: 5 })).toBe(false);
    expect(canSee("private", { self: true, connected: true, bondLevel: 5 })).toBe(true);
  });

  it("hides sections from strangers and says what unlocks them", () => {
    const stranger = profileFor(row, { self: false, connected: false, bondLevel: 0 });
    expect(stranger).toMatchObject({ bio: "Hello", lifestyle: null, job: null, handle: null });
    expect(stranger.locked).toEqual({ lifestyle: "Unlocks when you connect", work: "Unlocks at Spark bond", socials: "Unlocks at Orbit bond" });
    expect(stranger).not.toHaveProperty("email");
    const close = profileFor(row, { self: false, connected: true, bondLevel: 3 });
    expect(close).toMatchObject({ job: "Designer", handle: "@me", lifestyle: { drinking: "never" } });
  });

  it("ends suspensions on their own", () => {
    expect(effectiveStatus(userRow({ status: "suspended", suspended_until: "2000-01-01 00:00:00" }))).toBe("active");
    expect(effectiveStatus(userRow({ status: "suspended", suspended_until: "2999-01-01 00:00:00" }))).toBe("suspended");
    expect(effectiveStatus(userRow({ status: "banned" }))).toBe("banned");
  });

  it("lists what a profile is missing", () => {
    const c = completeness(userRow());
    expect(c.percent).toBe(0);
    expect(c.missing).toContain("The Vibe Quiz");
  });
});

describe("personalisation", () => {
  it("puts activities two people share interests in first", () => {
    const list = suggestActivities({ interests: ["astronomy", "music"], intent: "long-term" }, { name: "Mira", interests: ["astronomy"], intent: "long-term" });
    expect(list[0]).toMatchObject({ id: "constellation", reason: "You both like astronomy" });
  });

  it("moves already played activities down", () => {
    const fresh = suggestActivities({ interests: ["gaming", "board games"], intent: "not-sure" });
    const tired = suggestActivities({ interests: ["gaming", "board games"], intent: "not-sure" }, undefined, { connect4: 5, memory: 5 });
    expect(fresh[0].id).toBe("connect4");
    expect(tired[0].id).not.toBe("connect4");
  });

  it("matches watch picks to interests and keeps a valid link", () => {
    const picks = watchPicks(["tech", "startups"], 2);
    expect(picks).toHaveLength(2);
    expect(picks[0].url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
  });

  it("gives everyone the same question on the same day", () => {
    const d = new Date("2026-10-28T08:00:00Z");
    expect(questionOfTheDay(d)).toBe(questionOfTheDay(new Date("2026-10-28T20:00:00Z")));
  });

  it("starts Would You Rather with questions about shared interests", () => {
    const state = wyr.init([1, 2], Math.random, { topics: ["astronomy"] });
    expect(WOULD_YOU_RATHER[state.order[0]].topic).toBe("astronomy");
  });
});

describe("Deep Talk", () => {
  const players: [number, number] = [1, 2];

  it("hides answers until both people answer, then gets deeper", () => {
    let s = deeptalk.init(players, () => 0.3);
    expect(deeptalk.view(s, 1)).toMatchObject({ round: 0, total: 6, card: { level: 1 } });
    let r = deeptalk.reduce(s, 1, { type: "answer", text: "Coffee" }, players);
    if ("error" in r) throw new Error(r.error);
    s = r.state;
    expect(deeptalk.view(s, 2)).toMatchObject({ partnerAnswered: true, partnerAnswer: null });
    expect("error" in deeptalk.reduce(s, 1, { type: "answer", text: "Again" }, players)).toBe(true);
    r = deeptalk.reduce(s, 2, { type: "answer", text: "Rain" }, players);
    if ("error" in r) throw new Error(r.error);
    expect(r.events).toHaveLength(2);
    expect(deeptalk.view(r.state, 1)).toMatchObject({ revealed: true, partnerAnswer: "Rain", myAnswer: "Coffee" });
    s = r.state;
    for (let round = 0; round < 6; round++) {
      if (round > 0) {
        for (const p of players) {
          const step = deeptalk.reduce(s, p, { type: "answer", text: "An answer" }, players);
          if ("error" in step) throw new Error(step.error);
          s = step.state;
        }
      }
      const next = deeptalk.reduce(s, 1, { type: "next" }, players);
      if ("error" in next) throw new Error(next.error);
      s = next.state;
      if (round === 5) expect(next.events?.[0]).toMatchObject({ type: "moment" });
    }
    expect(s.done).toBe(true);
    expect(deeptalk.init(players).order.map((i) => i)).toHaveLength(6);
  });

  it("rejects empty answers", () => {
    expect(deeptalk.reduce(deeptalk.init(players), 1, { type: "answer", text: " " }, players)).toEqual({ error: "Write 2 to 280 characters" });
  });
});

describe("chat checks", () => {
  it("flags unkind words but not innocent ones", () => {
    expect(checkMessage("you are so stupid").flagged).toBe(true);
    expect(checkMessage("Shut   up").flagged).toBe(true);
    expect(checkMessage("I studied in Sussex").flagged).toBe(false);
    expect(checkMessage("Great match today").flagged).toBe(false);
  });

  it("gives a tip when contact details are shared", () => {
    expect(checkMessage("call me on +91 98765 43210").tip).toMatch(/take your time/);
    expect(checkMessage("mail me a@b.co").tip).not.toBeNull();
    expect(checkMessage("see you at 5").tip).toBeNull();
  });
});
