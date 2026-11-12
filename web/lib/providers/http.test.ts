import { describe, expect, it } from "vitest";
import { normaliseInference } from "./http";
import { ProviderError } from "./types";

describe("road response normalisation", () => {
  it("clamps the contract values and provides a missing detection id", () => {
    const result = normaliseInference({ model: "test", imageWidth: 100, imageHeight: 50, latencyMs: 10, detections: [{ confidence: 1.2, box: { x: -0.1, y: 0.4, w: 0.2, h: 0.2 } }] }, "local");
    expect(result.detections[0]).toEqual({ id: "d1", label: "pothole", confidence: 1, box: { x: 0, y: 0.4, w: 0.2, h: 0.2 } });
  });
  const roboflow = { image: { width: 1000, height: 500 }, predictions: [{ x: 500, y: 250, width: 200, height: 100, confidence: 0.9 }], time: 0.042 };
  it("converts pixel-centre boxes and seconds", () => {
    const result = normaliseInference(roboflow, "cloud");
    expect(result.detections[0].box).toEqual({ x: 0.4, y: 0.4, w: 0.2, h: 0.2 });
    expect(result.latencyMs).toBe(42);
  });
  it.each([{}, { ...roboflow, image: { width: 0, height: 500 } }, { ...roboflow, image: { width: 1000, height: -1 } }])("rejects an invalid response %#", (body) => {
    try { normaliseInference(body, "cloud"); throw new Error("Expected rejection"); }
    catch (error) { expect(error).toBeInstanceOf(ProviderError); expect(error).toMatchObject({ code: "bad_response", status: 502 }); }
  });
});
