import type { RestroomSample } from "@/lib/mock/restroom-samples";
import type { CompareResult, MatchResult, Provider } from "@/lib/types";

/** One sign: an uploaded image or a bundled sample. */
export type SignInput = {
  image?: { bytes: Uint8Array; type: string; name: string };
  sample?: RestroomSample;
};

export type CompareInput = { a: SignInput; b: SignInput };

/** The gallery is always bundled samples; candidate ids in the result are sample ids. */
export type MatchInput = { query: SignInput; gallery: RestroomSample[] };

/**
 * The restroom model behind one interface, like ModelProvider for potholes.
 * mock: canned predictions from samples.json. local and cloud: the model
 * service's POST /restroom/compare and /restroom/match (ARCHITECTURE.md 2b).
 */
export interface RestroomProvider {
  id: Provider;
  compare(input: CompareInput): Promise<CompareResult>;
  match(input: MatchInput): Promise<MatchResult>;
}
