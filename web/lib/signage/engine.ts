/**
 * The signage rules engine: turns a CompareResult (two signs) into a verdict.
 * Specification: docs/RULES.md, Part 2. Pure functions only (no I/O, no Date,
 * no randomness), so the server, the browser and the tests agree.
 *
 * The two signs are compared with each other, not classified one by one: on the
 * IOAI training restrooms, "the men's door has the higher P(male)" is right 90% of
 * the time, while "both signs classified correctly on their own" is right only 57%.
 *
 *   margin = |P(male) of sign a - P(male) of sign b|
 *
 *   S1 which door is which is clear     margin     >= 0.20
 *   S2 the doors can be told apart       margin     >= 0.05
 *   S3 the signs belong to one set       similarity >= 0.88
 *
 *   clear      S1, S2 and S3 pass
 *   review     S2 passes, and S1 or S3 fails
 *   confusing  S2 fails (whatever S1 and S3 say)
 */
import type { CompareResult, Gender, SignPrediction, SignageDoors, SignageRuleHit, SignageVerdict } from "@/lib/types";
import { DEFAULT_SIGNAGE, SIGNAGE_RULE_TITLES, VERDICT_ACTIONS, type SignageConfig } from "./config";

/** Which sign the rules read as the men's door, both P(male) values and their gap. */
export type DoorAssignment = SignageDoors;

export type SignageResult = {
  verdict: SignageVerdict;
  ruleHits: SignageRuleHit[];
  recommendedAction: string;
  doors: DoorAssignment;
};

const round4 = (v: number) => Math.round(v * 10000) / 10000;

/** P(male) of one sign from the model's prediction. */
export function pMale(p: SignPrediction): number {
  return p.gender === "male" ? p.confidence : 1 - p.confidence;
}

/** Pairwise reading: the sign with the higher P(male) is the men's door. */
export function assignDoors(a: SignPrediction, b: SignPrediction): DoorAssignment {
  const pa = pMale(a);
  const pb = pMale(b);
  return { mens: pa >= pb ? "a" : "b", pMaleA: round4(pa), pMaleB: round4(pb), margin: round4(Math.abs(pa - pb)) };
}

/** The door's gender under the pairwise reading. */
export function doorGender(doors: DoorAssignment, sign: "a" | "b"): Gender {
  return doors.mens === sign ? "male" : "female";
}

/**
 * Two decimals, unless rounding would hide which side of the threshold the
 * value is on (0.1999 would print as 0.20). Then four decimals.
 */
export function formatAgainst(value: number, threshold: number): string {
  const short = value.toFixed(2);
  return Number(short) >= threshold === value >= threshold ? short : value.toFixed(4);
}

export function evaluateSignage(
  compare: Pick<CompareResult, "a" | "b" | "similarity">,
  config: SignageConfig = DEFAULT_SIGNAGE,
): SignageResult {
  const { a, b, similarity } = compare;
  const doors = assignDoors(a, b);
  const t1 = config.s1.minMargin;
  const t2 = config.s2.minMargin;
  const t3 = config.s3.minSimilarity;
  const m = doors.margin;
  const mens = doors.mens === "a" ? "Door A" : "Door B";
  const womens = doors.mens === "a" ? "door B" : "door A";
  const pText = `P(male) ${doors.pMaleA.toFixed(2)} for door A, ${doors.pMaleB.toFixed(2)} for door B`;

  // S1: the pairwise reading is confident.
  const s1Passed = m >= t1;
  const s1Detail = s1Passed
    ? `${mens} reads as the men's room and ${womens} as the women's room. ${pText}: a gap of ${formatAgainst(m, t1)}, at or above ${t1.toFixed(2)}`
    : `${mens} reads slightly more as the men's room, but the gap is only ${formatAgainst(m, t1)}, below ${t1.toFixed(2)} (${pText}). A person should check which door is which`;

  // S2: the doors can be told apart at all.
  const s2Passed = m >= t2;
  const s2Detail = s2Passed
    ? `The two signs differ enough to tell apart: gap ${formatAgainst(m, t2)}, at or above ${t2.toFixed(2)}`
    : `The two signs look almost the same to the model: gap ${formatAgainst(m, t2)}, below ${t2.toFixed(2)}. Visitors may not be able to tell which door is which`;

  // S3: one design set.
  const s3Passed = similarity >= t3;
  const simText = formatAgainst(similarity, t3);
  const s3Detail = s3Passed
    ? `Similarity ${simText}, at or above ${t3.toFixed(2)}: the two designs look like one set`
    : `Similarity ${simText}, below ${t3.toFixed(2)}: the designs look unrelated, so visitors may not read them as a pair`;

  const ruleHits: SignageRuleHit[] = [
    { ruleId: "S1", title: SIGNAGE_RULE_TITLES.S1, detail: s1Detail, passed: s1Passed },
    { ruleId: "S2", title: SIGNAGE_RULE_TITLES.S2, detail: s2Detail, passed: s2Passed },
    { ruleId: "S3", title: SIGNAGE_RULE_TITLES.S3, detail: s3Detail, passed: s3Passed },
  ];

  const verdict: SignageVerdict = !s2Passed ? "confusing" : s1Passed && s3Passed ? "clear" : "review";
  return { verdict, ruleHits, recommendedAction: VERDICT_ACTIONS[verdict], doors };
}
