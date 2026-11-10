/**
 * Default signage rule configuration. Source of truth: docs/RULES.md, Part 2.
 *
 * The rules compare the two signs with each other. Each sign's P(male) comes from the
 * model (P(male) = confidence if the sign was predicted male, 1 - confidence if female).
 * The sign with the higher P(male) is the men's door, and the "margin" is the gap
 * between the two P(male) values.
 *
 * The defaults were chosen on the 82 IOAI training restrooms with zero-shot CLIP ViT-B/32
 * (ml/restroom/pair_separation.py, results in ml/results/restroom/pair_separation.json).
 * If you change a default, change RULES.md too.
 */
import type { SignageVerdict } from "@/lib/types";

export type SignageConfig = {
  /** S1 Which door is which is clear: margin at least this. */
  s1: { minMargin: number };
  /** S2 The doors can be told apart at all: margin at least this. */
  s2: { minMargin: number };
  /** S3 The signs belong to one set: similarity at least this. */
  s3: { minSimilarity: number };
};

export type SignageRuleId = "S1" | "S2" | "S3";

export const DEFAULT_SIGNAGE: SignageConfig = {
  s1: { minMargin: 0.2 },
  s2: { minMargin: 0.05 },
  s3: { minSimilarity: 0.88 },
};

export const SIGNAGE_RULE_TITLES: Record<SignageRuleId, string> = {
  S1: "Which door is which is clear",
  S2: "The two doors can be told apart",
  S3: "The signs belong to one set",
};

/** Verdict table (RULES.md "Verdict"). */
export const VERDICT_ACTIONS: Record<SignageVerdict, string> = {
  clear: "No action",
  review: "Check the signs on site. Make the difference between the doors clearer, or replace the sign that does not match the set",
  confusing: "Replace the signage. Visitors are likely to enter the wrong room",
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? clamp01(v) : undefined);

/**
 * Merge a partial or untrusted config (from localStorage or a request body)
 * over the defaults. Keeps only finite numbers, clamped to 0..1. Settings saved
 * by the earlier version of the rules (s1.minConfidence) are ignored.
 * S2 can never be stricter than S1, so it is capped at S1's margin.
 */
export function normaliseSignage(input: unknown): SignageConfig {
  const out = structuredClone(DEFAULT_SIGNAGE);
  if (!input || typeof input !== "object") return out;
  const src = input as Record<string, Record<string, unknown> | undefined>;
  out.s1.minMargin = num(src.s1?.minMargin) ?? out.s1.minMargin;
  out.s2.minMargin = num(src.s2?.minMargin) ?? out.s2.minMargin;
  out.s3.minSimilarity = num(src.s3?.minSimilarity) ?? out.s3.minSimilarity;
  out.s2.minMargin = Math.min(out.s2.minMargin, out.s1.minMargin);
  return out;
}
