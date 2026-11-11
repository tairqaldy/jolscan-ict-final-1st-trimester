import { describe, expect, it } from "vitest";
import { markText, roadHitMarks, signHitMarks } from "./landing-rule-hits";
import { RESTROOM_PRESETS, getRestroomSample, mockSimilarity } from "./mock/restroom-samples";
import { getSample } from "./mock/samples";
import { DEFAULT_RULES, scoreDetections } from "./rules";
import { DEFAULT_SIGNAGE, evaluateSignage } from "./signage";

describe("markText", () => {
  it("marks tokens in order and keeps the text unchanged", () => {
    const parts = markText("gap 0.20 is below 0.20 here", [
      { token: "0.20", kind: "value" },
      { token: "0.20", kind: "setting" },
    ]);
    expect(parts).toEqual([
      { text: "gap " },
      { text: "0.20", kind: "value" },
      { text: " is below " },
      { text: "0.20", kind: "setting" },
      { text: " here" },
    ]);
    expect(parts.map((p) => p.text).join("")).toBe("gap 0.20 is below 0.20 here");
  });

  it("skips a token it cannot find", () => {
    expect(markText("no numbers", [{ token: "0.50", kind: "setting" }])).toEqual([{ text: "no numbers" }]);
  });
});

/* The two hits the landing page shows, computed the same way as web/app/page.tsx. */
describe("landing rule hits on the bundled samples", () => {
  it("marks the lane multiplier in the road hit", () => {
    const sample = getSample("s01")!;
    const hit = scoreDetections(sample.detections, sample.meta).ruleHits.find((h) => h.ruleId === "R3")!;
    const marked = markText(hit.detail, roadHitMarks(hit)).filter((p) => p.kind);
    expect(marked).toEqual([{ text: `×${DEFAULT_RULES.r3.multiplier}`, kind: "setting" }]);
  });

  it("marks the measured similarity and the threshold in the failed sign rule", () => {
    const preset = RESTROOM_PRESETS.find((p) => p.id === "mismatched")!;
    const a = getRestroomSample(preset.a)!;
    const b = getRestroomSample(preset.b)!;
    const similarity = mockSimilarity(a.id, b.id);
    const result = evaluateSignage({ a: a.mock, b: b.mock, similarity });
    const hit = result.ruleHits.find((h) => !h.passed)!;
    const marked = markText(hit.detail, signHitMarks(hit, result.doors, similarity)).filter((p) => p.kind);
    expect(marked.map((p) => p.kind)).toEqual(["value", "setting"]);
    expect(hit.ruleId).toBe("S3");
    expect(Number(marked[0].text)).toBeCloseTo(similarity, 2);
    expect(marked[1].text).toBe(DEFAULT_SIGNAGE.s3.minSimilarity.toFixed(2));
  });
});
