import {
  RESTROOM_MOCK_LATENCY_MS,
  RESTROOM_MOCK_MODEL,
  inventPrediction,
  inventSimilarity,
  mockSimilarity,
} from "@/lib/mock/restroom-samples";
import { ioaiSimilarity } from "@/lib/mock/restroom-ioai-embeddings";
import { SERVED_METHOD, ioaiPicks } from "@/lib/mock/restroom-ioai-match";
import { pickBestMatch, sortCandidates } from "@/lib/signage/match";
import type { CompareResult, MatchResult, SignPrediction } from "@/lib/types";
import type { RestroomProvider, SignInput } from "./restroom-types";

/**
 * Mock restroom provider: works offline, no model needed.
 * - Bundled samples: predictions and similarities from samples.json (invented for the
 *   drawings, recorded real model outputs for the IOAI signs).
 * - The IOAI catalogue (every IOAI sign): real zero-shot CLIP predictions, and real
 *   similarities between IOAI signs from stored embeddings.
 * - Uploads: invented values derived from a hash of the bytes, so the same
 *   image always gives the same answer. They are NOT model outputs.
 */
const MOCK_DELAY_MS = 500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const predictionOf = (sign: SignInput): SignPrediction =>
  sign.sample ? sign.sample.mock : inventPrediction(sign.image?.bytes ?? new Uint8Array());

function similarityOf(a: SignInput, b: SignInput): number {
  // Two IOAI signs: the real CLIP similarity from the catalogue's embeddings; drawings: invented.
  if (a.sample && b.sample) return ioaiSimilarity(a.sample.id, b.sample.id) ?? mockSimilarity(a.sample.id, b.sample.id);
  if (a.image && b.image) return inventSimilarity(a.image.bytes, b.image.bytes);
  const upload = (a.image ?? b.image)!.bytes;
  const sampleId = (a.sample ?? b.sample)!.id;
  return inventSimilarity(upload, sampleId);
}

function servedPick(query: SignInput, gallery: { id: string }[]): string | null {
  const pick = ioaiPicks(query.sample?.id)?.[SERVED_METHOD];
  return pick && gallery.some((s) => s.id === pick) ? pick : null;
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
      // IOAI catalogue signs: the served pipeline's real pick, computed offline on this very gallery.
      // Everything else keeps the mock rule (most similar of the opposite predicted gender).
      bestMatchId: servedPick(query, gallery) ?? pickBestMatch(q.gender, candidates),
    };
  },
};
