import type { Detection, InferenceResult } from "@/lib/types";
import { MOCK_MODEL_NAME } from "@/lib/mock/analyses";
import { createRng, hash32 } from "@/lib/mock/prng";
import type { HealthResult, ModelProvider, PredictInput } from "./types";

/**
 * Mock provider: works offline, no model needed.
 * - Bundled sample: returns the detections from samples.json (they match the drawing).
 * - Uploaded photo: returns invented boxes derived from a hash of the file bytes,
 *   so the same photo always gives the same result. They are NOT real detections.
 */

/** Small pause so loading states are visible in the demo. */
const MOCK_DELAY_MS = 600;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function inventDetections(bytes: Uint8Array, conf: number): Detection[] {
  // Hash a bounded slice so big files stay cheap.
  const rng = createRng(hash32(bytes.subarray(0, 65536)) ^ bytes.length);
  const count = rng.int(0, 4);
  const out: Detection[] = [];
  for (let i = 0; i < count; i++) {
    const w = rng.range(0.05, 0.2);
    const h = w * rng.range(0.45, 0.75);
    out.push({
      id: `u-d${i + 1}`,
      label: "pothole",
      confidence: Math.round(rng.range(0.28, 0.93) * 100) / 100,
      box: {
        x: Math.round(rng.range(0.1, 0.9 - w) * 1000) / 1000,
        y: Math.round(rng.range(0.45, 0.95 - h) * 1000) / 1000,
        w: Math.round(w * 1000) / 1000,
        h: Math.round(h * 1000) / 1000,
      },
    });
  }
  return out.filter((d) => d.confidence >= conf);
}

export const mockProvider: ModelProvider = {
  id: "mock",
  async predict(input: PredictInput): Promise<InferenceResult> {
    await sleep(MOCK_DELAY_MS);
    if (input.sample) {
      const s = input.sample;
      return {
        provider: "mock",
        model: MOCK_MODEL_NAME,
        imageWidth: s.imageWidth,
        imageHeight: s.imageHeight,
        latencyMs: s.mockLatencyMs,
        detections: s.detections.filter((d) => d.confidence >= input.conf),
      };
    }
    const bytes = input.image?.bytes ?? new Uint8Array();
    return {
      provider: "mock",
      model: MOCK_MODEL_NAME,
      imageWidth: input.imageWidth ?? 1280,
      imageHeight: input.imageHeight ?? 720,
      latencyMs: 30 + (hash32(bytes.subarray(0, 4096)) % 25),
      detections: inventDetections(bytes, input.conf),
    };
  },
  async health(): Promise<HealthResult> {
    return { ok: true, provider: "mock", status: "ok", model: MOCK_MODEL_NAME, device: "none (canned data)", latencyMs: 0 };
  },
};
