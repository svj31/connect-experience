export interface Me {
  id: number;
  email: string;
  displayName: string;
  pronouns: string;
  bio: string;
  handle: string;
  interests: string[];
  avatarShape: AvatarShape;
  avatarColor: AvatarColor;
  createdAt: string;
}

export interface Partner {
  id: number;
  displayName: string;
  pronouns: string;
  interests: string[];
  avatarShape: AvatarShape;
  avatarColor: AvatarColor;
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
}

export interface ChatMessage {
  id: number;
  userId: number;
  body: string;
  createdAt: string;
}

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
}

export interface Snapshot {
  activity: ActivityId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  game: any;
  online: number[];
}

export const ACTIVITY_IDS = ["wyr", "insync", "ttl", "draw", "story", "constellation", "connect4", "memory", "watch"] as const;
export type ActivityId = (typeof ACTIVITY_IDS)[number];

export const AVATAR_SHAPES = ["circle", "square", "triangle", "diamond", "hexagon", "star"] as const;
export type AvatarShape = (typeof AVATAR_SHAPES)[number];
export const AVATAR_COLORS = ["coral", "teal", "sun", "ink", "leaf", "sky"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];

export const INTERESTS = [
  "music", "films", "books", "travel", "food", "art", "gaming", "fitness",
  "outdoors", "science", "tech", "fashion", "photography", "comedy", "pets", "writing",
] as const;

export const REACTIONS = ["heart", "laugh", "wow", "clap", "fire"] as const;
export type Reaction = (typeof REACTIONS)[number];
