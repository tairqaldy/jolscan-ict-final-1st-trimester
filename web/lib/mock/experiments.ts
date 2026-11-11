/**
 * Roads (pothole) experiment results, data/experiments.json.
 *
 * The shipped file is a PLACEHOLDER (isMock true, invented numbers).
 * ml/export_results.py overwrites it with the real runs in the ExperimentsFile
 * shape from ARCHITECTURE.md section 2 (`run`, `map50_95`, `sizeMb`, nullable
 * `latencyMs` and `device`, plus a `dataset` block). This loader accepts both
 * shapes. A number missing from the file stays null, so the page can show
 * "—" instead of a fake 0. Its `isMock` flag drives the "Demo data" badges
 * of the roads module.
 */
import raw from "@/data/experiments.json";

export type ExperimentRun = {
  id: string;
  name: string;
  changed: string;
  /** Test split. Precision and recall at the confidence that maximises F1. */
  precision: number | null;
  recall: number | null;
  map50: number | null;
  map5095: number | null;
  /** Test split at confidence 0.40, the threshold the app's rules count at. */
  precisionAtRulesConf: number | null;
  recallAtRulesConf: number | null;
  /** Validation split: used only to pick the champion, never reported as the result. */
  valMap50: number | null;
  valRecallAtRulesConf: number | null;
  /** null until latency is measured (ml/results/latency.json). */
  latencyMs: number | null;
  sizeMB: number | null;
  datasetVersion: string | null;
  /** Hardware the run trained on, e.g. "Apple M5 GPU" or a Colab T4. */
  device: string | null;
};

export type Experiments = {
  isMock: boolean;
  updatedAt: string | null;
  protocol: string;
  championRule: string;
  champion: string;
  championModelName: string;
  runs: ExperimentRun[];
  dataset: {
    name: string;
    source: string;
    licence: string;
    classes: string[];
    images: { train: number | null; val: number | null; test: number | null };
    split: string;
    notes: string;
  };
};

/** Shown for a text field the results file does not have. It is not data. */
export const NOT_IN_FILE = "Not in the results file yet";

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: unknown, fallback: string) => (typeof v === "string" && v ? v : fallback);
const strOrNull = (v: unknown): string | null => (typeof v === "string" && v ? v : null);

/** Turns either file shape (placeholder or real export) into one Experiments object. */
export function normaliseExperiments(input: unknown): Experiments {
  const r = (input ?? {}) as Record<string, unknown>;
  const runs = (Array.isArray(r.runs) ? (r.runs as Record<string, unknown>[]) : []).map((x, i) => {
    const id = str(x.id ?? x.run, `E${i}`);
    return {
      id,
      name: str(x.name, id),
      changed: str(x.changed, ""),
      precision: num(x.precision),
      recall: num(x.recall),
      map50: num(x.map50),
      map5095: num(x.map5095 ?? x.map50_95),
      precisionAtRulesConf: num(x.precisionAtRulesConf),
      recallAtRulesConf: num(x.recallAtRulesConf),
      valMap50: num(x.valMap50),
      valRecallAtRulesConf: num(x.valRecallAtRulesConf),
      latencyMs: num(x.latencyMs),
      sizeMB: num(x.sizeMB ?? x.sizeMb),
      datasetVersion: strOrNull(x.datasetVersion),
      device: strOrNull(x.device),
    };
  });
  // The export writes "E8", an older file may say "e8": compare without case.
  const championId = str(r.champion, runs[0]?.id ?? "");
  const champion = runs.find((x) => x.id.toLowerCase() === championId.toLowerCase());
  const d = (r.dataset ?? {}) as Record<string, unknown>;
  const images = (d.images ?? {}) as Record<string, unknown>;
  return {
    isMock: r.isMock !== false,
    updatedAt: strOrNull(r.updatedAt),
    protocol: str(r.protocol, "Same split and seed for every run, one change per run against the baseline (assignment Option A)."),
    championRule: str(r.championRule, "Highest validation mAP50; within 0.01, higher validation recall at confidence 0.40."),
    champion: champion?.id ?? championId,
    championModelName: str(r.championModelName, `jolscan-${(champion?.id ?? championId).toLowerCase()}`),
    runs,
    dataset: {
      name: str(d.name, NOT_IN_FILE),
      source: str(d.source, NOT_IN_FILE),
      licence: str(d.licence, NOT_IN_FILE),
      classes: Array.isArray(d.classes) ? (d.classes as string[]) : [],
      images: { train: num(images.train), val: num(images.val), test: num(images.test) },
      split: str(d.split, NOT_IN_FILE),
      notes: str(d.notes, ""),
    },
  };
}

/**
 * Title for the pothole chart: one sentence with the main finding, computed
 * from the numbers so it stays true after every export.
 */
export function chartTakeaway(runs: ExperimentRun[], championId: string): string {
  const withMap50 = runs.filter((r) => r.map50 !== null);
  if (withMap50.length === 0) return "No pothole run has a test mAP50 yet";
  if (runs.length === 1) {
    return `${runs[0].id} is the only run so far: test mAP50 ${(runs[0].map50 ?? 0).toFixed(2)}`;
  }
  let best = withMap50[0];
  for (const r of withMap50) {
    if ((r.map50 ?? 0) > (best.map50 ?? 0)) best = r;
  }
  if (best.id === championId) return `${best.id} has the highest test mAP50 of all runs`;
  return `${best.id} has the highest test mAP50; ${championId} was chosen on validation`;
}

export const EXPERIMENTS = normaliseExperiments(raw);

/** Drives the "Demo data" badges of the roads module (and the seeded demo analyses). */
export const IS_DEMO_DATA = EXPERIMENTS.isMock;

const EMPTY_RUN: ExperimentRun = {
  id: "–",
  name: "none",
  changed: "No runs yet",
  precision: null,
  recall: null,
  map50: null,
  map5095: null,
  precisionAtRulesConf: null,
  recallAtRulesConf: null,
  valMap50: null,
  valRecallAtRulesConf: null,
  latencyMs: null,
  sizeMB: null,
  datasetVersion: null,
  device: null,
};

export const BASELINE = EXPERIMENTS.runs[0] ?? EMPTY_RUN;
export const CHAMPION = EXPERIMENTS.runs.find((r) => r.id === EXPERIMENTS.champion) ?? BASELINE;

/** Model name as the API reports it, e.g. "jolscan-e8". */
export const CHAMPION_MODEL_NAME = EXPERIMENTS.championModelName;
