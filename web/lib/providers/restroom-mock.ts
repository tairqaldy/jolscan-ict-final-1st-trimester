import {
  RESTROOM_MOCK_LATENCY_MS,
  RESTROOM_MOCK_MODEL,
  inventPrediction,
  inventSimilarity,
  mockSimilarity,
} from "@/lib/mock/restroom-samples";
import { pickBestMatch, sortCandidates } from "@/lib/signage/match";
import type { CompareResult, MatchResult, SignPrediction } from "@/lib/types";
import type { RestroomProvider, SignInput } from "./restroom-types";

/**
 * Mock restroom provider: works offline, no model needed.
 * - Bundled samples: predictions and similarities from samples.json (invented placeholders).
 * - Uploads: invented values derived from a hash of the bytes, so the same
 *   image always gives the same answer. They are NOT model outputs.
 */
const MOCK_DELAY_MS = 500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const predictionOf = (sign: SignInput): SignPrediction =>
  sign.sample ? sign.sample.mock : inventPrediction(sign.image?.bytes ?? new Uint8Array());

function similarityOf(a: SignInput, b: SignInput): number {
  if (a.sample && b.sample) return mockSimilarity(a.sample.id, b.sample.id);
  if (a.image && b.image) return inventSimilarity(a.image.bytes, b.image.bytes);
  const upload = (a.image ?? b.image)!.bytes;
  const sampleId = (a.sample ?? b.sample)!.id;
  return inventSimilarity(upload, sampleId);
}

export const restroomMockProvider: RestroomProvider = {
  id: "mock",
  async compare({ a, b }): Promise<CompareResult> {
    await sleep(MOCK_DELAY_MS);
    return {
      provider: "mock",
      model: RESTROOM_MOCK_MODEL,
      latencyMs: RESTROOM_MOCK_LATENCY_MS * 2,
      a: predictionOf(a),
      b: predictionOf(b),
      similarity: similarityOf(a, b),
    };
  },
  async match({ query, gallery }): Promise<MatchResult> {
    await sleep(MOCK_DELAY_MS);
    const q = predictionOf(query);
    const candidates = sortCandidates(
      gallery.map((s) => ({ id: s.id, similarity: similarityOf(query, { sample: s }), prediction: s.mock })),
    );
    return {
      provider: "mock",
      model: RESTROOM_MOCK_MODEL,
      latencyMs: RESTROOM_MOCK_LATENCY_MS * (gallery.length + 1),
      query: q,
      candidates,
      bestMatchId: pickBestMatch(q.gender, candidates),
    };
  },
};
