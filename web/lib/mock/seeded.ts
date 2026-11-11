import type { Provider } from "@/lib/types";

/**
 * The seeded demo records (lib/mock/analyses.ts and lib/mock/restroom-checks.ts) are invented:
 * no model produced them. Their ids start with "demo-", ids of real analyses never do.
 * Pages that list or open a single record use this to label it, so an invented row never
 * shows "Local" or a model name as if our model had made it.
 */
export function isSeededDemo(id: string): boolean {
  return id.startsWith("demo-");
}

/** Shown instead of a model name on a seeded record. */
export const SEEDED_MODEL_LABEL = "none (invented demo record)";

/**
 * Where a single result comes from (G-29). A result card shows exactly one provenance badge:
 * an invented seeded record is "demo" whatever its provider field says, the mock provider's
 * canned answer is "mock", and anything else was made by our model through Local or Cloud.
 */
export type ResultProvenance =
  | { kind: "demo" }
  | { kind: "mock" }
  | { kind: "model"; provider: "local" | "cloud"; model: string };

export function resultProvenance(result: { id?: string; provider: Provider; model: string }): ResultProvenance {
  if (result.id !== undefined && isSeededDemo(result.id)) return { kind: "demo" };
  if (result.provider === "mock") return { kind: "mock" };
  return { kind: "model", provider: result.provider, model: result.model };
}
