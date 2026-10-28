/**
 * Light, transparent checks on chat messages. Nothing is blocked automatically:
 * unkind messages are flagged so moderators can see patterns in counts, and the
 * sender gets a gentle nudge. Sharing contact details early gets a safety tip.
 */
const UNKIND = [
  "idiot", "stupid", "ugly", "loser", "shut up", "kill yourself", "kys", "send nudes", "nudes",
  "slut", "whore", "bitch", "bastard", "retard", "fat pig", "nobody likes you", "worthless",
];

const PHONE = /(?:\+?\d[\s-]?){10,}/;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;

export function checkMessage(body: string): { flagged: boolean; tip: string | null } {
  const text = body.toLowerCase();
  const flagged = UNKIND.some((word) => new RegExp(`(^|\\W)${word.replace(/ /g, "\\s+")}($|\\W)`).test(text));
  const tip = PHONE.test(body) || EMAIL.test(body) ? "Tip: take your time before sharing a number or email. You can keep chatting here as long as you like." : null;
  return { flagged, tip };
}
