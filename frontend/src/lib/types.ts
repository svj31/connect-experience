export const ACTIVITY_IDS = ["deeptalk", "wyr", "insync", "ttl", "draw", "story", "constellation", "connect4", "memory", "watch"] as const;
export type ActivityId = (typeof ACTIVITY_IDS)[number];

export const AVATAR_SHAPES = ["circle", "square", "triangle", "diamond", "hexagon", "star"] as const;
export type AvatarShape = (typeof AVATAR_SHAPES)[number];
export const AVATAR_COLORS = ["violet", "lilac", "rose", "plum", "peach", "mint", "sky", "sun", "coral", "teal", "leaf", "ink"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];
export const AVATAR_RINGS = ["none", "single", "double", "tilted"] as const;
export const AVATAR_PATTERNS = ["plain", "bands", "spots", "swirl", "craters"] as const;
export const AVATAR_FACES = ["smile", "grin", "wink", "calm", "shy", "none"] as const;

export interface AvatarConfig {
  /** Main photo URL, when the member added one. */
  photo?: string | null;
  shape: AvatarShape;
  color: AvatarColor;
  ring: (typeof AVATAR_RINGS)[number];
  pattern: (typeof AVATAR_PATTERNS)[number];
  face: (typeof AVATAR_FACES)[number];
}

export const INTERESTS = [
  "music", "films", "books", "travel", "food", "art", "gaming", "fitness",
  "outdoors", "science", "tech", "fashion", "photography", "comedy", "pets", "writing",
  "dance", "cooking", "coffee", "anime", "cricket", "football", "yoga", "poetry",
  "podcasts", "theatre", "astronomy", "volunteering", "startups", "board games",
] as const;

export type Visibility = "everyone" | "connections" | "spark" | "orbit" | "private";
export type PrivacySection = "basics" | "about" | "lifestyle" | "work" | "prompts" | "socials";
export type Privacy = Record<PrivacySection, Visibility> & { discoverable: boolean; showOnline: boolean; showVibe: boolean };
export interface Settings { theme: "light" | "dark" | "system"; cursor: boolean; motion: "full" | "reduced"; ageMin: number; ageMax: number; maxDistanceKm?: number }
export type Lifestyle = Partial<Record<"drinking" | "smoking" | "workout" | "pets" | "kids" | "sleep" | "diet", string>>;

/** A profile as the viewer may see it. Null fields are hidden by the owner's privacy choices. */
export interface Profile {
  id: number;
  displayName: string;
  pronouns: string;
  avatar: AvatarConfig;
  photos?: string[];
  avatarShape: AvatarShape;
  avatarColor: AvatarColor;
  interests: string[];
  intent: string;
  age: number | null;
  gender: string | null;
  city: string | null;
  heightCm: number | null;
  languages: string[] | null;
  starSign: string | null;
  bio: string | null;
  personality: string | null;
  loveLanguage: string | null;
  lifestyle: Lifestyle | null;
  job: string | null;
  education: string | null;
  prompts: { id: string; text: string; answer: string }[] | null;
  handle: string | null;
  locked: Partial<Record<PrivacySection, string>>;
  online?: boolean | null;
}

export interface Me extends Profile {
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended" | "banned";
  birthYear: number | null;
  lookingFor: string;
  quiz: Record<string, number>;
  rawPrompts: { id: string; answer: string }[];
  privacy: Privacy;
  settings: Settings;
  completeness: { percent: number; missing: string[] };
  createdAt: string;
}

export interface VibeSummary { score: number | null; reasons: string[]; sharedInterests: string[] }
export interface Vibe extends VibeSummary { parts: { key: string; label: string; score: number; weight: number }[] }

export interface PersonCard {
  id: number;
  displayName: string;
  pronouns: string;
  avatar: AvatarConfig;
  age: number | null;
  city: string | null;
  intent: string;
  interests: string[];
  bio: string | null;
  prompt: { id: string; text: string; answer: string } | null;
  online: boolean | null;
  photos?: string[];
  /** City to city distance from the viewer, when both cities are known. */
  distanceKm?: number | null;
  vibe: VibeSummary;
}

export interface Bond {
  level: number;
  name: string;
  points: number;
  nextName: string | null;
  toNext: number;
  progress: number;
  streak: number;
  breakdown: { label: string; points: number }[];
}

export interface BondLevel { level: number; name: string; min: number; unlock: string }

export interface Connection {
  id: number;
  status: "pending" | "accepted";
  outgoing: boolean;
  note: string;
  superLike?: boolean;
  roomCode: string | null;
  since: string;
  person: PersonCard;
  bond: Bond | null;
  lastMessage: { mine: boolean; body: string; at: string } | null;
}

export interface Suggestion { id: ActivityId; reason: string; score: number }
export interface WatchPick { id: string; title: string; mood: string; url: string }

export interface Partner {
  id: number;
  displayName: string;
  pronouns: string;
  interests: string[];
  avatarShape: AvatarShape;
  avatarColor: AvatarColor;
  avatar: Partial<AvatarConfig>;
  revealLevel: number;
  bio: string | null;
  handle: string | null;
}

export interface Room {
  code: string;
  title: string;
  topic: string;
  activity: ActivityId;
  isPublic: boolean;
  kind: "table" | "match" | "connection";
  locked: boolean;
  status: "open" | "paired" | "closed";
  hostId: number;
  guestId: number | null;
  createdAt: string;
}

export interface OpenRoom extends Room {
  host: { displayName: string; avatarShape: AvatarShape; avatarColor: AvatarColor; interests: string[] };
}

export interface RoomDetail {
  room: Room;
  partner: Partner | null;
  myRevealLevel: number;
  momentCount: number;
  revealThresholds: number[];
  bond: Bond | null;
  connectionId: number | null;
  vibe: number | null;
}

export interface ChatMessage { id: number; userId: number; body: string; createdAt: string }

export interface CommonGround {
  sharedInterests: string[];
  questionsCompared: number;
  questionsAgreed: number;
  agreementRate: number | null;
  agreedTopics: string[];
  sparks: string[];
}

export interface Moment {
  id: number;
  activity: ActivityId;
  title: string;
  data: Record<string, unknown>;
  createdAt: string;
  roomCode: string;
  partnerName: string | null;
  partnerId: number | null;
  favorite: boolean;
}

export interface Snapshot {
  activity: ActivityId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  game: any;
  online: number[];
}

export const REACTIONS = ["heart", "laugh", "wow", "clap", "fire"] as const;
export type Reaction = (typeof REACTIONS)[number];
