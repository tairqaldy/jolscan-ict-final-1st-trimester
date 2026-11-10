/**
 * Roads (pothole) experiment results, data/experiments.json.
 *
 * The shipped file is a PLACEHOLDER (isMock true). ml/export_results.py
 * overwrites it with the real runs in the ExperimentsFile shape from
 * ARCHITECTURE.md section 2 (`run`, `map50_95`, `sizeMb`, nullable
 * `latencyMs`, no dataset block). This loader accepts both shapes and fills
 * anything missing with clearly labelled defaults, so the model page keeps
 * working whichever file is committed. Its `isMock` flag drives the
 * "Demo data" badges of the roads module.
 */
import raw from "@/data/experiments.json";

export type ExperimentRun = {
  id: string;
  name: string;
  changed: string;
  precision: number;
  recall: number;
  map50: number;
  map5095: number;
  /** null until latency is measured (ml/results/latency.json). */
  latencyMs: number | null;
  sizeMB: number | null;
};

export type Experiments = {
  isMock: boolean;
  updatedAt: string | null;
  protocol: string;
  championRule: string;
  latencyBudgetMs: number;
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

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: unknown, fallback: string) => (typeof v === "string" && v ? v : fallback);

function normalise(input: unknown): Experiments {
  const r = (input ?? {}) as Record<string, unknown>;
  const runs = (Array.isArray(r.runs) ? (r.runs as Record<string, unknown>[]) : []).map((x, i) => {
    const id = str(x.id ?? x.run, `e${i}`);
    return {
      id,
      name: str(x.name, id),
      changed: str(x.changed, ""),
      precision: num(x.precision) ?? 0,
      recall: num(x.recall) ?? 0,
      map50: num(x.map50) ?? 0,
      map5095: num(x.map5095 ?? x.map50_95) ?? 0,
      latencyMs: num(x.latencyMs),
      sizeMB: num(x.sizeMB ?? x.sizeMb),
    };
  });
  const championId = str(r.champion, runs[0]?.id ?? "");
  const champion = runs.find((x) => x.id.toLowerCase() === championId.toLowerCase());
  const d = (r.dataset ?? {}) as Record<string, unknown>;
  const images = (d.images ?? {}) as Record<string, unknown>;
  return {
    isMock: r.isMock !== false,
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : null,
    protocol: str(r.protocol, "Same split and seed for every run, one change per run against the baseline (assignment Option A)."),
    championRule: str(r.championRule, "Highest validation mAP50; within 0.01, the higher validation recall at the rules' confidence wins."),
    latencyBudgetMs: num(r.latencyBudgetMs) ?? 60,
    champion: champion?.id ?? championId,
    championModelName: str(r.championModelName, `yolo-${(champion?.id ?? championId).toLowerCase()}`),
    runs,
    dataset: {
      name: str(d.name, "Pothole detection dataset (name and version to be filled in)"),
      source: str(d.source, "To be added"),
      licence: str(d.licence, "To be confirmed from the dataset page"),
      classes: Array.isArray(d.classes) ? (d.classes as string[]) : ["pothole"],
      images: { train: num(images.train), val: num(images.val), test: num(images.test) },
      split: str(d.split, "To be filled in"),
      notes: str(d.notes, ""),
    },
  };
}

export const EXPERIMENTS = normalise(raw);

/** Drives the "Demo data" badges of the roads module (and the seeded demo analyses). */
export const IS_DEMO_DATA = EXPERIMENTS.isMock;

const EMPTY_RUN: ExperimentRun = { id: "–", name: "none", changed: "No runs yet", precision: 0, recall: 0, map50: 0, map5095: 0, latencyMs: null, sizeMB: null };

export const BASELINE = EXPERIMENTS.runs[0] ?? EMPTY_RUN;
export const CHAMPION = EXPERIMENTS.runs.find((r) => r.id === EXPERIMENTS.champion) ?? BASELINE;

/** Model name as the API reports it, e.g. "yolo26n-e7". */
export const CHAMPION_MODEL_NAME = EXPERIMENTS.championModelName;
