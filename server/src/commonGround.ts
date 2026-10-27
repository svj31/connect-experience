import { IN_SYNC, WOULD_YOU_RATHER } from "./content/questions.js";

export interface AnswerRow {
  game: string;
  question_id: string;
  user_id: number;
  answer: string;
}

export interface Person {
  id: number;
  name: string;
  interests: string[];
}

export interface CommonGround {
  sharedInterests: string[];
  questionsCompared: number;
  questionsAgreed: number;
  /** Agreement on Would You Rather, from 0 to 1. Null until at least one question is compared. */
  agreementRate: number | null;
  agreedTopics: string[];
  sparks: string[];
}

/**
 * Builds the Common Ground report for two people from the answers they actually gave.
 * Nothing here is estimated: every number is a count of real answers.
 */
export function computeCommonGround(me: Person, partner: Person, answers: AnswerRow[]): CommonGround {
  const sharedInterests = me.interests.filter((i) => partner.interests.includes(i));
  const byQuestion = new Map<string, Map<number, string>>();
  for (const row of answers) {
    if (row.game !== "wyr") continue;
    if (!byQuestion.has(row.question_id)) byQuestion.set(row.question_id, new Map());
    byQuestion.get(row.question_id)!.set(row.user_id, row.answer);
  }

  let compared = 0;
  let agreed = 0;
  const agreedTopics = new Set<string>();
  const agreeSparks: string[] = [];
  const splitSparks: string[] = [];

  for (const [questionId, picks] of byQuestion) {
    const mine = picks.get(me.id);
    const theirs = picks.get(partner.id);
    const question = WOULD_YOU_RATHER.find((qq) => qq.id === questionId);
    if (!mine || !theirs || !question) continue;
    compared++;
    const text = (pick: string) => (pick === "a" ? question.a : question.b);
    if (mine === theirs) {
      agreed++;
      agreedTopics.add(question.topic);
      agreeSparks.push(`You both picked "${text(mine)}". When could you actually do it?`);
    } else {
      splitSparks.push(`You chose "${text(mine)}" and ${partner.name} chose "${text(theirs)}". Ask what wins it for them.`);
    }
  }

  const insyncSparks: string[] = [];
  for (const row of answers) {
    if (row.game !== "insync" || row.user_id !== partner.id) continue;
    const question = IN_SYNC.find((qq) => qq.id === row.question_id);
    if (question) insyncSparks.push(`${partner.name}'s answer to "${question.prompt}" was "${row.answer}". Ask for the story behind it.`);
  }

  const interestSparks = sharedInterests.map((i) => `You both listed ${i}. What got each of you into it?`);

  // Interleave so the list mixes differences, agreements and interests.
  const pools = [splitSparks, insyncSparks, agreeSparks, interestSparks];
  const sparks: string[] = [];
  for (let i = 0; sparks.length < 5 && pools.some((p) => i < p.length); i++) {
    for (const pool of pools) if (pool[i] && sparks.length < 5) sparks.push(pool[i]);
  }

  return {
    sharedInterests,
    questionsCompared: compared,
    questionsAgreed: agreed,
    agreementRate: compared ? agreed / compared : null,
    agreedTopics: [...agreedTopics],
    sparks,
  };
}
