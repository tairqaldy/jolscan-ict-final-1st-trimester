/**
 * PLACEHOLDER VALUES. About 30 invented restroom sign checks so the restroom
 * overview, the platform overview and the analytics charts have something to
 * show before real comparisons are made. Places, dates, confidences and
 * similarities are generated; nothing here is a measurement. Replace (or
 * delete) once the model is connected.
 *
 * Deterministic: fixed seed and the same anchor date as the pothole demo set
 * (MOCK_ANCHOR, 10 Nov 2026), computed once at module load. Never
 * Math.random or Date.now at render, so server and browser agree.
 */
import { buildSignageCheck } from "@/lib/signage";
import type { Provider, StoredSignageCheck } from "@/lib/types";
import { MOCK_ANCHOR } from "./analyses";
import { createRng } from "./prng";
import { RESTROOM_MOCK_MODEL, RESTROOM_SAMPLES, mockSimilarity, type RestroomSample } from "./restroom-samples";

export const RESTROOM_MOCK_COUNT = 30;
const SEED = 20261111;

/** Model name shown on seeded local/cloud checks. Placeholder until the restroom champion is chosen. */
export const RESTROOM_DEMO_MODEL_NAME = "clip-vitb32-ft6";

const PLACES = [
  "Main building, floor 1",
  "Main building, floor 3",
  "Library, ground floor",
  "Sports hall",
  "Dormitory 2",
  "Canteen",
  "Lab block B",
  "Assembly hall",
  "Student centre",
  "Admin office",
] as const;

const bySet = (set: string, g: "male" | "female") =>
  RESTROOM_SAMPLES.find((s) => s.set === set && s.trueGender === g) as RestroomSample;

const CLEAN_SETS = ["classic", "rounded", "line", "geometric"] as const;

const round2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function generate(): StoredSignageCheck[] {
  const rng = createRng(SEED);
  const anchor = Date.parse(MOCK_ANCHOR);
  const day = 24 * 60 * 60 * 1000;
  const out: StoredSignageCheck[] = [];

  for (let i = 0; i < RESTROOM_MOCK_COUNT; i++) {
    const kind = rng.weighted([
      ["same-set", 12],
      ["faint", 3],
      ["twins", 2],
      ["cross-set", 4],
    ] as const);
    let male: RestroomSample;
    let female: RestroomSample;
    if (kind === "same-set") {
      const set = rng.pick(CLEAN_SETS);
      male = bySet(set, "male");
      female = bySet(set, "female");
    } else if (kind === "faint" || kind === "twins") {
      male = bySet(kind, "male");
      female = bySet(kind, "female");
    } else {
      const s1 = rng.pick(CLEAN_SETS);
      const s2 = rng.pick(CLEAN_SETS.filter((s) => s !== s1));
      male = bySet(s1, "male");
      female = bySet(s2, "female");
    }
    const [a, b] = rng.next() < 0.75 ? [male, female] : [female, male];

    // The drawn sample's mock values with a small, fixed jitter so the charts show a spread.
    const jitter = (v: number, d: number) => round2(clamp(v + rng.range(-d, d), 0.5, 0.99));
    const provider = rng.weighted<Provider>([
      ["local", 5],
      ["cloud", 2],
      ["mock", 3],
    ]);
    const createdAt = new Date(anchor - rng.range(0.05, 30) * day).toISOString();

    out.push(
      buildSignageCheck(
        {
          provider,
          model: provider === "mock" ? RESTROOM_MOCK_MODEL : RESTROOM_DEMO_MODEL_NAME,
          latencyMs: provider === "cloud" ? rng.int(220, 640) : provider === "local" ? rng.int(70, 160) : rng.int(80, 100),
          a: { gender: a.mock.gender, confidence: jitter(a.mock.confidence, 0.04) },
          b: { gender: b.mock.gender, confidence: jitter(b.mock.confidence, 0.04) },
          similarity: round2(clamp(mockSimilarity(a.id, b.id) + rng.range(-0.03, 0.03), 0.3, 0.99)),
        },
        {
          id: `demo-rc-${String(i + 1).padStart(3, "0")}`,
          createdAt,
          inputs: { a: { sampleId: a.id, imageUrl: a.file }, b: { sampleId: b.id, imageUrl: b.file } },
          place: rng.pick(PLACES),
        },
      ),
    );
  }
  return out.sort((x, y) => y.createdAt.localeCompare(x.createdAt));
}

/** Seeded demo checks, newest first. */
export const MOCK_RESTROOM_CHECKS: StoredSignageCheck[] = generate();
