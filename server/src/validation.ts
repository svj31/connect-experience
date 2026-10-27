import { z } from "zod";
import { ACTIVITY_IDS } from "./games/index.js";

export const INTERESTS = [
  "music", "films", "books", "travel", "food", "art", "gaming", "fitness",
  "outdoors", "science", "tech", "fashion", "photography", "comedy", "pets", "writing",
] as const;
export const AVATAR_SHAPES = ["circle", "square", "triangle", "diamond", "hexagon", "star"] as const;
export const AVATAR_COLORS = ["coral", "teal", "sun", "ink", "leaf", "sky"] as const;
export const REPORT_REASONS = ["harassment", "inappropriate", "spam", "underage", "other"] as const;

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

export const profileSchema = z.object({
  displayName: trimmed(2, 32).regex(/^[\p{L}\p{N} .'-]+$/u, "Use letters, numbers and spaces"),
  pronouns: z.string().trim().max(24),
  bio: z.string().trim().max(280),
  handle: z.string().trim().max(60),
  interests: z.array(z.enum(INTERESTS)).max(8),
  avatarShape: z.enum(AVATAR_SHAPES),
  avatarColor: z.enum(AVATAR_COLORS),
});

export const createRoomSchema = z.object({
  title: trimmed(3, 60),
  topic: z.union([z.enum(INTERESTS), z.literal("")]).default(""),
  activity: z.enum(ACTIVITY_IDS),
  isPublic: z.boolean().default(true),
});

export const revealSchema = z.object({ level: z.number().int().min(0).max(2) });

export const blockSchema = z.object({ userId: z.number().int().positive() });

export const reportSchema = z.object({
  userId: z.number().int().positive(),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(500).default(""),
  roomCode: z.string().max(12).optional(),
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
