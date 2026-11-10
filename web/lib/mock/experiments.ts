/**
 * PLACEHOLDER VALUES. data/experiments.json is invented until the Model lane
 * pastes the real MLflow results there. Its `isMock` flag is the single switch
 * that drives every "Demo data" badge in the app (see IS_DEMO_DATA).
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
  latencyMs: number;
  sizeMB: number;
};

export type Experiments = {
  isMock: boolean;
  updatedAt: string;
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

export const EXPERIMENTS = raw as Experiments;

/** The one flag behind every "Demo data" badge. */
export const IS_DEMO_DATA = EXPERIMENTS.isMock;

export const BASELINE = EXPERIMENTS.runs[0];
export const CHAMPION = EXPERIMENTS.runs.find((r) => r.id === EXPERIMENTS.champion) ?? BASELINE;

/** Model name as the API reports it, e.g. "yolo26n-e7". */
export const CHAMPION_MODEL_NAME = EXPERIMENTS.championModelName;
