import { describe, expect, it } from "vitest";
import {
  RESTROOM_PRESETS,
  RESTROOM_SAMPLES,
  getRestroomSample,
  mockSimilarity,
  truePartner,
} from "@/lib/mock/restroom-samples";
import type { CompareResult, Gender, MatchCandidate } from "@/lib/types";
import {
  DEFAULT_SIGNAGE,
  VERDICT_ACTIONS,
  buildSignageCheck,
  evaluateSignage,
  formatAgainst,
  normaliseSignage,
  pickBestMatch,
  sortCandidates,
  type SignageConfig,
} from "./index";

const pair = (a: [Gender, number], b: [Gender, number], similarity: number) => ({
  a: { gender: a[0], confidence: a[1] },
  b: { gender: b[0], confidence: b[1] },
  similarity,
});

const passed = (r: ReturnType<typeof evaluateSignage>) => Object.fromEntries(r.ruleHits.map((h) => [h.ruleId, h.passed]));

describe("RULES.md Part 2 worked examples", () => {
  it("A: male 0.97, female 0.94, similarity 0.88 is clear", () => {
    const r = evaluateSignage(pair(["male", 0.97], ["female", 0.94], 0.88));
    expect(r.verdict).toBe("clear");
    expect(passed(r)).toEqual({ S1: true, S2: true, S3: true });
    expect(r.recommendedAction).toBe("No action");
  });

  it("B: male 0.97, female 0.62, similarity 0.81 is review because S1 fails for sign b", () => {
    const r = evaluateSignage(pair(["male", 0.97], ["female", 0.62], 0.81));
    expect(r.verdict).toBe("review");
    expect(passed(r)).toEqual({ S1: false, S2: true, S3: true });
    const s1 = r.ruleHits.find((h) => h.ruleId === "S1")!;
    expect(s1.detail).toContain("sign b (female, 62%)");
    expect(s1.detail).not.toContain("sign a");
    expect(r.recommendedAction).toBe(VERDICT_ACTIONS.review);
  });

  it("C: both read as male (0.71, 0.66), similarity 0.90 is confusing because S2 fails", () => {
    const r = evaluateSignage(pair(["male", 0.71], ["male", 0.66], 0.9));
    expect(r.verdict).toBe("confusing");
    expect(passed(r)).toEqual({ S1: false, S2: false, S3: true });
    expect(r.ruleHits.find((h) => h.ruleId === "S2")!.detail).toContain("Both signs read as male");
    expect(r.recommendedAction).toBe("Replace the signage. Visitors are likely to enter the wrong room");
  });
});

describe("S1 boundary at 0.80", () => {
  it("passes at exactly 0.80 on both signs", () => {
    const r = evaluateSignage(pair(["male", 0.8], ["female", 0.8], 0.9));
    expect(passed(r).S1).toBe(true);
    expect(r.verdict).toBe("clear");
  });

  it("fails at 0.7999 on either sign, and says so without rounding it up to 80%", () => {
    const onA = evaluateSignage(pair(["male", 0.7999], ["female", 0.95], 0.9));
    const onB = evaluateSignage(pair(["male", 0.95], ["female", 0.7999], 0.9));
    for (const r of [onA, onB]) {
      expect(passed(r).S1).toBe(false);
      expect(r.verdict).toBe("review");
      expect(r.ruleHits[0].detail).toContain("79.99%");
    }
  });
});

describe("S3 boundary at 0.75", () => {
  it("passes at exactly 0.75", () => {
    const r = evaluateSignage(pair(["male", 0.9], ["female", 0.9], 0.75));
    expect(passed(r).S3).toBe(true);
    expect(r.verdict).toBe("clear");
  });

  it("fails at 0.7499 and prints enough digits to show it", () => {
    const r = evaluateSignage(pair(["male", 0.9], ["female", 0.9], 0.7499));
    expect(passed(r).S3).toBe(false);
    expect(r.verdict).toBe("review");
    expect(r.ruleHits[2].detail).toContain("0.7499");
  });

  it("formatAgainst keeps two decimals when rounding does not cross the threshold", () => {
    expect(formatAgainst(0.88, 0.75)).toBe("0.88");
    expect(formatAgainst(0.7499, 0.75)).toBe("0.7499");
    expect(formatAgainst(0.75, 0.75)).toBe("0.75");
  });
});

describe("S2 decides confusing on its own", () => {
  it("both female is confusing too", () => {
    expect(evaluateSignage(pair(["female", 0.95], ["female", 0.93], 0.9)).verdict).toBe("confusing");
  });

  it("same gender is confusing even when S1 and S3 both fail", () => {
    const r = evaluateSignage(pair(["male", 0.55], ["male", 0.6], 0.4));
    expect(passed(r)).toEqual({ S1: false, S2: false, S3: false });
    expect(r.verdict).toBe("confusing");
  });

  it("different genders with S1 and S3 failing is review, not confusing", () => {
    expect(evaluateSignage(pair(["male", 0.55], ["female", 0.6], 0.4)).verdict).toBe("review");
  });
});

