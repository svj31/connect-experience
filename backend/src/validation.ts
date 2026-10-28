import { z } from "zod";
import {
  AVATAR_COLORS, AVATAR_FACES, AVATAR_PATTERNS, AVATAR_RINGS, AVATAR_SHAPES, GENDERS, INTENTS, INTERESTS,
  LANGUAGES, LIFESTYLE, LOOKING_FOR, LOVE_LANGUAGES, PERSONALITIES, PROMPTS, QUIZ, STAR_SIGNS, VISIBILITY,
} from "./content/profile.js";
import { ACTIVITY_IDS } from "./games/index.js";

export { AVATAR_COLORS, AVATAR_SHAPES, INTERESTS };
export const REPORT_REASONS = ["harassment", "inappropriate", "spam", "fake-profile", "underage", "scam", "other"] as const;

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);

/** Fields every public form carries for bot protection. */
const botFields = {
  website: z.string().max(0, "Bot check failed").optional().default(""),
  startedAt: z.number().int().positive(),
};

export const signupSchema = z.object({
  email: z.email().max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password needs a letter")
    .regex(/[0-9]/, "Password needs a number"),
  displayName: trimmed(2, 32).regex(/^[\p{L}\p{N} .'-]+$/u, "Use letters, numbers and spaces"),
  ageConfirmed: z.literal(true, { error: "You must be 18 or older" }),
  ...botFields,
});

export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(128),
});

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) => z.union([z.enum(values), z.literal("")]).optional();
const thisYear = new Date().getUTCFullYear();

