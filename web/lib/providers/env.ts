import "server-only";

/**
 * Server-only environment. Never import this from a client component: the
 * `server-only` import makes the build fail if someone does.
 * Variables are documented in docs/ARCHITECTURE.md section 6 and .env.example.
 */
export const env = {
  /** Local FastAPI model service. */
  modelApiUrl: (process.env.MODEL_API_URL || "http://localhost:8000").replace(/\/+$/, ""),
  /** Hosted model service (HF Space / Roboflow). Empty means "not configured". */
  cloudModelApiUrl: (process.env.CLOUD_MODEL_API_URL || "").replace(/\/+$/, ""),
  /** Only needed when the cloud provider is Roboflow's hosted API. */
  roboflowApiKey: process.env.ROBOFLOW_API_KEY || "",
};

/** How long to wait for a model service before giving up. */
export const PREDICT_TIMEOUT_MS = 20_000;
export const HEALTH_TIMEOUT_MS = 3_000;
