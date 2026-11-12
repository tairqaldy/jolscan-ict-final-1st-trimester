import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Detection, InferenceResult, Provider } from "@/lib/types";
import { HEALTH_TIMEOUT_MS, PREDICT_TIMEOUT_MS } from "./env";
import { ProviderError, type HealthResult, type PredictInput } from "./types";

/**
 * Shared HTTP client for the local and cloud model services. Both speak the
 * contract in ARCHITECTURE.md: GET /health, POST /predict (multipart file + conf).
 */

export type HttpTarget = {
  provider: Provider;
  baseUrl: string;
  /** Extra query params, e.g. a Roboflow api_key. Added on the server only. */
  query?: Record<string, string>;
  /** Shown to the user in error hints, e.g. "MODEL_API_URL". */
  envName: string;
};

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Read a bundled file from public/ (e.g. "/samples/s01.jpg") for sending to a
 * real model. SVG drawings are refused with a 422: a real model cannot read
 * them. On Vercel the files are bundled with the route through
 * `outputFileTracingIncludes` in next.config.ts; nothing is ever written.
 */
export async function readPublicImage(file: string, title: string) {
  const ext = path.extname(file).toLowerCase();
  const type = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
  if (!PHOTO_TYPES.includes(type)) {
    throw new ProviderError(
      "unsupported_input",
      `Sample "${title}" is an SVG drawing, which a real model cannot read.`,
      422,
      "Upload a real JPEG, PNG or WebP photo, or switch to the Mock provider in Settings.",
    );
  }
  const bytes = await readFile(path.join(process.cwd(), "public", file));
  return { bytes: new Uint8Array(bytes), type, name: path.basename(file) };
}

/** The bytes to send: the upload, or a bundled sample read from public/. */
async function resolveImage(input: PredictInput) {
  if (input.image) return input.image;
  if (!input.sample) throw new ProviderError("unsupported_input", "No image to send.", 400);
  return readPublicImage(input.sample.file, input.sample.title);
}

export function url(target: HttpTarget, route: string) {
  const u = new URL(target.baseUrl + route);
  for (const [k, v] of Object.entries(target.query ?? {})) u.searchParams.set(k, v);
  return u;
}

export function networkError(err: unknown, target: HttpTarget, timeoutMs: number): ProviderError {
  const name = (err as { name?: string })?.name;
  if (name === "TimeoutError" || name === "AbortError") {
    return new ProviderError(
      "timeout",
      `The ${target.provider} model service did not answer within ${timeoutMs / 1000} s.`,
      504,
      "Check that the service is running and not overloaded, then try again.",
    );
  }
  return new ProviderError(
    "unreachable",
    target.provider === "local"
      ? "The local model service is not running or cannot be reached."
      : "The cloud model service cannot be reached.",
    503,
    target.provider === "local"
      ? `Start it from the api/ folder (uvicorn on port 8000) or set ${target.envName} in web/.env.local. You can switch to the mock provider in Settings meanwhile.`
      : `Check ${target.envName} in web/.env.local and that the hosted service is awake. You can switch to the mock provider in Settings meanwhile.`,
  );
}

export async function httpPredict(target: HttpTarget, input: PredictInput): Promise<InferenceResult> {
  const image = await resolveImage(input);
  const form = new FormData();
  form.set("file", new Blob([image.bytes as BlobPart], { type: image.type }), image.name);
  form.set("conf", String(input.conf));

  let res: Response;
  try {
    res = await fetch(url(target, "/predict"), {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(PREDICT_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    throw networkError(err, target, PREDICT_TIMEOUT_MS);
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = typeof body?.detail === "string" ? body.detail : `HTTP ${res.status}`;
    throw new ProviderError(
      "rejected",
      `The ${target.provider} model service rejected the image: ${detail}`,
      res.status === 400 ? 400 : 502,
    );
  }
  return normaliseInference(body, target.provider);
}

export async function httpHealth(target: HttpTarget): Promise<HealthResult> {
  const started = performance.now();
  try {
    const res = await fetch(url(target, "/health"), {
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
      cache: "no-store",
    });
    const body = await res.json().catch(() => ({}));
    const latencyMs = Math.round(performance.now() - started);
    return {
      ok: res.ok && body?.status === "ok",
      provider: target.provider,
      status: res.ok ? String(body?.status ?? "unknown") : `HTTP ${res.status}`,
      model: typeof body?.model === "string" ? body.model : undefined,
      device: typeof body?.device === "string" ? body.device : undefined,
      latencyMs,
    };
  } catch (err) {
    const e = networkError(err, target, HEALTH_TIMEOUT_MS);
    return {
      ok: false,
      provider: target.provider,
      status: e.code,
      latencyMs: Math.round(performance.now() - started),
      message: `${e.message} ${e.hint ?? ""}`.trim(),
    };
  }
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Accepts the contract InferenceResult. Also accepts Roboflow's hosted
 * response ({ image: {width,height}, predictions: [{x,y,width,height,confidence}] }
 * with centre-based pixel boxes) so the cloud lane can use either backend.
 */
export function normaliseInference(body: unknown, provider: Provider): InferenceResult {
  const b = body as Record<string, unknown> | null;
  if (b && Array.isArray(b.detections)) {
    const detections = (b.detections as Detection[]).map((d, i) => ({
      id: String(d.id ?? `d${i + 1}`),
      label: "pothole" as const,
      confidence: clamp01(Number(d.confidence)),
      box: {
        x: clamp01(Number(d.box?.x)),
        y: clamp01(Number(d.box?.y)),
        w: clamp01(Number(d.box?.w)),
        h: clamp01(Number(d.box?.h)),
      },
    }));
    return {
      provider,
      model: String(b.model ?? "unknown"),
      imageWidth: Number(b.imageWidth) || 0,
      imageHeight: Number(b.imageHeight) || 0,
      latencyMs: Math.round(Number(b.latencyMs) || 0),
      detections,
    };
  }
  if (b && Array.isArray(b.predictions) && b.image && typeof b.image === "object") {
    const { width, height } = b.image as { width: number; height: number };
    const detections = (b.predictions as Record<string, number>[]).map((p, i) => ({
      id: String(p.detection_id ?? `d${i + 1}`),
      label: "pothole" as const,
      confidence: clamp01(Number(p.confidence)),
      box: {
        x: clamp01((p.x - p.width / 2) / width),
        y: clamp01((p.y - p.height / 2) / height),
        w: clamp01(p.width / width),
        h: clamp01(p.height / height),
      },
    }));
    return {
      provider,
      model: String(b.model ?? "roboflow-hosted"),
      imageWidth: width,
      imageHeight: height,
      latencyMs: Math.round(Number(b.time ?? 0) * 1000),
      detections,
    };
  }
  throw new ProviderError(
    "bad_response",
    `The ${provider} model service answered, but not with the expected InferenceResult JSON.`,
    502,
    "Compare the service response with the contract in docs/ARCHITECTURE.md.",
  );
}
