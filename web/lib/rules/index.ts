import type { InferenceResult, PhotoMeta, StoredAnalysis } from "@/lib/types";
import { DEFAULT_RULES, type RulesConfig } from "./config";
import { scoreDetections } from "./engine";

export * from "./config";
export * from "./engine";

/**
 * Inference + metadata -> a full Analysis. The one place mock, local and
 * cloud results are scored, so they are scored identically.
 */
export function buildAnalysis(
  inference: InferenceResult,
  meta: PhotoMeta,
  extras: {
    id: string;
    createdAt: string;
    location?: StoredAnalysis["location"];
    photo?: Omit<StoredAnalysis["photo"], keyof PhotoMeta>;
  },
  config: RulesConfig = DEFAULT_RULES,
): StoredAnalysis {
  const { detections: _derived, ...result } = scoreDetections(inference.detections, meta, config);
  void _derived;
  return {
    ...inference,
    id: extras.id,
    createdAt: extras.createdAt,
    ...result,
    ...(extras.location ? { location: extras.location } : {}),
    photo: { ...meta, ...extras.photo },
  };
}

/** Re-score a stored analysis with another rule config (Rules page preview). */
export function rescore(analysis: StoredAnalysis, config: RulesConfig): StoredAnalysis {
  const { detections: _derived, ...result } = scoreDetections(analysis.detections, analysis.photo, config);
  void _derived;
  return { ...analysis, ...result };
}
