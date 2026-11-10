/**
 * POST /api/analyze  (multipart/form-data)
 *
 *   file        image (jpeg | png | webp, max 10 MB)      one of file / sampleId
 *   sampleId    id from public/samples/samples.json       one of file / sampleId
 *   provider    "mock" | "local" | "cloud"                default "mock"
 *   roadClass   "residential" | "arterial" | "highway"    optional
 *   schoolZone  "true" | "false"                          optional
 *   rules       JSON RulesConfig from the Rules page       optional, defaults from lib/rules/config.ts
 *   imageWidth, imageHeight   measured in the browser     optional, used by the mock for uploads
 *
 * 200 -> StoredAnalysis (contract Analysis + `photo` block)
 * 4xx/5xx -> { error: { code, message, hint? } }
 */
import { NextResponse } from "next/server";
import { getSample } from "@/lib/mock/samples";
import { getProvider, isProvider, ProviderError, type PredictInput } from "@/lib/providers";
import { buildAnalysis, normaliseRules } from "@/lib/rules";
import { ROAD_CLASSES, type RoadClass } from "@/lib/types";
import { validateImageFile, type ApiError } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(status: number, code: string, message: string, hint?: string) {
  return NextResponse.json<ApiError>({ error: { code, message, ...(hint ? { hint } : {}) } }, { status });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "bad_request", "Send the photo as multipart/form-data.");
  }

  const providerField = String(form.get("provider") ?? "mock");
  if (!isProvider(providerField)) {
    return fail(400, "bad_provider", `Unknown provider "${providerField}". Use mock, local or cloud.`);
  }

  const file = form.get("file");
  const sampleId = form.get("sampleId");
  const sample = typeof sampleId === "string" && sampleId ? getSample(sampleId) : undefined;
  if (typeof sampleId === "string" && sampleId && !sample) {
    return fail(400, "unknown_sample", `There is no sample photo with id "${sampleId}".`);
  }

  let image: PredictInput["image"];
  if (file instanceof File) {
    const problem = validateImageFile(file);
    // 400 for both cases, like the model service contract.
    if (problem) return fail(400, "invalid_image", problem);
    image = { bytes: new Uint8Array(await file.arrayBuffer()), type: file.type, name: file.name || "upload" };
  } else if (!sample) {
    return fail(400, "no_image", "Attach a photo (field `file`) or choose a sample (field `sampleId`).");
  }

  const roadClassField = form.get("roadClass");
  const roadClass = ROAD_CLASSES.includes(roadClassField as RoadClass)
    ? (roadClassField as RoadClass)
    : image
      ? undefined
      : sample?.meta.roadClass;
  const schoolZoneField = form.get("schoolZone");
  const schoolZone = schoolZoneField === null ? (image ? false : (sample?.meta.schoolZone ?? false)) : schoolZoneField === "true";

  let rules = normaliseRules(undefined);
  const rulesField = form.get("rules");
  if (typeof rulesField === "string" && rulesField) {
    try {
      rules = normaliseRules(JSON.parse(rulesField));
    } catch {
      return fail(400, "bad_rules", "The `rules` field is not valid JSON.");
    }
  }

  const num = (v: FormDataEntryValue | null) => (typeof v === "string" && Number(v) > 0 ? Math.round(Number(v)) : undefined);

  try {
    const inference = await getProvider(providerField).predict({
      image,
      sample: image ? undefined : sample,
      conf: rules.r1.enabled ? Math.min(rules.r1.reviewFloor, rules.r1.threshold) : 0.01,
      imageWidth: num(form.get("imageWidth")),
      imageHeight: num(form.get("imageHeight")),
    });

    const analysis = buildAnalysis(
      inference,
      { roadClass, schoolZone },
      {
        id: `an-${crypto.randomUUID().slice(0, 8)}`,
        createdAt: new Date().toISOString(),
        location: image ? undefined : sample?.location,
        photo: image ? { fileName: image.name } : { sampleId: sample!.id, imageUrl: sample!.file },
      },
      rules,
    );
    return NextResponse.json(analysis);
  } catch (err) {
    if (err instanceof ProviderError) return fail(err.status, err.code, err.message, err.hint);
    console.error("[api/analyze]", err);
    return fail(500, "internal", "Something went wrong while analysing the photo.");
  }
}