export const profileSchema = z.object({
  displayName: trimmed(2, 32).regex(/^[\p{L}\p{N} .'-]+$/u, "Use letters, numbers and spaces"),
  pronouns: z.string().trim().max(24),
  bio: z.string().trim().max(280),
  handle: z.string().trim().max(60),
  interests: z.array(z.enum(INTERESTS)).max(10),
  avatarShape: z.enum(AVATAR_SHAPES),
  avatarColor: z.enum(AVATAR_COLORS),
  // Everything below is optional so older clients and quick edits still work.
  avatar: z
    .object({ ring: z.enum(AVATAR_RINGS), pattern: z.enum(AVATAR_PATTERNS), face: z.enum(AVATAR_FACES) })
    .optional(),
  birthYear: z
    .number()
    .int()
    .min(thisYear - 100, "Check the year")
    .max(thisYear - 18, "You must be 18 or older")
    .nullable()
    .optional(),
  gender: optionalEnum(GENDERS),
  lookingFor: z.enum(LOOKING_FOR).optional(),
  intent: z.enum(INTENTS).optional(),
  city: z.string().trim().max(40).optional(),
  job: z.string().trim().max(60).optional(),
  education: z.string().trim().max(60).optional(),
  heightCm: z.number().int().min(120).max(230).nullable().optional(),
  starSign: optionalEnum(STAR_SIGNS),
  languages: z.array(z.enum(LANGUAGES)).max(6).optional(),
  lifestyle: z
    .object(Object.fromEntries(Object.entries(LIFESTYLE).map(([k, v]) => [k, z.enum(v as unknown as [string, ...string[]]).optional()])))
    .optional(),
  loveLanguage: optionalEnum(LOVE_LANGUAGES),
  personality: optionalEnum(PERSONALITIES),
  prompts: z
    .array(z.object({ id: z.enum(PROMPTS.map((p) => p.id) as [string, ...string[]]), answer: trimmed(2, 160) }))
    .max(3)
    .refine((list) => new Set(list.map((p) => p.id)).size === list.length, "Pick each prompt once")
    .optional(),
  // Photo URLs (https) or small uploaded JPEG/PNG/WebP data URLs, first one is the main photo.
  photos: z
    .array(
      z.string().max(400_000).refine((s) => /^https:\/\/[^\s]+$/.test(s) || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s), "Use an image upload or an https link"),
    )
    .max(6, "Up to 6 photos")
    .optional(),
  quiz: z
    .partialRecord(z.enum(QUIZ.map((q) => q.id) as [string, ...string[]]), z.number().int().min(0).max(3))
    .optional(),
});

const visibility = z.enum(VISIBILITY);
export const privacySchema = z.object({
  basics: visibility,
  about: visibility,
  lifestyle: visibility,
  work: visibility,
  prompts: visibility,
  socials: visibility,
  discoverable: z.boolean(),
  showOnline: z.boolean(),
  showVibe: z.boolean(),
});

export const settingsSchema = z
  .object({
    theme: z.enum(["light", "dark", "system"]),
    cursor: z.boolean(),
    motion: z.enum(["full", "reduced"]),
    ageMin: z.number().int().min(18).max(99),
    ageMax: z.number().int().min(18).max(99),
    maxDistanceKm: z.number().int().min(0).max(5000).default(0),
  })
  .refine((s) => s.ageMin <= s.ageMax, { message: "Minimum age must be below the maximum", path: ["ageMin"] });

export const adminSignupSchema = z.object({
  email: z.email().max(254),
  password: z
    .string()
    .min(10, "Admin passwords need at least 10 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password needs a letter")
    .regex(/[0-9]/, "Password needs a number"),
  displayName: trimmed(2, 32).regex(/^[\p{L}\p{N} .'-]+$/u, "Use letters, numbers and spaces"),
  inviteCode: z.string().trim().min(1, "Enter the invite code").max(64),
  ...botFields,
});

export const connectSchema = z.object({
  userId: z.number().int().positive(),
  note: z.string().trim().max(200).default(""),
});

export const peopleQuerySchema = z.object({
  minAge: z.coerce.number().int().min(18).max(99).optional(),
  maxAge: z.coerce.number().int().min(18).max(99).optional(),
  intent: z.enum(INTENTS).optional(),
  gender: z.enum(GENDERS).optional(),
  city: z.string().trim().max(40).optional(),
  interests: z
    .string()
    .max(400)
    .transform((v) => v.split(",").filter(Boolean))
    .pipe(z.array(z.enum(INTERESTS)))
    .optional(),
  minVibe: z.coerce.number().int().min(0).max(100).optional(),
  online: z.enum(["1", "true"]).optional(),
  sort: z.enum(["vibe", "recent", "active"]).default("vibe"),
  q: z.string().trim().max(40).optional(),
});

export const playSchema = z.object({ activity: z.enum(ACTIVITY_IDS) });

export const adminActionSchema = z.object({
  action: z.enum(["warn", "suspend", "ban", "reinstate"]),
  days: z.number().int().min(1).max(90).default(7),
  note: z.string().trim().max(500).default(""),
  reportId: z.number().int().positive().optional(),
});

export const reportUpdateSchema = z.object({
  status: z.enum(["open", "reviewing", "resolved", "dismissed"]),
  note: z.string().trim().max(500).default(""),
});

export const createRoomSchema = z.object({
  title: trimmed(3, 60),
  topic: z.union([z.enum(INTERESTS), z.literal("")]).default(""),
  activity: z.enum(ACTIVITY_IDS),
  isPublic: z.boolean().default(true),
  /** Locked tables stay on the chosen activity. Free tables let either person switch. */
  locked: z.boolean().default(false),
});

export const revealSchema = z.object({ level: z.number().int().min(0).max(2) });

export const blockSchema = z.object({ userId: z.number().int().positive() });

export const reportSchema = z.object({
  userId: z.number().int().positive(),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(500).default(""),
  roomCode: z.string().max(12).optional(),
  /** The reporter chose to attach the last messages of this conversation for review. */
  includeMessages: z.boolean().default(false),
});

export const contactSchema = z.object({
  name: trimmed(2, 60),
  email: z.email().max(254),
  topic: z.enum(["feedback", "safety", "privacy", "other"]),
  message: trimmed(10, 2000),
  ...botFields,
});

export const analyticsSchema = z.object({
  name: z.string().regex(/^[a-z_]{2,40}$/),
  path: z.string().max(200).regex(/^\/[\w\-/]*$/),
});

export const chatSchema = z.object({ body: trimmed(1, 500) });

/** Turns a zod error into a { field: message } map the web app can show inline. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export const swipeSchema = z.object({
  targetId: z.number().int().positive(),
  decision: z.enum(["like", "pass", "superlike"]),
  note: z.string().trim().max(200).default(""),
});
