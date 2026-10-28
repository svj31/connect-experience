import { LIFESTYLE, type LifestyleKey } from "./content/profile.js";

/** The parts of a profile Vibe Match reads. Missing answers are skipped, never guessed. */
export interface VibeProfile {
  interests: string[];
  intent: string;
  quiz: Record<string, number>;
  lifestyle: Partial<Record<LifestyleKey, string>>;
  personality: string;
  loveLanguage: string;
  city: string;
}

export interface VibePart {
  key: "interests" | "intent" | "quiz" | "lifestyle" | "personality" | "loveLanguage" | "city";
  label: string;
  /** 0 to 100 for this part alone. */
  score: number;
  weight: number;
}

export interface Vibe {
  /** 0 to 100, or null when the two profiles share too little to compare. */
  score: number | null;
  parts: VibePart[];
  reasons: string[];
  sharedInterests: string[];
}

const WEIGHTS: Record<VibePart["key"], number> = {
  interests: 30, intent: 20, quiz: 20, lifestyle: 15, personality: 5, loveLanguage: 5, city: 5,
};

const LABELS: Record<VibePart["key"], string> = {
  interests: "Shared interests",
  intent: "Looking for",
  quiz: "Vibe Quiz answers",
  lifestyle: "Lifestyle",
  personality: "Social energy",
  loveLanguage: "Love language",
  city: "Location",
};

const ROMANTIC = new Set(["long-term", "long-term-open", "short-term-fun"]);

export function intentFit(a: string, b: string): number {
  if (!a || !b) return 0.6;
  if (a === b) return 1;
  if (a === "not-sure" || b === "not-sure") return 0.6;
  const pair = new Set([a, b]);
  if (pair.has("long-term") && pair.has("long-term-open")) return 0.85;
  if (pair.has("long-term-open") && pair.has("short-term-fun")) return 0.6;
  if (pair.has("long-term") && pair.has("short-term-fun")) return 0.2;
  // Friendship against anything romantic.
  if (pair.has("new-friends") && [...pair].some((x) => ROMANTIC.has(x))) return 0.3;
  return 0.5;
}

/** Same answer is a full match, neighbouring options on an ordered scale are close. */
function lifestyleFit(key: LifestyleKey, a: string, b: string): number {
  if (a === b) return 1;
  if (key === "kids") {
    const pair = new Set([a, b]);
    if (pair.has("want") && pair.has("dont-want")) return 0;
    return pair.has("open") ? 0.7 : 0.4;
  }
  if (key === "pets" || key === "diet") return 0.5;
  const scale = LIFESTYLE[key] as readonly string[];
  const gap = Math.abs(scale.indexOf(a) - scale.indexOf(b));
  return gap === 1 ? 0.6 : 0.2;
}

function personalityFit(a: string, b: string) {
  if (a === b) return 1;
  if (a === "ambivert" || b === "ambivert") return 0.8;
  return 0.5;
}

/**
 * Vibe Match: how well two profiles line up, from 0 to 100, with every part shown.
 * A part only counts when both people answered it, and the weights are rescaled to
 * what is left, so a half finished profile is not punished or flattered.
 */
export function computeVibe(a: VibeProfile, b: VibeProfile): Vibe {
  const parts: VibePart[] = [];
  const reasons: string[] = [];
  const sharedInterests = a.interests.filter((i) => b.interests.includes(i));

  if (a.interests.length && b.interests.length) {
    const base = Math.min(a.interests.length, b.interests.length);
    // Three shared interests already reads as a strong overlap for most people.
    const fit = Math.min(1, sharedInterests.length / Math.min(3, base));
    parts.push(part("interests", fit));
    if (sharedInterests.length) reasons.push(`You both love ${listOf(sharedInterests.slice(0, 3))}`);
  }

  if (a.intent && b.intent) {
    const fit = intentFit(a.intent, b.intent);
    parts.push(part("intent", fit));
    if (fit >= 0.85) reasons.push("You want the same kind of connection");
  }

  const quizIds = Object.keys(a.quiz).filter((id) => b.quiz[id] !== undefined);
  if (quizIds.length) {
    const same = quizIds.filter((id) => a.quiz[id] === b.quiz[id]).length;
    parts.push(part("quiz", same / quizIds.length));
    if (same >= 2) reasons.push(`You answered ${same} of ${quizIds.length} Vibe Quiz questions the same way`);
  }

  const lifeKeys = (Object.keys(LIFESTYLE) as LifestyleKey[]).filter((k) => a.lifestyle[k] && b.lifestyle[k]);
  if (lifeKeys.length) {
    const total = lifeKeys.reduce((sum, k) => sum + lifestyleFit(k, a.lifestyle[k]!, b.lifestyle[k]!), 0);
    const fit = total / lifeKeys.length;
    parts.push(part("lifestyle", fit));
    if (a.lifestyle.sleep && a.lifestyle.sleep === b.lifestyle.sleep && a.lifestyle.sleep !== "depends") {
      reasons.push(a.lifestyle.sleep === "night-owl" ? "Two night owls" : "Two early birds");
    }
  }

  if (a.personality && b.personality) parts.push(part("personality", personalityFit(a.personality, b.personality)));

  if (a.loveLanguage && b.loveLanguage) {
    const same = a.loveLanguage === b.loveLanguage;
    parts.push(part("loveLanguage", same ? 1 : 0.5));
    if (same) reasons.push("Same love language");
  }

  if (a.city && b.city) {
    const same = a.city.trim().toLowerCase() === b.city.trim().toLowerCase();
    parts.push(part("city", same ? 1 : 0.4));
    if (same) reasons.push(`Both in ${b.city}`);
  }

  const weight = parts.reduce((sum, p) => sum + p.weight, 0);
  // Fewer than two comparable parts is not enough to say anything honest.
  const score = parts.length >= 2 && weight > 0 ? Math.round(parts.reduce((sum, p) => sum + p.score * p.weight, 0) / weight) : null;
  return { score, parts, reasons: reasons.slice(0, 4), sharedInterests };
}

function part(key: VibePart["key"], fit: number): VibePart {
  return { key, label: LABELS[key], score: Math.round(Math.max(0, Math.min(1, fit)) * 100), weight: WEIGHTS[key] };
}

function listOf(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Does `viewer` want to see someone of `gender`? Unset values never exclude anyone. */
export function wantsGender(lookingFor: string, gender: string) {
  if (!lookingFor || lookingFor === "everyone" || !gender) return true;
  return (lookingFor === "women" && gender === "woman") || (lookingFor === "men" && gender === "man");
}

/** Both people would want to see each other. Discover only shows mutual fits. */
export function mutualFit(a: { gender: string; lookingFor: string }, b: { gender: string; lookingFor: string }) {
  return wantsGender(a.lookingFor, b.gender) && wantsGender(b.lookingFor, a.gender);
}
