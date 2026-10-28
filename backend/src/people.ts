import {
  DEFAULT_PRIVACY, DEFAULT_SETTINGS, PROMPTS, type LifestyleKey, type PrivacySection, type Visibility,
} from "./content/profile.js";
import type { UserRow } from "./repo.js";
import type { VibeProfile } from "./vibe.js";

export interface AvatarConfig {
  shape: string;
  color: string;
  ring: string;
  pattern: string;
  face: string;
}

export type Privacy = typeof DEFAULT_PRIVACY;
export type Settings = typeof DEFAULT_SETTINGS;

const parse = <T>(json: string | null | undefined, fallback: T): T => {
  try {
    return json ? { ...fallback, ...JSON.parse(json) } : fallback;
  } catch {
    return fallback;
  }
};
const parseList = <T>(json: string | null | undefined): T[] => {
  try {
    const value = json ? JSON.parse(json) : [];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const privacyOf = (row: UserRow): Privacy => parse(row.privacy, DEFAULT_PRIVACY);
export const settingsOf = (row: UserRow): Settings => parse(row.settings, DEFAULT_SETTINGS);
export const interestsOf = (row: UserRow) => parseList<string>(row.interests);
export const lifestyleOf = (row: UserRow) => parse<Partial<Record<LifestyleKey, string>>>(row.lifestyle, {});
export const quizOf = (row: UserRow) => parse<Record<string, number>>(row.quiz, {});
export const promptsOf = (row: UserRow) =>
  parseList<{ id: string; answer: string }>(row.prompts)
    .map((p) => ({ id: p.id, text: PROMPTS.find((x) => x.id === p.id)?.text ?? "", answer: p.answer }))
    .filter((p) => p.text && p.answer);

export function avatarOf(row: UserRow): AvatarConfig {
  const extra = parse<Partial<AvatarConfig>>(row.avatar, {});
  return {
    shape: row.avatar_shape,
    color: row.avatar_color,
    ring: extra.ring ?? "single",
    pattern: extra.pattern ?? "plain",
    face: extra.face ?? "smile",
  };
}

export function ageOf(row: UserRow, now = new Date()): number | null {
  return row.birth_year ? now.getUTCFullYear() - row.birth_year : null;
}

/** Suspensions end on their own. Anything past its end date counts as active again. */
export function effectiveStatus(row: UserRow, now = Date.now()): "active" | "suspended" | "banned" {
  if (row.status === "banned") return "banned";
  if (row.status === "suspended" && row.suspended_until && Date.parse(row.suspended_until + "Z") > now) return "suspended";
  return "active";
}

export function vibeProfile(row: UserRow): VibeProfile {
  return {
    interests: interestsOf(row),
    intent: row.intent,
    quiz: quizOf(row),
    lifestyle: lifestyleOf(row),
    personality: row.personality,
    loveLanguage: row.love_language,
    city: row.city,
  };
}

/** How the viewer relates to the person whose profile they are looking at. */
export interface Access {
  self: boolean;
  connected: boolean;
  bondLevel: number;
}

export function canSee(visibility: Visibility, access: Access): boolean {
  if (access.self) return true;
  switch (visibility) {
    case "everyone": return true;
    case "connections": return access.connected;
    case "spark": return access.connected && access.bondLevel >= 2;
    case "orbit": return access.connected && access.bondLevel >= 3;
    default: return false;
  }
}

/** Plain words for the lock badge shown in place of a hidden section. */
export const UNLOCK_HINT: Record<Visibility, string> = {
  everyone: "",
  connections: "Unlocks when you connect",
  spark: "Unlocks at Spark bond",
  orbit: "Unlocks at Orbit bond",
  private: "Kept private",
};

/**
 * A profile as one viewer is allowed to see it. Hidden sections are returned as
 * null with a hint, so the app can show what unlocks later instead of an empty gap.
 */
export function profileFor(row: UserRow, access: Access) {
  const privacy = privacyOf(row);
  const show = (section: PrivacySection) => canSee(privacy[section], access);
  const locked: Partial<Record<PrivacySection, string>> = {};
  for (const section of ["basics", "about", "lifestyle", "work", "prompts", "socials"] as PrivacySection[]) {
    if (!show(section)) locked[section] = UNLOCK_HINT[privacy[section]];
  }
  const basics = show("basics");
  const about = show("about");
  return {
    id: row.id,
    displayName: row.display_name,
    pronouns: row.pronouns,
    avatar: avatarOf(row),
    avatarShape: row.avatar_shape,
    avatarColor: row.avatar_color,
    interests: interestsOf(row),
    intent: row.intent,
    age: basics ? ageOf(row) : null,
    gender: basics ? row.gender : null,
    city: basics ? row.city : null,
    heightCm: basics ? row.height_cm : null,
    languages: basics ? parseList<string>(row.languages) : null,
    starSign: basics ? row.star_sign : null,
    bio: about ? row.bio : null,
    personality: about ? row.personality : null,
    loveLanguage: about ? row.love_language : null,
    lifestyle: show("lifestyle") ? lifestyleOf(row) : null,
    job: show("work") ? row.job : null,
    education: show("work") ? row.education : null,
    prompts: show("prompts") ? promptsOf(row) : null,
    handle: show("socials") ? row.handle : null,
    locked,
    showVibe: privacy.showVibe,
  };
}

/** What a profile is missing, so the app can nudge people to finish it. */
export function completeness(row: UserRow) {
  const checks: [string, boolean][] = [
    ["A short bio", row.bio.length >= 10],
    ["At least 3 interests", interestsOf(row).length >= 3],
    ["Your birth year", Boolean(row.birth_year)],
    ["Your city", Boolean(row.city)],
    ["What you are looking for", row.intent !== "not-sure" || Boolean(row.gender)],
    ["Two profile prompts", promptsOf(row).length >= 2],
    ["The Vibe Quiz", Object.keys(quizOf(row)).length >= 4],
    ["Lifestyle basics", Object.keys(lifestyleOf(row)).length >= 3],
    ["Love language", Boolean(row.love_language)],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  return { percent: Math.round((done / checks.length) * 100), missing: checks.filter(([, ok]) => !ok).map(([label]) => label) };
}

/** The signed in person's own full profile. */
export function selfProfile(row: UserRow) {
  return {
    ...profileFor(row, { self: true, connected: true, bondLevel: 5 }),
    email: row.email,
    role: row.role,
    status: effectiveStatus(row),
    birthYear: row.birth_year,
    lookingFor: row.looking_for,
    quiz: quizOf(row),
    rawPrompts: parseList<{ id: string; answer: string }>(row.prompts),
    privacy: privacyOf(row),
    settings: settingsOf(row),
    completeness: completeness(row),
    createdAt: row.created_at,
  };
}

/** A compact card for lists: Discover, connections, dashboards. */
export function cardFor(row: UserRow, access: Access, online: boolean) {
  const p = profileFor(row, access);
  const privacy = privacyOf(row);
  return {
    id: p.id,
    displayName: p.displayName,
    pronouns: p.pronouns,
    avatar: p.avatar,
    avatarShape: p.avatarShape,
    avatarColor: p.avatarColor,
    age: p.age,
    city: p.city,
    intent: p.intent,
    interests: p.interests,
    bio: p.bio,
    prompt: p.prompts?.[0] ?? null,
    online: privacy.showOnline ? online : null,
  };
}
