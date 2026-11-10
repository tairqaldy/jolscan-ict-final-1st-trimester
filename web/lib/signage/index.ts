import type { CompareResult, StoredSignageCheck } from "@/lib/types";
import { DEFAULT_SIGNAGE, type SignageConfig } from "./config";
import { evaluateSignage } from "./engine";

export * from "./config";
export * from "./engine";
export * from "./match";

/**
 * CompareResult + inputs -> a full SignageAnalysis (plus the web-only inputs
 * block). The one place mock, local and cloud results get a verdict, so they
 * are judged identically.
 */
export function buildSignageCheck(
  compare: CompareResult,
  extras: { id: string; createdAt: string; inputs: StoredSignageCheck["inputs"]; place?: string },
  config: SignageConfig = DEFAULT_SIGNAGE,
): StoredSignageCheck {
  return {
    provider: compare.provider,
    model: compare.model,
    latencyMs: compare.latencyMs,
    a: compare.a,
    b: compare.b,
    similarity: compare.similarity,
    id: extras.id,
    createdAt: extras.createdAt,
    ...evaluateSignage(compare, config),
    inputs: extras.inputs,
    ...(extras.place ? { place: extras.place } : {}),
  };
}

/** Re-judge a stored check with another rule config (Rules page preview, "your rules changed" notes). */
export function rejudge(check: StoredSignageCheck, config: SignageConfig): StoredSignageCheck {
  return { ...check, ...evaluateSignage(check, config) };
}
