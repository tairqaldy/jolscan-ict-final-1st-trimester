import { describe, expect, it } from "vitest";
import { chartTakeaway, EXPERIMENTS, NOT_IN_FILE, normaliseExperiments } from "./experiments";

// Shaped like the file ml/export_results.py writes (ARCHITECTURE.md section 2, ExperimentsFile).
// The numbers are made up for the test; they only check that each field lands in the right place.
const realExport = {
  isMock: false,
  updatedAt: "2026-11-11",
  protocol: "Same frozen split (potholes_yolo_v1), seed 42 and 40 epochs for every run; one change per run against E0.",
  championRule: "Highest validation mAP50; within 0.01, higher validation recall at confidence 0.40.",
  champion: "E0",
  championModelName: "jolscan-e0",
  dataset: {
    name: "Annotated Potholes Image Dataset (version potholes_yolo_v1)",
    source: "Kaggle, https://www.kaggle.com/datasets/chitholian/annotated-potholes-dataset (Atikur Rahman Chitholian)",
    licence: "ODbL (database) and DbCL (contents)",
    classes: ["pothole"],
    images: { train: 465, val: 100, test: 100 },
    split: "Random by image, seed 42, after a duplicate check",
    notes: "Images are not in git.",
  },
  runs: [
    {
      run: "E0",
      changed: "baseline",
      precision: 0.81,
      recall: 0.72,
      map50: 0.79,
      map50_95: 0.45,
      precisionAtRulesConf: 0.83,
      recallAtRulesConf: 0.7,
      latencyMs: null,
      sizeMb: 5.3,
      valMap50: 0.8,
      valRecallAtRulesConf: 0.74,
      datasetVersion: "potholes_yolo_v1",
      device: "Apple M5 GPU",
    },
  ],
};

describe("normaliseExperiments with the real export shape", () => {
  const x = normaliseExperiments(realExport);
  const e0 = x.runs[0];

  it("keeps the file-level fields", () => {
    expect(x.isMock).toBe(false);
    expect(x.updatedAt).toBe("2026-11-11");
    expect(x.champion).toBe("E0");
    expect(x.championModelName).toBe("jolscan-e0");
    expect(x.championRule).toBe(realExport.championRule);
    expect(x.runs).toHaveLength(1);
  });

  it("maps the export's field names onto the run", () => {
    expect(e0.id).toBe("E0");
    expect(e0.name).toBe("E0"); // the export has no name, so the id is used
    expect(e0.changed).toBe("baseline");
    expect(e0.precision).toBe(0.81);
    expect(e0.recall).toBe(0.72);
    expect(e0.map50).toBe(0.79);
    expect(e0.map5095).toBe(0.45); // from map50_95
    expect(e0.precisionAtRulesConf).toBe(0.83);
    expect(e0.recallAtRulesConf).toBe(0.7);
    expect(e0.valMap50).toBe(0.8);
    expect(e0.valRecallAtRulesConf).toBe(0.74);
    expect(e0.sizeMB).toBe(5.3); // from sizeMb
    expect(e0.datasetVersion).toBe("potholes_yolo_v1");
    expect(e0.device).toBe("Apple M5 GPU");
  });

  it("keeps a missing latency as null, not 0", () => {
    expect(e0.latencyMs).toBeNull();
  });

  it("reads the dataset block", () => {
    expect(x.dataset.name).toBe(realExport.dataset.name);
    expect(x.dataset.source).toContain("kaggle.com");
    expect(x.dataset.classes).toEqual(["pothole"]);
    expect(x.dataset.images).toEqual({ train: 465, val: 100, test: 100 });
    expect(x.dataset.split).toBe(realExport.dataset.split);
  });
});

describe("normaliseExperiments with missing values", () => {
  it("keeps missing and null numbers as null instead of turning them into 0", () => {
    const x = normaliseExperiments({ isMock: false, runs: [{ run: "E1", changed: "model width", map50: null, device: null }] });
    const r = x.runs[0];
    for (const v of [r.precision, r.recall, r.map50, r.map5095, r.precisionAtRulesConf, r.recallAtRulesConf]) {
      expect(v).toBeNull();
    }
    expect(r.valMap50).toBeNull();
    expect(r.valRecallAtRulesConf).toBeNull();
    expect(r.latencyMs).toBeNull();
    expect(r.sizeMB).toBeNull();
    expect(r.datasetVersion).toBeNull();
    expect(r.device).toBeNull();
  });

  it("keeps a real 0 as 0", () => {
    const x = normaliseExperiments({ runs: [{ run: "E2", map50: 0 }] });
    expect(x.runs[0].map50).toBe(0);
  });

  it("uses neutral text, not invented facts, when the dataset block is missing", () => {
    const x = normaliseExperiments({ runs: [] });
    expect(x.dataset.name).toBe(NOT_IN_FILE);
    expect(x.dataset.source).toBe(NOT_IN_FILE);
    expect(x.dataset.licence).toBe(NOT_IN_FILE);
    expect(x.dataset.split).toBe(NOT_IN_FILE);
    expect(x.dataset.classes).toEqual([]);
    expect(x.dataset.images).toEqual({ train: null, val: null, test: null });
  });

  it("treats a file without isMock as a placeholder", () => {
    expect(normaliseExperiments({}).isMock).toBe(true);
  });

  it("finds the champion whatever the case of its id", () => {
    const x = normaliseExperiments({ champion: "e1", runs: [{ run: "E0" }, { run: "E1" }] });
    expect(x.champion).toBe("E1");
  });
});

// These hold for the placeholder and for the real export, so they keep passing after M-12.
describe("the shipped results file", () => {
  it("states the selection rule from docs/ML-EXPERIMENT.md and no latency budget", () => {
    expect(EXPERIMENTS.championRule).toContain("validation mAP50");
    expect(EXPERIMENTS.championRule).toContain("0.40");
    expect(JSON.stringify(EXPERIMENTS)).not.toMatch(/latencyBudget|60 ms/);
  });

  it("has a champion that is one of its runs", () => {
    expect(EXPERIMENTS.runs.map((r) => r.id)).toContain(EXPERIMENTS.champion);
  });
});

describe("chartTakeaway", () => {
  it("names the only run when there is just E0", () => {
    const { runs } = normaliseExperiments(realExport);
    expect(chartTakeaway(runs, "E0")).toBe("E0 is the only run so far: test mAP50 0.79");
  });

  it("says when the champion also has the best test mAP50", () => {
    const { runs } = normaliseExperiments({ runs: [{ run: "E0", map50: 0.7 }, { run: "E8", map50: 0.75 }] });
    expect(chartTakeaway(runs, "E8")).toBe("E8 has the highest test mAP50 of all runs");
  });

  it("says when another run beats the champion on test", () => {
    const { runs } = normaliseExperiments({ runs: [{ run: "E0", map50: 0.7 }, { run: "E1", map50: 0.76 }, { run: "E8", map50: 0.75 }] });
    expect(chartTakeaway(runs, "E8")).toBe("E1 has the highest test mAP50; E8 was chosen on validation");
  });

  it("does not claim a result when no run has a number", () => {
    const { runs } = normaliseExperiments({ runs: [{ run: "E0" }] });
    expect(chartTakeaway(runs, "E0")).toBe("No pothole run has a test mAP50 yet");
  });
});
