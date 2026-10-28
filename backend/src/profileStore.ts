import type { z } from "zod";
import type { Repo } from "./repo.js";
import type { profileSchema } from "./validation.js";

export type ProfileInput = z.infer<typeof profileSchema>;

/** Saves a validated profile. Optional sections are only written when they were sent. */
export function saveProfile(repo: Repo, id: number, p: ProfileInput) {
  repo.updateProfile(id, p);
  const fields: Record<string, string | number | null> = {};
  if (p.avatar) fields.avatar = JSON.stringify(p.avatar);
  if (p.birthYear !== undefined) fields.birth_year = p.birthYear;
  if (p.gender !== undefined) fields.gender = p.gender;
  if (p.lookingFor !== undefined) fields.looking_for = p.lookingFor;
  if (p.intent !== undefined) fields.intent = p.intent;
  if (p.city !== undefined) fields.city = p.city;
  if (p.job !== undefined) fields.job = p.job;
  if (p.education !== undefined) fields.education = p.education;
  if (p.heightCm !== undefined) fields.height_cm = p.heightCm;
  if (p.starSign !== undefined) fields.star_sign = p.starSign;
  if (p.languages !== undefined) fields.languages = JSON.stringify(p.languages);
  if (p.lifestyle !== undefined) fields.lifestyle = JSON.stringify(Object.fromEntries(Object.entries(p.lifestyle).filter(([, v]) => v)));
  if (p.loveLanguage !== undefined) fields.love_language = p.loveLanguage;
  if (p.personality !== undefined) fields.personality = p.personality;
  if (p.prompts !== undefined) fields.prompts = JSON.stringify(p.prompts);
  if (p.photos !== undefined) fields.photos = JSON.stringify(p.photos);
  if (p.quiz !== undefined) fields.quiz = JSON.stringify(p.quiz);
  repo.setProfileFields(id, fields);
  return repo.userById(id)!;
}
