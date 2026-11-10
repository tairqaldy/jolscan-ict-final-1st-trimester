/**
 * Default signage rule configuration. Source of truth: docs/RULES.md, Part 2.
 *
 * Team-defined starting values, to be checked on the IOAI validation set
 * (task R2-6 / C-7). They are assumptions, not a building-code requirement.
 * If you change a default, change RULES.md too.
 */
import type { SignageVerdict } from "@/lib/types";

export type SignageConfig = {
  /** S1 Each sign is recognisable: the predicted gender's confidence must be at least this, for both signs. */
  s1: { minConfidence: number };
  /** S3 The signs belong to one set: similarity must be at least this. (S2 has no parameter.) */
  s3: { minSimilarity: number };
};

export type SignageRuleId = "S1" | "S2" | "S3";

export const DEFAULT_SIGNAGE: SignageConfig = {
  s1: { minConfidence: 0.8 },
  s3: { minSimilarity: 0.75 },
};

export const SIGNAGE_RULE_TITLES: Record<SignageRuleId, string> = {
  S1: "Each sign is recognisable",
  S2: "The two signs differ",
  S3: "The signs belong to one set",
};

/** Verdict table (RULES.md "Verdict"). */
export const VERDICT_ACTIONS: Record<SignageVerdict, string> = {
  clear: "No action",
  review: "Check the sign design on site. Consider replacing the weaker sign so the pair matches",
  confusing: "Replace the signage. Visitors are likely to enter the wrong room",
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Merge a partial or untrusted config (from localStorage or a request body)
 * over the defaults. Keeps only finite numbers, clamped to 0..1.
 */
export function normaliseSignage(input: unknown): SignageConfig {
  const out = structuredClone(DEFAULT_SIGNAGE);
  if (!input || typeof input !== "object") return out;
  const src = input as Record<string, Record<string, unknown> | undefined>;
  const conf = src.s1?.minConfidence;
  if (typeof conf === "number" && Number.isFinite(conf)) out.s1.minConfidence = clamp01(conf);
  const sim = src.s3?.minSimilarity;
  if (typeof sim === "number" && Number.isFinite(sim)) out.s3.minSimilarity = clamp01(sim);
  return out;
}
