/**
 * The signage rules engine: turns a CompareResult (two signs) into a verdict.
 * Specification: docs/RULES.md, Part 2. Pure functions only (no I/O, no Date,
 * no randomness), so the server, the browser and the tests agree.
 *
 *   S1 each sign is recognisable   confidence >= 0.80 for both signs
 *   S2 the two signs differ        predicted genders differ
 *   S3 the signs belong to one set similarity >= 0.75
 *
 *   clear      S1, S2 and S3 pass
 *   review     S2 passes, and S1 or S3 fails
 *   confusing  S2 fails (whatever S1 and S3 say)
 *
 * Every result lists all three rules with passed true/false, so the verdict
 * can be explained.
 */
import type { CompareResult, SignageRuleHit, SignageVerdict } from "@/lib/types";
import { DEFAULT_SIGNAGE, SIGNAGE_RULE_TITLES, VERDICT_ACTIONS, type SignageConfig } from "./config";

export type SignageResult = {
  verdict: SignageVerdict;
  ruleHits: SignageRuleHit[];
  recommendedAction: string;
};

const pct = (v: number) => `${Math.round(v * 100)}%`;

/**
 * Two decimals, unless rounding would hide which side of the threshold the
 * value is on (0.7999 would print as 0.80). Then four decimals.
 */
export function formatAgainst(value: number, threshold: number): string {
  const short = value.toFixed(2);
  return Number(short) >= threshold === value >= threshold ? short : value.toFixed(4);
}

/** Same idea for percentages: "62%", or "79.99%" when 80% would mislead. */
function pctAgainst(value: number, threshold: number): string {
  const short = pct(value);
  return Math.round(value * 100) / 100 >= threshold === value >= threshold ? short : `${(value * 100).toFixed(2)}%`;
}

export function evaluateSignage(
  compare: Pick<CompareResult, "a" | "b" | "similarity">,
  config: SignageConfig = DEFAULT_SIGNAGE,
): SignageResult {
  const { a, b, similarity } = compare;
  const t1 = config.s1.minConfidence;
  const t3 = config.s3.minSimilarity;

  // S1: both signs recognisable.
  const aOk = a.confidence >= t1;
  const bOk = b.confidence >= t1;
  const s1Passed = aOk && bOk;
  const weak = [
    !aOk && `sign a (${a.gender}, ${pctAgainst(a.confidence, t1)})`,
    !bOk && `sign b (${b.gender}, ${pctAgainst(b.confidence, t1)})`,
  ].filter(Boolean);
  const s1Detail = s1Passed
    ? `Sign a reads as ${a.gender} at ${pct(a.confidence)}, sign b as ${b.gender} at ${pct(b.confidence)}. Both are at or above ${pct(t1)}`
    : `Below ${pct(t1)}: ${weak.join(" and ")}. The model, and likely a visitor, cannot tell ${weak.length > 1 ? "their genders" : "its gender"} at a glance`;

  // S2: predicted genders differ.
  const s2Passed = a.gender !== b.gender;
  const s2Detail = s2Passed
    ? `Sign a reads as ${a.gender}, sign b as ${b.gender}`
    : `Both signs read as ${a.gender}. Visitors cannot tell which door is which`;

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
  return { verdict, ruleHits, recommendedAction: VERDICT_ACTIONS[verdict] };
}
