import { userRow } from "./fixtures.js";
import { describe, expect, it } from "vitest";
import { looksLikeBot, signSession, signSocketTicket, verifyToken } from "../src/auth.js";
import { computeCommonGround } from "../src/commonGround.js";
import { pickPartner, type QueueEntry } from "../src/matching.js";
import { defaultAvatar, makeRoomCode, revealedUser, type UserRow } from "../src/repo.js";
import { contactSchema, profileSchema, signupSchema } from "../src/validation.js";

describe("Common Ground", () => {
  const me = { id: 1, name: "Ava", interests: ["music", "food", "travel"] };
  const partner = { id: 2, name: "Rohan", interests: ["music", "gaming", "travel"] };

  it("is empty but honest before any answers", () => {
    const cg = computeCommonGround(me, partner, []);
    expect(cg.agreementRate).toBeNull();
    expect(cg.questionsCompared).toBe(0);
    expect(cg.sharedInterests).toEqual(["music", "travel"]);
    expect(cg.sparks.length).toBeGreaterThan(0);
  });

  it("counts agreement from real answers only", () => {
    const answers = [
      { game: "wyr", question_id: "wyr-01", user_id: 1, answer: "a" },
      { game: "wyr", question_id: "wyr-01", user_id: 2, answer: "a" },
      { game: "wyr", question_id: "wyr-02", user_id: 1, answer: "a" },
      { game: "wyr", question_id: "wyr-02", user_id: 2, answer: "b" },
      { game: "wyr", question_id: "wyr-03", user_id: 1, answer: "a" }, // partner never answered
      { game: "insync", question_id: "sync-01", user_id: 2, answer: "Sleeping in" },
    ];
    const cg = computeCommonGround(me, partner, answers);
    expect(cg.questionsCompared).toBe(2);
    expect(cg.questionsAgreed).toBe(1);
    expect(cg.agreementRate).toBe(0.5);
    expect(cg.agreedTopics).toEqual(["travel"]);
    expect(cg.sparks.some((s) => s.includes("Rohan chose"))).toBe(true);
    expect(cg.sparks.some((s) => s.includes("Sleeping in"))).toBe(true);
    expect(cg.sparks.length).toBeLessThanOrEqual(5);
    expect(cg.sparks.join(" ")).not.toMatch(/—/);
  });
});

describe("Matchmaking", () => {
  const entry = (userId: number, activity: string, interests: string[], joinedAt = userId): QueueEntry => ({
    userId, socketId: `s${userId}`, activity, interests, joinedAt,
  });

  it("prefers more shared interests, then earliest", () => {
    const seeker = entry(1, "wyr", ["music", "food"]);
    const queue = [entry(2, "wyr", ["gaming"]), entry(3, "wyr", ["music"], 10), entry(4, "wyr", ["food"], 5)];
    expect(pickPartner(seeker, queue, () => false)?.userId).toBe(4);
  });

  it("respects activity, any, self and blocks", () => {
    const seeker = entry(1, "draw", []);
    expect(pickPartner(seeker, [entry(2, "wyr", [])], () => false)).toBeNull();
    expect(pickPartner(seeker, [entry(2, "any", [])], () => false)?.userId).toBe(2);
    expect(pickPartner(seeker, [entry(1, "draw", [])], () => false)).toBeNull();
    expect(pickPartner(seeker, [entry(2, "draw", [])], () => true)).toBeNull();
  });
});

describe("Auth helpers", () => {
  it("signs and verifies tokens of the right kind only", () => {
    expect(verifyToken(signSession(7), "session")).toBe(7);
    expect(verifyToken(signSession(7), "socket")).toBeNull();
    expect(verifyToken(signSocketTicket(9), "socket")).toBe(9);
    expect(verifyToken("garbage", "session")).toBeNull();
  });

  it("flags honeypot and too fast forms", () => {
    const now = Date.now();
    expect(looksLikeBot({ website: "spam.example", startedAt: now - 10000 }, now)).toBe(true);
    expect(looksLikeBot({ startedAt: now - 100 }, now)).toBe(true);
    expect(looksLikeBot({}, now)).toBe(true);
    expect(looksLikeBot({ website: "", startedAt: now - 5000 }, now)).toBe(false);
  });
});

describe("Validation", () => {
  const base = { email: "a@b.co", password: "abc12345", displayName: "Ava", ageConfirmed: true, website: "", startedAt: 1 };

  it("enforces password strength, name charset and age", () => {
    expect(signupSchema.safeParse(base).success).toBe(true);
    expect(signupSchema.safeParse({ ...base, password: "abcdefgh" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, displayName: "<script>" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, ageConfirmed: false }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, website: "bot" }).success).toBe(false);
  });

  it("limits profile interests to the known list", () => {
    const profile = { displayName: "Ava", pronouns: "", bio: "", handle: "", interests: ["music"], avatarShape: "circle", avatarColor: "coral" };
    expect(profileSchema.safeParse(profile).success).toBe(true);
    expect(profileSchema.safeParse({ ...profile, interests: ["hacking"] }).success).toBe(false);
  });

  it("requires a real message on the contact form", () => {
    expect(contactSchema.safeParse({ name: "Ava", email: "a@b.co", topic: "other", message: "short", startedAt: 1 }).success).toBe(false);
  });
});

describe("Room helpers", () => {
  it("gives consecutive accounts different default avatars", () => {
    for (let id = 1; id < 50; id++) {
      const [s1, c1] = defaultAvatar(id);
      const [s2, c2] = defaultAvatar(id + 1);
      expect(s1).not.toBe(s2);
      expect(c1).not.toBe(c2);
    }
  });

  it("makes unambiguous 6 character codes", () => {
    for (let i = 0; i < 200; i++) expect(makeRoomCode()).toMatch(/^[A-HJKMNP-Z2-9]{6}$/);
  });

  it("reveals bio and handle only at the chosen level", () => {
    const row = userRow({ bio: "Hi", handle: "@ava" });
    expect(revealedUser(row, 0)).toMatchObject({ bio: null, handle: null });
    expect(revealedUser(row, 1)).toMatchObject({ bio: "Hi", handle: null });
    expect(revealedUser(row, 2)).toMatchObject({ bio: "Hi", handle: "@ava" });
    expect(revealedUser(row, 2)).not.toHaveProperty("email");
  });
});
