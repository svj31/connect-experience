import { describe, expect, it } from "vitest";
import {
  normaliseRoomCode, validateContact, validateDisplayName, validateEmail, validatePassword, validateSignup, validateTableTitle,
} from "@/lib/validation";

describe("client validation mirrors the server rules", () => {
  it("checks email", () => {
    expect(validateEmail("")).toMatch(/Enter your email/);
    expect(validateEmail("nope")).toMatch(/valid/);
    expect(validateEmail("a@b.co")).toBeNull();
  });

  it("checks password strength", () => {
    expect(validatePassword("short1")).toMatch(/8/);
    expect(validatePassword("abcdefgh")).toMatch(/number/);
    expect(validatePassword("12345678")).toMatch(/letter/);
    expect(validatePassword("abc12345")).toBeNull();
  });

  it("checks display names", () => {
    expect(validateDisplayName("A")).toMatch(/2/);
    expect(validateDisplayName("<b>hi</b>")).toMatch(/letters/);
    expect(validateDisplayName("Zoë O'Neil")).toBeNull();
  });

  it("collects every signup error at once", () => {
    const errors = validateSignup({ email: "x", password: "y", displayName: "", ageConfirmed: false });
    expect(Object.keys(errors).sort()).toEqual(["ageConfirmed", "displayName", "email", "password"]);
    expect(validateSignup({ email: "a@b.co", password: "abc12345", displayName: "Ava", ageConfirmed: true })).toEqual({});
  });

  it("checks contact messages and table titles", () => {
    expect(validateContact({ name: "A", email: "bad", message: "short" })).toHaveProperty("message");
    expect(validateContact({ name: "Ava", email: "a@b.co", message: "This is long enough" })).toEqual({});
    expect(validateTableTitle("hi")).not.toBeNull();
    expect(validateTableTitle("Doodle with me")).toBeNull();
  });

  it("normalises room codes and rejects look alike characters", () => {
    expect(normaliseRoomCode(" k7mq2x ")).toBe("K7MQ2X");
    expect(normaliseRoomCode("K7-MQ-2X")).toBe("K7MQ2X");
    expect(normaliseRoomCode("K7MQ2O")).toBeNull();
    expect(normaliseRoomCode("ABC")).toBeNull();
  });
});
