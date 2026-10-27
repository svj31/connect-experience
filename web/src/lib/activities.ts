import type { ActivityId } from "./types";

export interface ActivityInfo {
  id: ActivityId;
  name: string;
  kind: "Question" | "Guessing" | "Create" | "Play" | "Hang out";
  short: string;
  long: string;
}

export const ACTIVITIES: ActivityInfo[] = [
  { id: "wyr", name: "Would You Rather", kind: "Question", short: "Pick in secret, reveal together.", long: "Five quick choices. You both pick without seeing the other, then the answers flip over at the same time." },
  { id: "insync", name: "In Sync", kind: "Guessing", short: "Guess how they answered about themselves.", long: "One of you answers a question about yourself. The other guesses. Then you swap." },
  { id: "ttl", name: "Two Truths and a Lie", kind: "Guessing", short: "Three facts, one is made up.", long: "Write two true things and one invention. Your partner tries to spot the lie." },
  { id: "draw", name: "Draw Together", kind: "Create", short: "One canvas, two pens.", long: "A shared canvas that updates live. Save what you make to your moments." },
  { id: "story", name: "Story Chain", kind: "Create", short: "Write a story one line at a time.", long: "Start from an opening line and take turns adding the next sentence." },
  { id: "constellation", name: "Constellation", kind: "Create", short: "Place stars in a shared 3D sky and name it.", long: "Tap the sky to place stars. Lines join them in the order you place them. Give your constellation a name to keep it." },
  { id: "connect4", name: "Connect Four", kind: "Play", short: "The classic, live, best of as many as you like.", long: "Take turns dropping discs. Four in a row wins the round." },
  { id: "memory", name: "Memory Match", kind: "Play", short: "Flip cards together and clear the board.", long: "Take turns flipping two cards. Find a pair and you go again. Clear the board as a team." },
  { id: "watch", name: "Watch Together", kind: "Hang out", short: "Synced YouTube with play and pause for both.", long: "Paste a YouTube link. Play, pause and seek stay in sync for both of you." },
];

export const activityById = (id: string) => ACTIVITIES.find((a) => a.id === id) ?? ACTIVITIES[0];
