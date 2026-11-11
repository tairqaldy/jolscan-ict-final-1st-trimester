import "server-only";
import type { RestroomSample } from "@/lib/mock/restroom-samples";
import { pickBestMatch, sortCandidates } from "@/lib/signage/match";
import { GENDERS, type CompareResult, type Gender, type MatchResult, type Provider, type SignPrediction } from "@/lib/types";
import { cloudTarget } from "./cloud";
import { PREDICT_TIMEOUT_MS } from "./env";
import { networkError, readPublicImage, url, type HttpTarget } from "./http";
import { localTarget } from "./local";
import type { RestroomProvider, SignInput } from "./restroom-types";
import { ProviderError } from "./types";

/**
 * Local and cloud restroom providers: POST multipart to the model service's
 * /restroom/compare (a, b) and /restroom/match (query, gallery repeated), the
 * contract in ARCHITECTURE.md 2b. Same timeouts and errors as /predict.
 */

async function imageOf(sign: SignInput) {
  if (sign.image) return sign.image;
  if (sign.sample) return readPublicImage(sign.sample.file, sign.sample.title);
  throw new ProviderError("unsupported_input", "No image to send.", 400);
}

const blob = (img: { bytes: Uint8Array; type: string }) => new Blob([img.bytes as BlobPart], { type: img.type });

async function post(target: HttpTarget, route: string, form: FormData): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url(target, route), {
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
      res.status === 404 ? "bad_response" : "rejected",
      res.status === 404
        ? `The ${target.provider} model service has no ${route} endpoint.`
        : `The ${target.provider} model service rejected the images: ${detail}`,
      res.status === 400 ? 400 : 502,
      res.status === 404 ? "Update the api/ service to a version with the restroom endpoints (ARCHITECTURE.md 2b)." : undefined,
    );
  }
  return body;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function badResponse(provider: Provider, what: string): never {
  throw new ProviderError(
    "bad_response",
    `The ${provider} model service answered, but not with the expected ${what} JSON.`,
    502,
    "Compare the service response with the contract in docs/ARCHITECTURE.md, section 2b.",
  );
}

function prediction(value: unknown): SignPrediction | null {
  const v = value as { gender?: unknown; confidence?: unknown } | null;
  if (!v || !GENDERS.includes(v.gender as Gender) || !Number.isFinite(Number(v.confidence))) return null;
  return { gender: v.gender as Gender, confidence: clamp01(Number(v.confidence)) };
}

export function normaliseCompare(body: unknown, provider: Provider): CompareResult {
  const b = body as Record<string, unknown> | null;
  const a = prediction(b?.a);
  const bb = prediction(b?.b);
  const similarity = Number(b?.similarity);
  if (!b || !a || !bb || !Number.isFinite(similarity)) badResponse(provider, "CompareResult");
  return {
    provider,
    model: String(b.model ?? "unknown"),
    latencyMs: Math.round(Number(b.latencyMs) || 0),
    a,
    b: bb,
    similarity: clamp01(similarity),
  };
}

/** Candidate ids from the service are "0", "1", … in upload order; map them back to sample ids. */
export function normaliseMatch(body: unknown, provider: Provider, gallery: RestroomSample[]): MatchResult {
  const b = body as Record<string, unknown> | null;
  const query = prediction(b?.query);
  if (!b || !query || !Array.isArray(b.candidates)) badResponse(provider, "MatchResult");
  const idOf = (raw: unknown): string | null => {
    const s = String(raw);
    if (/^\d+$/.test(s) && gallery[Number(s)]) return gallery[Number(s)].id;
    return gallery.some((g) => g.id === s) ? s : null;
  };
  const candidates = (b.candidates as Record<string, unknown>[]).map((c) => {
    const id = idOf(c?.id);
    const p = prediction(c?.prediction);
    const similarity = Number(c?.similarity);
    if (!id || !p || !Number.isFinite(similarity)) badResponse(provider, "MatchResult");
    return { id, similarity: clamp01(similarity), prediction: p };
  });
  const sorted = sortCandidates(candidates);
  const given = b.bestMatchId === null || b.bestMatchId === undefined ? null : idOf(b.bestMatchId);
  return {
    provider,
    model: String(b.model ?? "unknown"),
    latencyMs: Math.round(Number(b.latencyMs) || 0),
    query,
    candidates: sorted,
    bestMatchId: given ?? pickBestMatch(query.gender, sorted),
  };
}

function httpRestroom(id: Provider, target: () => HttpTarget): RestroomProvider {
  return {
    id,
    async compare({ a, b }) {
      const t = target();
      const [imgA, imgB] = await Promise.all([imageOf(a), imageOf(b)]);
      const form = new FormData();
      form.set("a", blob(imgA), imgA.name);
      form.set("b", blob(imgB), imgB.name);
      return normaliseCompare(await post(t, "/restroom/compare", form), t.provider);
    },
    async match({ query, gallery }) {
      const t = target();
      // A real model cannot read the SVG drawings, so only the real signs are sent as the gallery.
      const real = gallery.filter((s) => !s.file.toLowerCase().endsWith(".svg"));
      if (real.length === 0) {
        throw new ProviderError(
          "unsupported_input",
          `All ${gallery.length} signs in the match gallery are SVG drawings, which a real model cannot read.`,
          422,
          "Switch the provider to mock, or add real JPEG, PNG or WebP signs to public/samples/restrooms/samples.json.",
        );
      }
      const imgQ = await imageOf(query);
      const imgs = await Promise.all(real.map((s) => imageOf({ sample: s })));
      const form = new FormData();
      form.set("query", blob(imgQ), imgQ.name);
      for (const img of imgs) form.append("gallery", blob(img), img.name);
      return normaliseMatch(await post(t, "/restroom/match", form), t.provider, real);
    },
  };
}

export const restroomLocalProvider = httpRestroom("local", localTarget);
export const restroomCloudProvider = httpRestroom("cloud", cloudTarget);
