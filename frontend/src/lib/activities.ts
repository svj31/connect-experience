import type { ActivityId } from "./types";

export type Category = "talk" | "play" | "create" | "watch";

export interface ActivityInfo {
  id: ActivityId;
  name: string;
  category: Category;
  short: string;
  long: string;
  minutes: string;
}

export const CATEGORIES: { id: Category; name: string; blurb: string; icon: string }[] = [
  { id: "talk", name: "Talk", blurb: "Questions that get you past small talk", icon: "chat" },
  { id: "play", name: "Play", blurb: "Quick games, friendly rivalry", icon: "connect4" },
  { id: "create", name: "Create", blurb: "Make something only the two of you have", icon: "draw" },
  { id: "watch", name: "Watch", blurb: "Press play together, wherever you are", icon: "watch" },
];

export const ACTIVITIES: ActivityInfo[] = [
  { id: "deeptalk", name: "Deep Talk", category: "talk", minutes: "10 min", short: "Six cards, from easy to honest.", long: "Both answer each card in secret, then the answers turn over together. Each round goes a little deeper." },
  { id: "wyr", name: "Would You Rather", category: "talk", minutes: "3 min", short: "Pick in secret, reveal together.", long: "Five quick choices, picked with your shared interests in mind. See how often you agree." },
  { id: "insync", name: "In Sync", category: "talk", minutes: "5 min", short: "Guess how they answered.", long: "One of you answers a question about yourself. The other guesses. Then you swap." },
  { id: "ttl", name: "Two Truths and a Lie", category: "talk", minutes: "5 min", short: "Three facts, one is made up.", long: "Write two true things and one invention. Your partner tries to spot the lie." },
  { id: "connect4", name: "Connect Four", category: "play", minutes: "4 min", short: "Four in a row wins.", long: "Take turns dropping discs. Best of as many rounds as you like." },
  { id: "memory", name: "Memory Match", category: "play", minutes: "5 min", short: "Clear the board as a team.", long: "Take turns flipping two cards. Find a pair and go again." },
  { id: "draw", name: "Draw Together", category: "create", minutes: "Open", short: "One canvas, two pens.", long: "A shared canvas that updates live, with prompts picked for the two of you." },
  { id: "story", name: "Story Chain", category: "create", minutes: "8 min", short: "A story, one line each.", long: "Start from an opening line and take turns adding the next sentence." },
  { id: "constellation", name: "Constellation", category: "create", minutes: "5 min", short: "Build and name your own stars.", long: "Tap the 3D sky to place stars together, then give your constellation a name." },
  { id: "watch", name: "Watch Together", category: "watch", minutes: "Any", short: "Synced YouTube for two.", long: "Play, pause and seek stay in sync. We suggest picks from what you both like." },
];

export const activityById = (id: string) => ACTIVITIES.find((a) => a.id === id) ?? ACTIVITIES[0];
export const activitiesIn = (c: Category) => ACTIVITIES.filter((a) => a.category === c);
