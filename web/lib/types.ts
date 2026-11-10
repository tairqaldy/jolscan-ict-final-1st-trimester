/**
 * Contract types. Source of truth: docs/ARCHITECTURE.md section 2.
 * If you change a contract type here, update ARCHITECTURE.md and tell the
 * api/ and ml/ lanes.
 */

// ---------------------------------------------------------------------------
// Contract (copied exactly from ARCHITECTURE.md)
// ---------------------------------------------------------------------------

export type Provider = "mock" | "local" | "cloud";

export type Detection = {
  id: string;
  label: "pothole";
  confidence: number; // 0..1
  /** Normalised to the image size (0..1). x, y are the top-left corner. */
  box: { x: number; y: number; w: number; h: number };
};

export type InferenceResult = {
  provider: Provider;
  model: string; // e.g. "yolo26n-e7"
  imageWidth: number;
  imageHeight: number;
  latencyMs: number; // model time only
  detections: Detection[];
};

export type Severity = "clear" | "low" | "medium" | "high" | "critical";

export type RuleHit = { ruleId: string; title: string; detail: string; points: number };

export type Analysis = InferenceResult & {
  id: string;
  createdAt: string; // ISO
  severity: Severity;
  score: number;
  needsReview: boolean; // some detection is below the confidence threshold
  ruleHits: RuleHit[];
  recommendedAction: string;
  slaHours: number | null;
  location?: { lat: number; lng: number; label: string };
};

// ---------------------------------------------------------------------------
// Web-only additions (not part of the model-service contract)
// ---------------------------------------------------------------------------

export type RoadClass = "residential" | "arterial" | "highway";

/** Optional photo metadata the rules use (RULES.md "Inputs"). */
export type PhotoMeta = {
  roadClass?: RoadClass;
  schoolZone?: boolean;
};

/**
 * What the web app stores and shows. It is a contract `Analysis` plus an
 * additive `photo` block so a result can be re-scored and re-displayed later.
 * `/api/analyze` returns this shape; every contract field is present.
 */
export type StoredAnalysis = Analysis & {
  photo: PhotoMeta & {
    sampleId?: string;
    fileName?: string;
    /** /samples/... for bundled photos, a small data: URL for uploads, or undefined. */
    imageUrl?: string;
  };
};

export const SEVERITIES: Severity[] = ["clear", "low", "medium", "high", "critical"];
export const PROVIDERS: Provider[] = ["mock", "local", "cloud"];
export const ROAD_CLASSES: RoadClass[] = ["residential", "arterial", "highway"];
