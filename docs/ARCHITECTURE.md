# Architecture

Qarau (қарау, "to inspect") checks public infrastructure from photos. Each module pairs a vision model with rules the team defines:

- **Roads:** an object-detection model finds potholes in a road photo, and the rules turn the detections into a repair priority.
- **Restrooms:** CLIP predicts the gender shown on restroom door signs and how alike two signs are, and the rules say whether the signage is clear (section 2b).

This file is the contract between the three code areas. If you change a type here, tell the other lanes.

## 1. System at a glance

```
Browser (Next.js UI: landing, platform overview, per-module pages, analytics, model, settings)
   │  POST /api/analyze  (roads: file, provider)      POST /api/restroom  (compare | match, provider)
   ▼
Next.js route handlers ── apply the rules (web/lib/rules, web/lib/signage) ──► Analysis JSON
   │  pick one provider (set in Settings):
   ├── mock   : canned results for the bundled samples (works offline, the demo default)
   ├── local  : FastAPI on http://localhost:8000  (/predict, /restroom/compare, /restroom/match) on the laptop
   └── cloud  : the same FastAPI service on a Hugging Face Docker Space, same weights

ml/            (Colab + Ultralytics + MLflow) ──► jolscan-e8.pt ──┐
ml/restroom/   (CLIP, laptop CPU or Colab)    ──► restroom model ─┴──► api/ (FastAPI, and a Gradio demo)
```

Provider default, the same everywhere: the demo default is `mock` (works offline). With the model service running, the app uses `local`. `cloud` is opt-in. Local and cloud serve the same weights file, the one in the results table. The model that Roboflow trained on 3 November is not used.

Three folders, three lanes, one JSON contract:

| Folder | What lives there | Owner lane |
|---|---|---|
| `web/` | Next.js app: every page, the design system, mock data, both rule engines, the provider switch | Design/Frontend |
| `api/` | FastAPI service for both modules, Gradio demo app, Dockerfile | Serving |
| `ml/`  | Pothole training and export scripts; `ml/restroom/` for the restroom runs; results tables and plots | Models |
| `data/` | Only a README and small sample photos. Datasets are never committed | Data |
| `docs/` | Plan, tasks, this file, course grounding, presentation | Everyone |

## 2. The contract

All boxes are normalised to the image size (0..1). `x`,`y` are the top-left corner.

```ts
type Detection = {
  id: string;
  label: "pothole";
  confidence: number;               // 0..1
  box: { x: number; y: number; w: number; h: number };
};

type InferenceResult = {
  provider: "mock" | "local" | "cloud";
  model: string;                    // the weights file name, e.g. "jolscan-e8"
  imageWidth: number;
  imageHeight: number;
  latencyMs: number;                // model time only
  detections: Detection[];
};
```

Model service (`api/`), the same for local and cloud:

```
GET  /health   → { "status": "ok", "model": "jolscan-e8", "device": "cpu" }
POST /predict  multipart/form-data: file=<jpeg|png|webp>, conf=<float, optional, default 0.25>
               → 200 InferenceResult
               → 400 { "detail": "..." } for a non-image or a file over 10 MB
```

Web app (`web/app/api/analyze`): accepts `file` (or `sampleId`) and `provider`, calls the provider, then applies the rules and returns:

```ts
type RuleHit = { ruleId: string; title: string; detail: string; points: number };

type Analysis = InferenceResult & {
  id: string;
  createdAt: string;                // ISO
  severity: "clear" | "low" | "medium" | "high" | "critical";
  score: number;
  needsReview: boolean;             // some detection is below the confidence threshold
  ruleHits: RuleHit[];
  recommendedAction: string;
  slaHours: number | null;
  location?: { lat: number; lng: number; label: string };
};
```

Results file, written by `ml/export_results.py` and read by the model page (`web/data/experiments.json`):

