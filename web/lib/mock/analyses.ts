/**
 * PLACEHOLDER VALUES. About 40 invented analyses so the dashboard, reports,
 * analytics and map have something to show before real photos are analysed.
 * Nothing here is a real measurement: dates, places, latencies and
 * confidences are generated. They stay demo data: every page that shows them
 * carries a "Demo data" badge with `show` (components/app/demo-badge.tsx).
 * Real MLflow metrics go in data/experiments.json.
 *
 * Generation is deterministic: a fixed seed and a fixed anchor date, computed
 * once at module load (never Math.random or Date.now at render time), so the
 * server and the browser produce identical data and hydration never differs.
 */
import { buildAnalysis } from "@/lib/rules";
import type { Detection, Provider, RoadClass, StoredAnalysis } from "@/lib/types";
import { CHAMPION_MODEL_NAME } from "./experiments";
import { createRng } from "./prng";
import { SAMPLES } from "./samples";

/** "Now" for the demo data set. The seeded analyses cover the 30 days before it. */
export const MOCK_ANCHOR = "2026-11-10T06:00:00.000Z";
export const MOCK_COUNT = 40;
const SEED = 20261110;

/** Astana city centre. */
export const ASTANA = { lat: 51.1605, lng: 71.4704 };

const STREETS = [
  "Kabanbay Batyr Ave",
  "Turan Ave",
  "Mangilik El Ave",
  "Respublika Ave",
  "Kenesary St",
  "Seifullin St",
  "Abay Ave",
  "Bogenbay Batyr Ave",
  "Syganak St",
  "Dostyk St",
  "Saryarka Ave",
  "Tauelsizdik Ave",
] as const;

export const MOCK_MODEL_NAME = "mock-fixtures";

function generate(): StoredAnalysis[] {
  const rng = createRng(SEED);
  const anchor = Date.parse(MOCK_ANCHOR);
  const day = 24 * 60 * 60 * 1000;
  const out: StoredAnalysis[] = [];

  for (let i = 0; i < MOCK_COUNT; i++) {
    const sample = rng.weighted([
      [SAMPLES[0], 2],
      [SAMPLES[1], 3],
      [SAMPLES[2], 3],
      [SAMPLES[3], 2],
      [SAMPLES[4], 2],
      [SAMPLES[5], 2],
    ] as const);
    const provider = rng.weighted<Provider>([
      ["local", 5],
      ["cloud", 2],
      ["mock", 3],
    ]);
    const roadClass = rng.weighted<RoadClass>([
      [sample.meta.roadClass, 5],
      ["residential", 2],
      ["arterial", 2],
      ["highway", 1],
    ]);
    const schoolZone = sample.meta.schoolZone || rng.next() < 0.08;

    // Same boxes as the drawn sample, jittered confidence so results vary.
    const detections: Detection[] = sample.detections.map((d, k) => ({
      ...d,
      id: `m${String(i + 1).padStart(2, "0")}-d${k + 1}`,
      confidence: Math.round(Math.min(0.99, Math.max(0.2, d.confidence + rng.range(-0.08, 0.06))) * 100) / 100,
    }));

    const latencyMs =
      provider === "cloud"
        ? rng.int(180, 520)
        : provider === "local"
          ? rng.int(36, 95)
          : rng.int(30, 50);

    const createdAt = new Date(anchor - rng.range(0.05, 30) * day).toISOString();
    const street = rng.pick(STREETS);

    out.push(
      buildAnalysis(
        {
          provider,
          model: provider === "mock" ? MOCK_MODEL_NAME : CHAMPION_MODEL_NAME,
          imageWidth: sample.imageWidth,
          imageHeight: sample.imageHeight,
          latencyMs,
          detections,
        },
        { roadClass, schoolZone },
        {
          id: `demo-${String(i + 1).padStart(3, "0")}`,
          createdAt,
          location: {
            lat: Math.round((ASTANA.lat + rng.range(-0.055, 0.055)) * 1e5) / 1e5,
            lng: Math.round((ASTANA.lng + rng.range(-0.11, 0.11)) * 1e5) / 1e5,
            label: street,
          },
          photo: { sampleId: sample.id, imageUrl: sample.file },
        },
      ),
    );
  }

  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Seeded demo analyses, newest first. */
export const MOCK_ANALYSES: StoredAnalysis[] = generate();
