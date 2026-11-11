/**
 * POST /api/restroom  (multipart/form-data), ARCHITECTURE.md section 2b
 *
 *   mode        "compare" | "match"                          required
 *   provider    "mock" | "local" | "cloud"                   default "mock"
 *
 *   mode=compare
 *     a, b              images (jpeg | png | webp, max 10 MB each)   or
 *     sampleA, sampleB  ids from public/samples/restrooms/samples.json (each sign can mix: a upload + sampleB)
 *     rules             JSON SignageConfig from the Rules page   optional, defaults from lib/signage/config.ts
 *     place             free-text label, e.g. "Library, floor 2" optional
 *     -> 200 StoredSignageCheck (contract SignageAnalysis + `inputs` block)
 *
 *   mode=match
 *     query | sampleQuery   one sign. The gallery is the bundled sample set (minus the query sample).
 *     -> 200 WebMatchResult (contract MatchResult, candidate ids are sample ids, + `queryInput`)
 *
 * 4xx/5xx -> { error: { code, message, hint? } }
 */
import { NextResponse } from "next/server";
import { ioaiGallery } from "@/lib/mock/restroom-ioai-galleries";
import { RESTROOM_SAMPLES, getRestroomSample } from "@/lib/mock/restroom-samples";
import { getRestroomProvider, isProvider, ProviderError, type SignInput } from "@/lib/providers";
import { buildSignageCheck, normaliseSignage } from "@/lib/signage";
import type { SignInputInfo, StoredSignageCheck, WebMatchResult } from "@/lib/types";
import { validateImageFile, type ApiError } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(status: number, code: string, message: string, hint?: string) {
  return NextResponse.json<ApiError>({ error: { code, message, ...(hint ? { hint } : {}) } }, { status });
}

class InputError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Reads one sign from the form: an upload in `fileField` or a sample id in `sampleField`. */
async function readSign(form: FormData, fileField: string, sampleField: string, label: string): Promise<{ sign: SignInput; info: SignInputInfo }> {
  const file = form.get(fileField);
  if (file instanceof File) {
    const problem = validateImageFile(file);
    if (problem) throw new InputError("invalid_image", `${label}: ${problem}`);
    const name = file.name || "upload";
    return { sign: { image: { bytes: new Uint8Array(await file.arrayBuffer()), type: file.type, name } }, info: { fileName: name } };
  }
  const id = form.get(sampleField);
  if (typeof id === "string" && id) {
    const sample = getRestroomSample(id);
    if (!sample) throw new InputError("unknown_sample", `There is no sample sign with id "${id}".`);
    return { sign: { sample }, info: { sampleId: sample.id, imageUrl: sample.file } };
  }
  throw new InputError("no_image", `${label}: attach an image (field \`${fileField}\`) or choose a sample (field \`${sampleField}\`).`);
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "bad_request", "Send the signs as multipart/form-data.");
  }

  const mode = String(form.get("mode") ?? "");
  if (mode !== "compare" && mode !== "match") {
    return fail(400, "bad_mode", `Unknown mode "${mode}". Use compare or match.`);
  }
  const providerField = String(form.get("provider") ?? "mock");
  if (!isProvider(providerField)) {
    return fail(400, "bad_provider", `Unknown provider "${providerField}". Use mock, local or cloud.`);
  }
  const provider = getRestroomProvider(providerField);

  try {
    if (mode === "compare") {
      const a = await readSign(form, "a", "sampleA", "Sign a");
      const b = await readSign(form, "b", "sampleB", "Sign b");

      let rules = normaliseSignage(undefined);
      const rulesField = form.get("rules");
      if (typeof rulesField === "string" && rulesField) {
        try {
          rules = normaliseSignage(JSON.parse(rulesField));
        } catch {
          return fail(400, "bad_rules", "The `rules` field is not valid JSON.");
        }
      }
      const placeField = form.get("place");
      const place = typeof placeField === "string" ? placeField.trim().slice(0, 80) : "";

      const compare = await provider.compare({ a: a.sign, b: b.sign });
      const check: StoredSignageCheck = buildSignageCheck(
        compare,
        {
          id: `rc-${crypto.randomUUID().slice(0, 8)}`,
          createdAt: new Date().toISOString(),
          inputs: { a: a.info, b: b.info },
          place: place || undefined,
        },
        rules,
      );
      return NextResponse.json(check);
    }

    const query = await readSign(form, "query", "sampleQuery", "Query sign");
    // An IOAI catalogue sign is matched against its own IOAI set (its true partner included); anything else
    // against the bundled samples.
    const gallery = ioaiGallery(query.sign.sample?.id) ?? RESTROOM_SAMPLES.filter((s) => s.id !== query.sign.sample?.id);
    const result = await provider.match({ query: query.sign, gallery });
    const body: WebMatchResult = { ...result, queryInput: query.info };
    return NextResponse.json(body);
  } catch (err) {
    if (err instanceof InputError) return fail(400, err.code, err.message);
    if (err instanceof ProviderError) return fail(err.status, err.code, err.message, err.hint);
    console.error("[api/restroom]", err);
    return fail(500, "internal", "Something went wrong while comparing the signs.");
  }
}