```ts
type ExperimentsFile = {
  isMock: boolean;                  // true only for the placeholder file shipped with the scaffold
  updatedAt: string;                // date of the export, YYYY-MM-DD
  protocol: string;                 // what every run keeps fixed
  championRule: string;             // the selection rule in words (docs/ML-EXPERIMENT.md)
  champion: string;                 // run id chosen by the selection rule, e.g. "E8"
  championModelName: string;        // what the API reports for the served weights, e.g. "jolscan-e8"
  dataset: {                        // from the dataset card (data/README.md, D-1) and the split manifest
    name: string; source: string; licence: string; classes: string[];
    images: { train: number; val: number; test: number };
    split: string; notes: string;
  };
  runs: Array<{
    run: string;                    // "E0" .. "E8"
    changed: string;                // what this run changed against the baseline
    precision: number; recall: number; map50: number; map50_95: number;   // test split
    precisionAtRulesConf: number; recallAtRulesConf: number;               // test split, confidence 0.40
    latencyMs: number | null;       // batch size 1, from ml/results/latency.json
    sizeMb: number;
    valMap50: number; valRecallAtRulesConf: number;                        // used only to pick the champion
    datasetVersion: string;
    device: string | null;          // hardware the run trained on, from the run file
  }>;
};
```

Two thresholds, not to be confused: the model service's `conf` (default 0.25) is how low it reports boxes. The rules' counting threshold τ (default 0.40) is a rules setting in the web app.

The model service returns detections only. Rules are applied in one place, `web/lib/rules`, so mock, local and cloud results are scored identically. The rules themselves are specified in [RULES.md](RULES.md).

## 2b. Restroom signs module

The second module works on restroom door signs (icons only; the photos contain no people). Data and task come from the IOAI 2025 "Restroom Icon Matching" task (CC-BY-4.0). The model is CLIP: one image encoder turns every sign into an embedding, and two things are computed from embeddings:

- **Gender prediction**: male or female, from a classifier on the embedding (zero-shot text prompts as the baseline, a scikit-learn logistic-regression probe or a fine-tuned head as the improvement).
- **Similarity**: cosine similarity of two embeddings, scaled to 0..1 as `(cos + 1) / 2`, the same scaling as the IOAI baseline. High similarity means "same design set".

```ts
type Gender = "male" | "female";
type SignPrediction = { gender: Gender; confidence: number };   // confidence of the predicted class, 0..1

type CompareResult = {             // two signs, e.g. the two doors of one restroom
  provider: "mock" | "local" | "cloud";
  model: string;                   // e.g. "clip-vitb32-ft6"
  latencyMs: number;
  a: SignPrediction;
  b: SignPrediction;
  similarity: number;              // 0..1
};

type MatchResult = {               // one query sign against a gallery of signs
  provider: "mock" | "local" | "cloud";
  model: string;
  latencyMs: number;
  query: SignPrediction;
  candidates: Array<{ id: string; similarity: number; prediction: SignPrediction }>;  // sorted, most similar first
  bestMatchId: string | null;      // most similar candidate of the opposite gender
};
```

Model service endpoints, next to `/predict`:

```
POST /restroom/compare  multipart: a=<image>, b=<image>                      → 200 CompareResult
POST /restroom/match    multipart: query=<image>, gallery=<image> (repeated)  → 200 MatchResult (candidate ids are "0", "1", … in upload order)
```

Same validation as `/predict`: JPEG, PNG or WebP, 10 MB per file, at most 60 gallery files.

The web app applies the signage rules (RULES.md, part 2) to a `CompareResult` and returns:

```ts
type SignageVerdict = "clear" | "review" | "confusing";
type SignageAnalysis = CompareResult & {
  id: string;
  createdAt: string;
  verdict: SignageVerdict;
  ruleHits: Array<{ ruleId: string; title: string; detail: string; passed: boolean }>;
  recommendedAction: string;
  doors?: { mens: "a" | "b"; pMaleA: number; pMaleB: number; margin: number };  // pairwise reading, RULES.md part 2
};
```

Results file for the restroom experiment, written by `ml/restroom/export_results.py` and read by the model page (`web/data/restroom-experiments.json`):

