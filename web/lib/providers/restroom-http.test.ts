import { afterEach, describe, expect, it, vi } from "vitest";
import { RESTROOM_SAMPLES, getRestroomSample } from "@/lib/mock/restroom-samples";
import { restroomLocalProvider } from "./restroom-http";
import { ProviderError } from "./types";

// The provider modules guard against client imports with "server-only", which only resolves inside Next.js.
vi.mock("server-only", () => ({}));

const isSvg = (file: string) => file.endsWith(".svg");

/** A fake model service: records the form it got and ranks the gallery in upload order. */
function fakeService() {
  const sent: FormData[] = [];
  const fetchMock = vi.fn(async (_url: unknown, init?: RequestInit) => {
    const form = init?.body as FormData;
    sent.push(form);
    const candidates = form.getAll("gallery").map((_, i) => ({
      id: String(i),
      similarity: 0.5,
      prediction: { gender: "female", confidence: 0.9 },
    }));
    const body = { model: "fake", latencyMs: 1, query: { gender: "male", confidence: 0.9 }, candidates, bestMatchId: "0" };
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  });
  vi.stubGlobal("fetch", fetchMock);
  return { sent, fetchMock };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("restroom HTTP provider: match gallery", () => {
  it("sends only the non-SVG samples as the gallery and maps the answer back to their ids", async () => {
    const { sent } = fakeService();
    const query = RESTROOM_SAMPLES.find((s) => !isSvg(s.file))!;
    const gallery = RESTROOM_SAMPLES.filter((s) => s.id !== query.id);
    const real = gallery.filter((s) => !isSvg(s.file));
    expect(real.length).toBeGreaterThan(0);
    expect(real.length).toBeLessThan(gallery.length);

    const result = await restroomLocalProvider.match({ query: { sample: query }, gallery });

    expect(sent).toHaveLength(1);
    const names = sent[0].getAll("gallery").map((f) => (f as File).name);
    expect(names).toEqual(real.map((s) => s.file.split("/").pop()));
    expect(result.candidates.map((c) => c.id).sort()).toEqual(real.map((s) => s.id).sort());
    expect(result.bestMatchId).toBe(real[0].id);
  });

  it("answers 422 without calling the service when every gallery sign is a drawing", async () => {
    const { fetchMock } = fakeService();
    const drawings = RESTROOM_SAMPLES.filter((s) => isSvg(s.file));
    const query = getRestroomSample("ioai-v9")!;

    const error = await restroomLocalProvider.match({ query: { sample: query }, gallery: drawings }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ProviderError);
    expect((error as ProviderError).status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

import { normaliseCompare, normaliseMatch } from "./restroom-http";

describe("restroom response normalisation", () => {
  const male = { gender: "male", confidence: 0.97 };
  const female = { gender: "female", confidence: 0.94 };
  it("accepts a compare contract and rejects unknown genders or missing similarity", () => {
    const body = { model: "test", latencyMs: 12, a: male, b: female, similarity: 0.94 };
    expect(normaliseCompare(body, "local")).toMatchObject(body);
    expect(() => normaliseCompare({ ...body, a: { ...male, gender: "other" } }, "local")).toThrow(ProviderError);
    const missing = { ...body, similarity: undefined };
    expect(() => normaliseCompare(missing, "local")).toThrow(ProviderError);
  });
  it("maps upload indices, sorts candidates and uses the fallback if bestMatchId is missing", () => {
    const gallery = [getRestroomSample("classic-m")!, getRestroomSample("classic-f")!];
    const body = { model: "test", query: male, candidates: [
      { id: "0", similarity: 0.4, prediction: male },
      { id: "1", similarity: 0.9, prediction: female },
    ] };
    const result = normaliseMatch(body, "local", gallery);
    expect(result.candidates.map((c) => c.id)).toEqual(["classic-f", "classic-m"]);
    expect(result.bestMatchId).toBe("classic-f");
    expect(normaliseMatch({ ...body, bestMatchId: null }, "local", gallery).bestMatchId).toBeNull();
  });
});