describe("rule hits", () => {
  it("always lists S1, S2, S3 in order with a title and detail", () => {
    const r = evaluateSignage(pair(["male", 0.97], ["female", 0.94], 0.88));
    expect(r.ruleHits.map((h) => h.ruleId)).toEqual(["S1", "S2", "S3"]);
    for (const h of r.ruleHits) {
      expect(h.title.length).toBeGreaterThan(0);
      expect(h.detail.length).toBeGreaterThan(0);
    }
  });

  it("uses the thresholds from the config", () => {
    const strict: SignageConfig = { s1: { minConfidence: 0.95 }, s3: { minSimilarity: 0.9 } };
    const r = evaluateSignage(pair(["male", 0.97], ["female", 0.94], 0.88), strict);
    expect(passed(r)).toEqual({ S1: false, S2: true, S3: false });
    expect(r.verdict).toBe("review");
  });
});

describe("buildSignageCheck", () => {
  it("keeps every contract field and adds the verdict", () => {
    const compare: CompareResult = { provider: "mock", model: "m", latencyMs: 40, ...pair(["male", 0.97], ["female", 0.94], 0.88) };
    const c = buildSignageCheck(compare, { id: "x", createdAt: "2026-11-10T00:00:00.000Z", inputs: { a: {}, b: {} } });
    expect(Object.keys(c).sort()).toEqual(
      ["a", "b", "createdAt", "id", "inputs", "latencyMs", "model", "provider", "recommendedAction", "ruleHits", "similarity", "verdict"].sort(),
    );
    expect(c.verdict).toBe("clear");
  });
});

describe("normaliseSignage", () => {
  it("returns the defaults for junk", () => {
    expect(normaliseSignage(undefined)).toEqual(DEFAULT_SIGNAGE);
    expect(normaliseSignage("nope")).toEqual(DEFAULT_SIGNAGE);
    expect(normaliseSignage({ s1: { minConfidence: "0.9" }, s3: null })).toEqual(DEFAULT_SIGNAGE);
    expect(normaliseSignage({ s1: { minConfidence: Number.NaN } })).toEqual(DEFAULT_SIGNAGE);
  });

  it("merges valid fields over the defaults and clamps them to 0..1", () => {
    expect(normaliseSignage({ s1: { minConfidence: 0.9 } })).toEqual({ s1: { minConfidence: 0.9 }, s3: { minSimilarity: 0.75 } });
    expect(normaliseSignage({ s3: { minSimilarity: 1.4 }, s9: {} }).s3.minSimilarity).toBe(1);
    expect(normaliseSignage({ s1: { minConfidence: -1 } }).s1.minConfidence).toBe(0);
  });

  it("does not share state with the defaults", () => {
    const c = normaliseSignage({});
    c.s1.minConfidence = 0.1;
    expect(DEFAULT_SIGNAGE.s1.minConfidence).toBe(0.8);
  });
});

describe("matching (the IOAI task)", () => {
  const cand = (id: string, similarity: number, gender: Gender): MatchCandidate => ({
    id,
    similarity,
    prediction: { gender, confidence: 0.9 },
  });

  it("picks the most similar candidate of the opposite gender, not the most similar overall", () => {
    const c = [cand("1", 0.95, "male"), cand("2", 0.8, "female"), cand("3", 0.85, "female")];
    expect(pickBestMatch("male", c)).toBe("3");
    expect(pickBestMatch("female", c)).toBe("1");
  });

  it("returns null when no candidate has the opposite gender", () => {
    expect(pickBestMatch("male", [cand("1", 0.9, "male")])).toBeNull();
  });

  it("sorts most similar first with a stable tie-break", () => {
    expect(sortCandidates([cand("b", 0.5, "male"), cand("a", 0.5, "male"), cand("c", 0.9, "male")]).map((c) => c.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });
});

describe("restroom sample manifest (mock data)", () => {
  it("presets exercise all three verdicts as documented", () => {
    const verdicts = Object.fromEntries(
      RESTROOM_PRESETS.map((p) => {
        const a = getRestroomSample(p.a)!;
        const b = getRestroomSample(p.b)!;
        return [p.id, evaluateSignage({ a: a.mock, b: b.mock, similarity: mockSimilarity(a.id, b.id) }).verdict];
      }),
    );
    expect(verdicts).toEqual({ matching: "clear", faint: "review", mismatched: "review", same: "confusing" });
  });

  it("the presets reproduce worked examples A, B and C exactly", () => {
    expect(mockSimilarity("classic-m", "classic-f")).toBe(0.88);
    expect(mockSimilarity("faint-m", "faint-f")).toBe(0.81);
    expect(mockSimilarity("twins-m", "twins-f")).toBe(0.9);
  });

  it("similarity is deterministic, symmetric, 1 for the same sign, and below S3 across sets", () => {
    for (const a of RESTROOM_SAMPLES) {
      for (const b of RESTROOM_SAMPLES) {
        const s = mockSimilarity(a.id, b.id);
        expect(s).toBe(mockSimilarity(b.id, a.id));
        if (a.id === b.id) expect(s).toBe(1);
        else if (a.set === b.set) expect(s).toBeGreaterThanOrEqual(DEFAULT_SIGNAGE.s3.minSimilarity);
        else expect(s).toBeLessThan(DEFAULT_SIGNAGE.s3.minSimilarity);
      }
    }
  });

  it("every sign has a true partner in its set and a file under /samples/restrooms/", () => {
    for (const s of RESTROOM_SAMPLES) {
      expect(truePartner(s)?.set).toBe(s.set);
      expect(s.file.startsWith("/samples/restrooms/")).toBe(true);
    }
  });
});
