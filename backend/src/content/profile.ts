/**
 * Everything a profile can hold. The lists mirror what mainstream dating apps ask
 * (basics, lifestyle, prompts) and add a short Vibe Quiz that feeds Vibe Match.
 */

export const INTERESTS = [
  "music", "films", "books", "travel", "food", "art", "gaming", "fitness",
  "outdoors", "science", "tech", "fashion", "photography", "comedy", "pets", "writing",
  "dance", "cooking", "coffee", "anime", "cricket", "football", "yoga", "poetry",
  "podcasts", "theatre", "astronomy", "volunteering", "startups", "board games",
] as const;

export const GENDERS = ["woman", "man", "non-binary", "prefer-not"] as const;
export const LOOKING_FOR = ["women", "men", "everyone"] as const;
export const INTENTS = ["long-term", "long-term-open", "short-term-fun", "new-friends", "not-sure"] as const;
export const INTENT_LABELS: Record<(typeof INTENTS)[number], string> = {
  "long-term": "A long-term relationship",
  "long-term-open": "Long-term, open to short",
  "short-term-fun": "Something fun for now",
  "new-friends": "New friends",
  "not-sure": "Still figuring it out",
};

export const LIFESTYLE = {
  drinking: ["never", "socially", "often"],
  smoking: ["never", "socially", "regularly"],
  workout: ["never", "sometimes", "often", "daily"],
  pets: ["none", "dog", "cat", "other", "want-one"],
  kids: ["want", "dont-want", "have", "open"],
  sleep: ["early-bird", "night-owl", "depends"],
  diet: ["anything", "vegetarian", "vegan", "eggetarian", "other"],
} as const;
export type LifestyleKey = keyof typeof LIFESTYLE;

export const LOVE_LANGUAGES = ["words", "time", "gifts", "acts", "touch"] as const;
export const PERSONALITIES = ["introvert", "ambivert", "extrovert"] as const;
export const STAR_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;
export const LANGUAGES = ["English", "Hindi", "Bengali", "Marathi", "Tamil", "Telugu", "Gujarati", "Kannada", "Malayalam", "Punjabi", "Urdu", "Spanish", "French"] as const;

export const PROMPTS = [
  { id: "p-sunday", text: "A perfect Sunday looks like" },
  { id: "p-green", text: "My green flag is" },
  { id: "p-debate", text: "Let's debate this" },
  { id: "p-weird", text: "I'm weirdly good at" },
  { id: "p-first-date", text: "My ideal first date" },
  { id: "p-song", text: "The song I never skip" },
  { id: "p-travel", text: "A place I keep going back to" },
  { id: "p-learn", text: "Teach me something about" },
  { id: "p-together", text: "We'll get along if" },
  { id: "p-comfort", text: "My comfort food" },
  { id: "p-unpopular", text: "My unpopular opinion" },
  { id: "p-orbit", text: "Things that pull me into someone's orbit" },
] as const;

/** Each answer maps to a trait so two people's answers can be compared fairly. */
export const QUIZ = [
  { id: "q-weekend", text: "Your weekend energy", options: ["Stay in and recharge", "One plan, then home", "Out with people all day", "Wherever the day goes"] },
  { id: "q-plans", text: "Plans are", options: ["Made weeks ahead", "Made the same day", "A rough idea", "Made by someone else"] },
  { id: "q-conflict", text: "After a disagreement you", options: ["Talk it out right away", "Need a little space first", "Write it down, then talk", "Make a joke to break the ice"] },
  { id: "q-texting", text: "Texting style", options: ["All day, little and often", "A few long messages", "Voice notes please", "Better in person"] },
  { id: "q-date", text: "Best kind of date", options: ["Food crawl", "Something active", "Quiet cafe and talk", "A show or a gig"] },
  { id: "q-money", text: "A surprise bonus goes to", options: ["Savings", "A trip", "Something for home", "Treating friends"] },
] as const;

export const AVATAR_SHAPES = ["circle", "square", "triangle", "diamond", "hexagon", "star"] as const;
export const AVATAR_COLORS = ["violet", "lilac", "rose", "plum", "peach", "mint", "sky", "sun", "coral", "teal", "leaf", "ink"] as const;
export const AVATAR_RINGS = ["none", "single", "double", "tilted"] as const;
export const AVATAR_PATTERNS = ["plain", "bands", "spots", "swirl", "craters"] as const;
export const AVATAR_FACES = ["smile", "grin", "wink", "calm", "shy", "none"] as const;

/** What each part of a profile can be shared with. Bond levels are 1 to 5. */
export const VISIBILITY = ["everyone", "connections", "spark", "orbit", "private"] as const;
export type Visibility = (typeof VISIBILITY)[number];
export const PRIVACY_SECTIONS = ["basics", "about", "lifestyle", "work", "prompts", "socials"] as const;
export type PrivacySection = (typeof PRIVACY_SECTIONS)[number];

export const DEFAULT_PRIVACY: Record<PrivacySection, Visibility> & {
  discoverable: boolean;
  showOnline: boolean;
  showVibe: boolean;
} = {
  basics: "everyone",
  about: "everyone",
  prompts: "everyone",
  lifestyle: "connections",
  work: "spark",
  socials: "orbit",
  discoverable: true,
  showOnline: true,
  showVibe: true,
};

export const DEFAULT_SETTINGS = {
  theme: "system" as "light" | "dark" | "system",
  cursor: true,
  motion: "full" as "full" | "reduced",
  ageMin: 18,
  ageMax: 45,
};
