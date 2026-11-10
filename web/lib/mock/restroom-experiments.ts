/**
 * Restroom experiment results (data/restroom-experiments.json), schema
 * RestroomExperimentsFile in ARCHITECTURE.md 2b. The shipped file is a
 * placeholder: isMock true, rows R0–R6 with isReal false and null metrics.
 * ml/restroom/export_results.py overwrites it; rows with isReal true then show
 * without a "Demo data" badge. The loader tolerates missing fields so a
 * half-written export never breaks the page.
 */
import raw from "@/data/restroom-experiments.json";

export type RestroomRun = {
  run: string;
  changed: string;
  isReal: boolean;
  matchTop1Val: number | null;
  matchTop1Test: number | null;
  genderAccCv: number | null;
  latencyMs: number | null;
  device: string | null;
};

export type RestroomExperiments = {
  isMock: boolean;
  champion: string | null;
  reference: { ioaiBaseline: number; ioaiBest: number; note: string };
  runs: RestroomRun[];
};

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

function normalise(input: unknown): RestroomExperiments {
  const r = (input ?? {}) as Record<string, unknown>;
  const ref = (r.reference ?? {}) as Record<string, unknown>;
  const runs = Array.isArray(r.runs) ? (r.runs as Record<string, unknown>[]) : [];
  return {
    isMock: r.isMock !== false,
    champion: typeof r.champion === "string" && r.champion ? r.champion : null,
    reference: {
      ioaiBaseline: num(ref.ioaiBaseline) ?? 0.77,
      ioaiBest: num(ref.ioaiBest) ?? 0.9,
      note:
        typeof ref.note === "string" && ref.note
          ? ref.note
          : "Published by the IOAI 2025 committee on their test set. Not our runs.",
    },
    runs: runs.map((x, i) => ({
      run: typeof x.run === "string" ? x.run : `R${i}`,
      changed: typeof x.changed === "string" ? x.changed : "",
      isReal: x.isReal === true,
      matchTop1Val: num(x.matchTop1Val),
      matchTop1Test: num(x.matchTop1Test),
      genderAccCv: num(x.genderAccCv),
      latencyMs: num(x.latencyMs),
      device: typeof x.device === "string" && x.device ? x.device : null,
    })),
  };
}

export const RESTROOM_EXPERIMENTS = normalise(raw);

/** Drives the "Demo data" badges of the restroom module. */
export const RESTROOM_IS_DEMO = RESTROOM_EXPERIMENTS.isMock;

/** A run with at least one number in it. */
export const hasMetrics = (r: RestroomRun) =>
  r.matchTop1Val !== null || r.matchTop1Test !== null || r.genderAccCv !== null || r.latencyMs !== null;

export const RESTROOM_CHAMPION = RESTROOM_EXPERIMENTS.runs.find((r) => r.run === RESTROOM_EXPERIMENTS.champion) ?? null;
