/**
 * Matching helpers for the IOAI task: given one query sign, its partner is the
 * most similar gallery sign of the opposite gender. Pure functions.
 */
import type { Gender, MatchCandidate } from "@/lib/types";

export const oppositeGender = (g: Gender): Gender => (g === "male" ? "female" : "male");

/** Most similar first; ties broken by id so the order is stable. */
export function sortCandidates(candidates: MatchCandidate[]): MatchCandidate[] {
  return [...candidates].sort((x, y) => y.similarity - x.similarity || x.id.localeCompare(y.id));
}

/** The most similar candidate whose predicted gender is opposite to the query's, or null. */
export function pickBestMatch(queryGender: Gender, candidates: MatchCandidate[]): string | null {
  const want = oppositeGender(queryGender);
  return sortCandidates(candidates).find((c) => c.prediction.gender === want)?.id ?? null;
}