```ts
type RestroomExperimentsFile = {
  isMock: boolean;                 // true while any number in it is a placeholder
  champion: string | null;         // run id chosen on validation, e.g. "R4"
  reference: { ioaiBaseline: 0.77; ioaiBest: 0.90; note: string };  // published by the IOAI committee, test set (Leaderboard B). Not our runs
  runs: Array<{
    run: string;                   // "R0" .. "R8"
    changed: string;               // what this run changed against the baseline
    isReal: boolean;               // false for placeholder rows
    matchTop1Val: number | null;   // share of the 10 validation queries matched correctly
    matchTop1Test: number | null;  // share of the 30 test queries matched correctly
    genderAccCv: number | null;    // gender accuracy, 5-fold cross-validation on the training set, grouped by restroom
    latencyMs: number | null;      // per image, batch size 1
    device: string | null;         // e.g. "Apple M3 CPU", "Colab T4"
  }>;                              // R7 is the two-step pipeline (no training): genderAccCv and latencyMs are null
  served?: string | null;          // run id whose method /restroom/match runs; null until the API runs the pipeline (C-8)
  servedNote?: string;             // what the app serves today, in words
  pipeline?: {                     // every approach of ml/restroom/pipeline.py (task C-12)
    champion: string;              // chosen on training episodes, then validation; test read once
    served: string | null;
    selection: string;
    trainEpisodesProtocol: string;
    approaches: Array<{ name: string; label: string; val: number; test: number; trainEpisodes: number; trainEpisodesStd: number }>;
  };
  layers?: Array<{                 // the layer sweep, mean over 3 seeds (ml/results/restroom/layers.csv, task C-11)
    backbone: "clip" | "resnet";
    n_trained: number;             // CLIP: last N of 12 transformer blocks; ResNet50: last N of 5 stages
    trainable_params: number;
    pair_top1_heldout_vs_all164: number;      // partner found first among all 164 originals, held-out restrooms
    pair_top1_heldout_vs_all164_std: number;  // across seeds
    pair_top1_train: number;       // the same on the training restrooms: the overfitting gap
    gender_acc_heldout: number;
    best: boolean;                 // the best N per backbone (ties within 0.005 go to fewer parameters)
  }>;
};
```

Web route: `POST /api/restroom` with `mode=compare` (fields `a`, `b` or `sampleA`, `sampleB`) or `mode=match` (field `query` or `sampleQuery`; the gallery is the bundled sample set), plus `provider`.

## 3. Decisions and why

Each decision names the course source the team can cite at the defense. Page references are to the digests in `docs/research/`.

| Decision | Choice | Why | Course source |
|---|---|---|---|
| Vision task | Object detection, not classification | We need to know where and how large each pothole is to score severity. Detection is the second rung of the task ladder | Lec8 p11, p40 |
| Model family | Ultralytics YOLO (one-stage detector), small variants | One-stage detectors run in real time, and the lecture points to Ultralytics YOLO directly | Lec8 p40 |
| Training approach | Fine-tune COCO-pretrained weights | Transfer learning: reuse a pretrained backbone, augment, fine-tune. Our dataset is small | Lec8 p38 |
| Why a CNN detector, not a ViT | CNN | CNNs fit "efficiency, small data", ViT needs large data and compute | Lec8 p54 |
| Assignment option | Option A: change model choices, compare against a fixed baseline | One variable per run, same split and seed | A2 p1, Lab 8 Mission 4 |
| Metrics | mAP50 as the primary metric, recall at the app's threshold as the tie-break, plus precision, mAP50-95, latency and model size | IoU and mAP are the detection metrics, and the lecture says to report the protocol. Latency is a tracked metric in MLOps | Lec8 p42, Lec9 p34 |
| Experiment tracking | MLflow runs for every experiment, plus one committed result file per run | Same tool and pattern as Lab 8. The files exist because MLflow's local store cannot be merged across Colab accounts | Lec9 p34–38, Lab 8 |
| Serving | FastAPI `/predict`, containerised | The serving pattern shown in the lecture | Lec9 p53, p20 |
| Course-taught demo | Gradio app, deployable to Hugging Face Spaces | Gradio gives a quick demo with a built-in API. Streamlit suits dashboards | Lec9 p50–52 |
| Custom web app in addition | Next.js UI calling the same API | The assignment rewards an interface that feels like an MVP. The Gradio app stays as the course-standard fallback | A2 p1 |
| Local and cloud modes | Provider switch in Settings | Deployment patterns Online and Edge. Local keeps photos on the device, cloud trades privacy and cost for capacity | Lec9 p42, Lec7 p19 |
| Cloud is opt-in | The app starts on mock (demo data) and uses local once a model is connected. Cloud must be chosen in Settings | Road photos can show faces and plates. Personal and biometric data must not go to external AI services | Syl p.9 |
| Rules after the model | Deterministic, editable rules turn boxes into a priority | "Rules still matter" for simple controlled steps, and the decision stays explainable | Lec8 p66 |
| Human review flag | Low-confidence detections are flagged, not hidden | Least-confident predictions deserve a second look | Lab 6 |
| Secrets | API keys only in environment variables, never in git | Shared responsibility, "no keys in code" | Lec9 p16, p26 |
| Storage in the prototype | Mock JSON and browser storage. Target schema is relational | Normalised tables with primary and foreign keys, as in Lab 3 | Lab 3, Module 3 digest |
| Monitoring page | Latency, error rate, confidence distribution over time, drift note | What to track after deployment | Lec9 p43 |
| Team workflow | Feature branch, pull request, CI on push | Git workflow from the lecture | Lec9 p25, p41 |

