/**
 * Default signage rule configuration. Source of truth: docs/RULES.md, Part 2.
 *
 * The rules compare the two signs with each other. Each sign's P(male) comes from the
 * model (P(male) = confidence if the sign was predicted male, 1 - confidence if female).
 * The sign with the higher P(male) is the men's door, and the "margin" is the gap
 * between the two P(male) values.
 *
 * The verdict has two values: a pair (S2 and S3 pass) or not a pair. The old rule S1
 * (gap at least 0.20, "which door is which is clear") and the "review" verdict were
 * dropped on 11 Nov 2026: the app answers one question, are these two signs a pair.
 *
 * The defaults were chosen on the 82 IOAI training restrooms with zero-shot CLIP ViT-B/32
 * (ml/restroom/pair_separation.py, results in ml/results/restroom/pair_separation.json).
 * If you change a default, change RULES.md too.
 */

export type SignageConfig = {
  /** S2 The doors read as different genders: margin at least this. */
  s2: { minMargin: number };
  /** S3 The signs belong to one set: similarity at least this. */
  s3: { minSimilarity: number };
};

export type SignageRuleId = "S2" | "S3";

export const DEFAULT_SIGNAGE: SignageConfig = {
  s2: { minMargin: 0.05 },
  s3: { minSimilarity: 0.88 },
};

export const SIGNAGE_RULE_TITLES: Record<SignageRuleId, string> = {
  S2: "The doors read as different genders",
  S3: "The signs belong to one set",
};

/** The one-line reason under the verdict, from which of the two rules passed. */
export function verdictReason(s2Passed: boolean, s3Passed: boolean): string {
  if (s2Passed && s3Passed) return "One design set, and the two doors read as different genders";
  if (s2Passed) return "The two designs are from different sets";
  if (s3Passed) return "Both signs read as the same gender";
  return "Different design sets, and both signs read as the same gender";
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? clamp01(v) : undefined);

/**
 * Merge a partial or untrusted config (from localStorage or a request body)
 * over the defaults. Keeps only finite numbers, clamped to 0..1. Settings saved
 * by earlier versions of the rules (s1) are ignored.
 */
export function normaliseSignage(input: unknown): SignageConfig {
  const out = structuredClone(DEFAULT_SIGNAGE);
  if (!input || typeof input !== "object") return out;
  const src = input as Record<string, Record<string, unknown> | undefined>;
  out.s2.minMargin = num(src.s2?.minMargin) ?? out.s2.minMargin;
  out.s3.minSimilarity = num(src.s3?.minSimilarity) ?? out.s3.minSimilarity;
  return out;
}
