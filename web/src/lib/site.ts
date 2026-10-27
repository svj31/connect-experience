export const SITE = {
  name: "Overlap",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  tagline: "Meet over something you both enjoy",
  description:
    "Overlap is a dating and social app where you meet by doing things together: live games, a shared drawing canvas, a 3D constellation, a story, or a film. Profiles open up only as you both choose.",
  contactEmail: "hello@overlap.example",
};