## 4. Target data model (not built in the prototype)

The prototype keeps data in `web/lib/mock`. The schema it stands in for:

```sql
CREATE TABLE photos     (id TEXT PRIMARY KEY, uploaded_at TEXT NOT NULL, filename TEXT NOT NULL,
                         width INTEGER, height INTEGER, lat REAL, lng REAL, road_class TEXT);
CREATE TABLE analyses   (id TEXT PRIMARY KEY, photo_id TEXT NOT NULL REFERENCES photos(id),
                         provider TEXT CHECK (provider IN ('mock','local','cloud')), model TEXT,
                         latency_ms INTEGER, severity TEXT, score REAL, needs_review INTEGER, created_at TEXT);
CREATE TABLE detections (id TEXT PRIMARY KEY, analysis_id TEXT NOT NULL REFERENCES analyses(id),
                         confidence REAL, x REAL, y REAL, w REAL, h REAL);
CREATE TABLE rules      (id TEXT PRIMARY KEY, title TEXT, enabled INTEGER, params_json TEXT);
CREATE TABLE rule_hits  (analysis_id TEXT REFERENCES analyses(id), rule_id TEXT REFERENCES rules(id),
                         points REAL, detail TEXT, PRIMARY KEY (analysis_id, rule_id));
```

## 5. MLOps position

We are at MLOps Level 0, manual (Lec9 p32): training is started by hand and deployment is a file copy. What we do have from the higher levels: a named dataset version, every run tracked, a written rule for promoting a model, a containerised service. Level 1 would need an automated training pipeline with validation gates, and Level 2 adds CI/CD and continuous training. The dashboard's monitoring charts run on demo data in the prototype.

Lifecycle mapping (Lec9 p31): Collect and validate data (`data/`, Roboflow dataset version) → Train and evaluate (`ml/`, MLflow) → Deploy (`api/`, Docker, Spaces) → Monitor (`web/` analytics page) → back to data (review queue of low-confidence photos).

## 6. Environment variables

| Variable | Used by | Meaning |
|---|---|---|
| `MODEL_API_URL` | web (server side) | Local model service, default `http://localhost:8000` |
| `CLOUD_MODEL_API_URL` | web (server side) | Hosted model service URL |
| `MODEL_WEIGHTS` | api | Path to the weights file, default `weights/jolscan-e8.pt` |
| `PROVIDER_NAME` | api | `local` (default) or `cloud`, echoed in the response |

Copy `web/.env.example` to `web/.env.local`. Never commit `.env.local`.
