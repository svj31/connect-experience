import type { UserRow } from "../src/repo.js";

/** A complete users row with sensible blanks, for pure unit tests. */
export function userRow(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: 1, email: "x@example.com", password_hash: "x", display_name: "Ava", pronouns: "", bio: "", handle: "",
    interests: "[]", avatar_shape: "circle", avatar_color: "violet", created_at: "2026-01-01 00:00:00",
    role: "user", status: "active", suspended_until: null, birth_year: null, gender: "", looking_for: "everyone",
    intent: "not-sure", city: "", job: "", education: "", height_cm: null, star_sign: "", languages: "[]",
    lifestyle: "{}", love_language: "", personality: "", prompts: "[]", quiz: "{}", avatar: "{}", privacy: "{}",
    settings: "{}", last_active_at: null, photos: "[]",
    ...overrides,
  };
}
