/**
 * Typed access to the restroom sign manifest (public/samples/restrooms/samples.json)
 * and the deterministic mock similarity. Two kinds of signs: the SVG drawings
 * carry PLACEHOLDER (invented) predictions and similarities; the ioai-* signs
 * from the IOAI validation set carry real model outputs (see the manifest's
 * _comment). Edit the manifest only.
 */
import catalogue from "@/data/restroom-ioai-catalogue.json";
import manifest from "@/public/samples/restrooms/samples.json";
import type { Gender, SignPrediction } from "@/lib/types";
import { hash32 } from "./prng";

export type RestroomSample = {
  id: string;
  file: string;
  set: string;
  title: string;
  trueGender: Gender;
  /** What the mock provider returns for this sign. Invented for drawings, a real model output for ioai-* signs. */
  mock: SignPrediction;
};

export type RestroomSet = { id: string; title: string; note: string };
export type RestroomPreset = { id: string; title: string; a: string; b: string; note: string };

type SimilarityConfig = {
  sameSet: Record<string, number>;
  crossSet: Record<string, number>;
  defaultCross: number;
  jitter: number;
  pairs: Record<string, number>;
};

export const RESTROOM_SAMPLES = manifest.samples as RestroomSample[];

/** Every IOAI sign the public pages may show (web/data/restroom-ioai-catalogue.json), pickable like a sample. */
export type IoaiGroupId = "val" | "test" | "train";
export type IoaiCatalogueSample = RestroomSample & { group: IoaiGroupId; genderByEye: boolean; genderUnsure: boolean };
export const RESTROOM_IOAI_CATALOGUE = catalogue.samples as IoaiCatalogueSample[];
export const RESTROOM_IOAI_GROUPS = catalogue.groups as { id: IoaiGroupId; label: string; count: number }[];
export const RESTROOM_IOAI_CREDIT = catalogue.credit;
export const RESTROOM_SETS = manifest.sets as RestroomSet[];
export const RESTROOM_PRESETS = manifest.presets as RestroomPreset[];
export const RESTROOM_MOCK_MODEL = manifest.model;
export const RESTROOM_MOCK_LATENCY_MS = manifest.mockLatencyMs;
const SIM = manifest.similarity as unknown as SimilarityConfig;

export function getRestroomSample(id: string | null | undefined): RestroomSample | undefined {
  return RESTROOM_SAMPLES.find((s) => s.id === id) ?? RESTROOM_IOAI_CATALOGUE.find((s) => s.id === id);
}

export function getRestroomSet(id: string): RestroomSet | undefined {
  return RESTROOM_SETS.find((s) => s.id === id);
}

/** The sign of the opposite (true) gender from the same set: the right answer for Match. */
export function truePartner(sample: RestroomSample): RestroomSample | undefined {
  const pool: RestroomSample[] = RESTROOM_SAMPLES.some((s) => s.id === sample.id) ? RESTROOM_SAMPLES : RESTROOM_IOAI_CATALOGUE;
  return pool.find((s) => s.set === sample.set && s.trueGender !== sample.trueGender);
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const pairKey = (x: string, y: string) => [x, y].sort().join("|");

/**
 * Deterministic mock similarity of two bundled signs (0..1). High within a
 * set, lower across sets, a fixed id-derived jitter across sets. Same inputs,
 * same output, on the server and in the browser.
 */
export function mockSimilarity(aId: string, bId: string): number {
  if (aId === bId) return 1;
  const override = SIM.pairs[pairKey(aId, bId)];
  if (typeof override === "number") return override;
  const a = getRestroomSample(aId);
  const b = getRestroomSample(bId);
  if (!a || !b) return SIM.defaultCross;
  if (a.set === b.set) return SIM.sameSet[a.set] ?? SIM.defaultCross;
  const base = SIM.crossSet[pairKey(a.set, b.set)] ?? SIM.defaultCross;
  const unit = (hash32(pairKey(aId, bId)) % 1000) / 999; // 0..1
  return round2(clamp01(base + (unit * 2 - 1) * SIM.jitter));
}

/** Invented prediction for an uploaded image, derived from its bytes (same file, same answer). */
export function inventPrediction(bytes: Uint8Array): SignPrediction {
  const h = hash32(bytes.subarray(0, 65536)) ^ bytes.length;
  return {
    gender: (h & 1) === 0 ? "male" : "female",
    confidence: round2(0.55 + ((h >>> 1) % 1000) / 999 * 0.43),
  };
}

/** Invented similarity between an upload and another image (same pair, same answer). */
export function inventSimilarity(bytesA: Uint8Array, keyB: string | Uint8Array): number {
  const a = hash32(bytesA.subarray(0, 65536));
  const b = typeof keyB === "string" ? hash32(keyB) : hash32(keyB.subarray(0, 65536));
  if (typeof keyB !== "string" && a === b && bytesA.length === keyB.length) return 1;
  const h = hash32(`${Math.min(a, b)}:${Math.max(a, b)}`);
  return round2(0.4 + (h % 1000) / 999 * 0.55);
}
