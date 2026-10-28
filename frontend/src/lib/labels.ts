/** Friendly words for stored values, shared by profile views, filters and forms. */
export const INTENT_LABELS: Record<string, string> = {
  "long-term": "A long-term relationship",
  "long-term-open": "Long-term, open to short",
  "short-term-fun": "Something fun for now",
  "new-friends": "New friends",
  "not-sure": "Still figuring it out",
};
export const INTENT_SHORT: Record<string, string> = {
  "long-term": "Long-term",
  "long-term-open": "Long-term, open",
  "short-term-fun": "Fun for now",
  "new-friends": "Friends",
  "not-sure": "Figuring it out",
};
export const GENDER_LABELS: Record<string, string> = { woman: "Woman", man: "Man", "non-binary": "Non-binary", "prefer-not": "Prefer not to say" };
export const LOOKING_LABELS: Record<string, string> = { women: "Women", men: "Men", everyone: "Everyone" };
export const LOVE_LABELS: Record<string, string> = { words: "Kind words", time: "Quality time", gifts: "Thoughtful gifts", acts: "Acts of service", touch: "Physical touch" };
export const PERSONALITY_LABELS: Record<string, string> = { introvert: "Introvert", ambivert: "Ambivert", extrovert: "Extrovert" };

export const LIFESTYLE_OPTIONS: Record<string, { label: string; options: Record<string, string> }> = {
  drinking: { label: "Drinking", options: { never: "Never", socially: "Socially", often: "Often" } },
  smoking: { label: "Smoking", options: { never: "Never", socially: "Socially", regularly: "Regularly" } },
  workout: { label: "Workout", options: { never: "Never", sometimes: "Sometimes", often: "Often", daily: "Daily" } },
  pets: { label: "Pets", options: { none: "No pets", dog: "Dog person", cat: "Cat person", other: "Other pets", "want-one": "Want one" } },
  kids: { label: "Kids", options: { want: "Want kids", "dont-want": "Do not want kids", have: "Have kids", open: "Open to it" } },
  sleep: { label: "Sleep", options: { "early-bird": "Early bird", "night-owl": "Night owl", depends: "Depends on the day" } },
  diet: { label: "Diet", options: { anything: "Eats anything", vegetarian: "Vegetarian", vegan: "Vegan", eggetarian: "Eggetarian", other: "Other" } },
};

export const STAR_SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
export const LANGUAGES = ["English", "Hindi", "Bengali", "Marathi", "Tamil", "Telugu", "Gujarati", "Kannada", "Malayalam", "Punjabi", "Urdu", "Spanish", "French"];

export const VISIBILITY_LABELS: Record<string, { label: string; hint: string }> = {
  everyone: { label: "Everyone", hint: "Anyone who finds you" },
  connections: { label: "Connections", hint: "After you both connect" },
  spark: { label: "Spark bond", hint: "Bond level 2 and up" },
  orbit: { label: "Orbit bond", hint: "Bond level 3 and up" },
  private: { label: "Only me", hint: "Never shown" },
};
export const SECTION_LABELS: Record<string, { label: string; hint: string }> = {
  basics: { label: "Basics", hint: "Age, city, height, languages, star sign" },
  about: { label: "About", hint: "Bio, love language, social energy" },
  prompts: { label: "Prompts", hint: "Your prompt answers" },
  lifestyle: { label: "Lifestyle", hint: "Drinking, workout, pets, kids, sleep, diet" },
  work: { label: "Work and study", hint: "Job and education" },
  socials: { label: "Socials", hint: "Your handle elsewhere" },
};

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function timeAgo(sqlDate: string, now = Date.now()) {
  const t = Date.parse(sqlDate.includes("T") ? sqlDate : sqlDate.replace(" ", "T") + "Z");
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
