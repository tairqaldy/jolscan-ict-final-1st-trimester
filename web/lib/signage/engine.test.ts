import { describe, expect, it } from "vitest";
import {
  RESTROOM_PRESETS,
  RESTROOM_SAMPLES,
  getRestroomSample,
  mockSimilarity,
  truePartner,
  type RestroomSample,
} from "@/lib/mock/restroom-samples";
import type { CompareResult, Gender, MatchCandidate } from "@/lib/types";
import manifest from "@/public/samples/restrooms/samples.json";
import {
  DEFAULT_SIGNAGE,
  assignDoors,
  buildSignageCheck,
  doorGender,
  evaluateSignage,
  formatAgainst,
  normaliseSignage,
  pMale,
  pickBestMatch,
  sortCandidates,
  type SignageConfig,
} from "./index";

const isDrawing = (s: RestroomSample) => s.file.endsWith(".svg");

const pair = (a: [Gender, number], b: [Gender, number], similarity: number) => ({
  a: { gender: a[0], confidence: a[1] },
  b: { gender: b[0], confidence: b[1] },
  similarity,
});

const passed = (r: ReturnType<typeof evaluateSignage>) => Object.fromEntries(r.ruleHits.map((h) => [h.ruleId, h.passed]));

describe("RULES.md Part 2 worked examples", () => {
  it("A: male 0.97, female 0.94, similarity 0.94 is a pair", () => {
    const r = evaluateSignage(pair(["male", 0.97], ["female", 0.94], 0.94));
    expect(r.verdict).toBe("pair");
    expect(passed(r)).toEqual({ S2: true, S3: true });
    expect(r.doors).toEqual({ mens: "a", pMaleA: 0.97, pMaleB: 0.06, margin: 0.91 });
    expect(r.reason).toBe("One design set, and the two doors read as different genders");
  });

  it("B: door B alone reads slightly male, but compared with door A it is the women's door; gap 0.10 is a pair", () => {
    const r = evaluateSignage(pair(["male", 0.62], ["male", 0.52], 0.93));
    expect(r.doors.mens).toBe("a");
    expect(r.doors.margin).toBe(0.1);
    expect(r.verdict).toBe("pair");
    expect(passed(r)).toEqual({ S2: true, S3: true });
    expect(r.ruleHits[0].detail).toContain("a gap of 0.10, at or above 0.05");
  });

  it("C: both doors read about the same (0.71 and 0.69 male), gap 0.02 is not a pair", () => {
    const r = evaluateSignage(pair(["male", 0.71], ["male", 0.69], 0.95));
    expect(r.verdict).toBe("not_pair");
    expect(passed(r)).toEqual({ S2: false, S3: true });
    expect(r.ruleHits[0].detail).toContain("same gender");
    expect(r.reason).toBe("Both signs read as the same gender");
  });
});

describe("pairwise reading", () => {
  it("P(male) is the confidence for a male prediction and 1 - confidence for a female one", () => {
    expect(pMale({ gender: "male", confidence: 0.8 })).toBe(0.8);
    expect(pMale({ gender: "female", confidence: 0.8 })).toBeCloseTo(0.2, 10);
  });

  it("the men's door is the sign with the higher P(male), whichever side it is on", () => {
    expect(assignDoors({ gender: "female", confidence: 0.9 }, { gender: "male", confidence: 0.6 }).mens).toBe("b");
    expect(doorGender(assignDoors({ gender: "female", confidence: 0.9 }, { gender: "male", confidence: 0.6 }), "a")).toBe("female");
  });

  it("two signs both predicted female can still be read apart if the gap is large", () => {
    const r = evaluateSignage(pair(["female", 0.55], ["female", 0.95], 0.93));
    expect(r.doors).toEqual({ mens: "a", pMaleA: 0.45, pMaleB: 0.05, margin: 0.4 });
    expect(r.verdict).toBe("pair");
  });
});

describe("S2 boundary at 0.05", () => {
  // Door A at P(male) 0.5 + gap, door B at 0.5, both as male predictions.
  const gap = (g: number) => evaluateSignage(pair(["male", 0.5 + g], ["male", 0.5], 0.94));

  it("passes at exactly 0.05 and fails just below, printing enough digits", () => {
    expect(passed(gap(0.05)).S2).toBe(true);
    expect(gap(0.05).verdict).toBe("pair");
    const r = gap(0.0499);
    expect(passed(r).S2).toBe(false);
    expect(r.verdict).toBe("not_pair");
    expect(r.ruleHits[0].detail).toContain("0.0499");
  });
});

describe("S3 boundary at 0.88", () => {
  it("passes at exactly 0.88", () => {
    const r = evaluateSignage(pair(["male", 0.9], ["female", 0.9], 0.88));
    expect(passed(r).S3).toBe(true);
    expect(r.verdict).toBe("pair");
  });

  it("fails at 0.8799 and prints enough digits to show it", () => {
    const r = evaluateSignage(pair(["male", 0.9], ["female", 0.9], 0.8799));
    expect(passed(r).S3).toBe(false);
    expect(r.verdict).toBe("not_pair");
    expect(r.ruleHits[1].detail).toContain("0.8799");
    expect(r.reason).toBe("The two designs are from different sets");
  });

  it("formatAgainst keeps two decimals when rounding does not cross the threshold", () => {
    expect(formatAgainst(0.94, 0.88)).toBe("0.94");
    expect(formatAgainst(0.8799, 0.88)).toBe("0.8799");
    expect(formatAgainst(0.88, 0.88)).toBe("0.88");
  });
});

describe("two verdicts only", () => {
  it("not a pair when both rules fail, with both reasons", () => {
    const r = evaluateSignage(pair(["female", 0.6], ["female", 0.62], 0.7));
    expect(passed(r)).toEqual({ S2: false, S3: false });
    expect(r.verdict).toBe("not_pair");
    expect(r.reason).toBe("Different design sets, and both signs read as the same gender");
  });

  it("never returns anything but pair or not_pair", () => {
    for (const g of [0, 0.03, 0.05, 0.1, 0.2, 0.5]) {
      for (const sim of [0.5, 0.87, 0.88, 0.99]) {
        expect(["pair", "not_pair"]).toContain(evaluateSignage(pair(["male", 0.5 + g / 2], ["female", 0.5 + g / 2], sim)).verdict);
      }
    }
  });
});

describe("rule hits", () => {
  it("always lists S2 then S3 with a title and detail", () => {
    const r = evaluateSignage(pair(["male", 0.97], ["female", 0.94], 0.94));
    expect(r.ruleHits.map((h) => h.ruleId)).toEqual(["S2", "S3"]);
    for (const h of r.ruleHits) {
      expect(h.title.length).toBeGreaterThan(0);
      expect(h.detail.length).toBeGreaterThan(0);
    }
  });

  it("uses the thresholds from the config", () => {
    const strict: SignageConfig = { s2: { minMargin: 0.95 }, s3: { minSimilarity: 0.95 } };
    const r = evaluateSignage(pair(["male", 0.97], ["female", 0.94], 0.94), strict);
    expect(passed(r)).toEqual({ S2: false, S3: false });
    expect(r.verdict).toBe("not_pair");
  });
});

describe("buildSignageCheck", () => {
  it("keeps every contract field and adds the verdict, its reason and the door reading", () => {
    const compare: CompareResult = { provider: "mock", model: "m", latencyMs: 40, ...pair(["male", 0.97], ["female", 0.94], 0.94) };
    const c = buildSignageCheck(compare, { id: "x", createdAt: "2026-11-10T00:00:00.000Z", inputs: { a: {}, b: {} } });
    expect(Object.keys(c).sort()).toEqual(
      ["a", "b", "createdAt", "doors", "id", "inputs", "latencyMs", "model", "provider", "reason", "ruleHits", "similarity", "verdict"].sort(),
    );
    expect(c.verdict).toBe("pair");
  });
});

describe("normaliseSignage", () => {
  it("returns the defaults for junk and for settings saved by the old rules", () => {
    expect(normaliseSignage(undefined)).toEqual(DEFAULT_SIGNAGE);
    expect(normaliseSignage("nope")).toEqual(DEFAULT_SIGNAGE);
    expect(normaliseSignage({ s1: { minMargin: "0.3" }, s3: null })).toEqual(DEFAULT_SIGNAGE);
    expect(normaliseSignage({ s1: { minConfidence: 0.8 }, s3: { minSimilarity: 0.75 } })).toEqual({ ...DEFAULT_SIGNAGE, s3: { minSimilarity: 0.75 } });
  });

  it("merges valid fields, clamps them to 0..1, and ignores the retired S1", () => {
    expect(normaliseSignage({ s2: { minMargin: 0.3 } })).toEqual({ s2: { minMargin: 0.3 }, s3: { minSimilarity: 0.88 } });
    expect(normaliseSignage({ s3: { minSimilarity: 1.4 } }).s3.minSimilarity).toBe(1);
    expect(normaliseSignage({ s1: { minMargin: 0.1 }, s2: { minMargin: 0.4 } })).toEqual({ s2: { minMargin: 0.4 }, s3: { minSimilarity: 0.88 } });
  });

  it("does not share state with the defaults", () => {
    const c = normaliseSignage({});
    c.s2.minMargin = 0.9;
    expect(DEFAULT_SIGNAGE.s2.minMargin).toBe(0.05);
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
  it("presets give the documented verdicts", () => {
    const verdicts = Object.fromEntries(
      RESTROOM_PRESETS.map((p) => {
        const a = getRestroomSample(p.a)!;
        const b = getRestroomSample(p.b)!;
        return [p.id, evaluateSignage({ a: a.mock, b: b.mock, similarity: mockSimilarity(a.id, b.id) }).verdict];
      }),
    );
    expect(verdicts).toEqual({
      matching: "pair",
      faint: "pair",
      mismatched: "not_pair",
      same: "not_pair",
      // Real IOAI signs: the verdicts that follow from the real model outputs in the manifest.
      "ioai-matching": "pair",
      "ioai-faint": "pair",
      "ioai-swapped": "pair",
      "ioai-mismatched": "not_pair",
    });
  });

  it("the presets reproduce worked examples A, B and C exactly", () => {
    expect(mockSimilarity("classic-m", "classic-f")).toBe(0.94);
    expect(mockSimilarity("faint-m", "faint-f")).toBe(0.93);
    expect(mockSimilarity("twins-m", "twins-f")).toBe(0.95);
    expect(getRestroomSample("faint-f")!.mock).toEqual({ gender: "male", confidence: 0.52 });
    expect(getRestroomSample("twins-f")!.mock).toEqual({ gender: "male", confidence: 0.69 });
  });

  it("similarity is deterministic, symmetric, 1 for the same sign, and (for the drawings) below S3 across sets", () => {
    for (const a of RESTROOM_SAMPLES) {
      for (const b of RESTROOM_SAMPLES) {
        const s = mockSimilarity(a.id, b.id);
        expect(s).toBe(mockSimilarity(b.id, a.id));
        if (a.id === b.id) {
          expect(s).toBe(1);
        } else if (isDrawing(a) && isDrawing(b)) {
          // Only the drawings' invented values are chosen to respect S3; real outputs are what they are.
          if (a.set === b.set) expect(s).toBeGreaterThanOrEqual(DEFAULT_SIGNAGE.s3.minSimilarity);
          else expect(s).toBeLessThan(DEFAULT_SIGNAGE.s3.minSimilarity);
        }
      }
    }
  });

  it("every pair of real signs has a recorded model similarity, not an invented one", () => {
    const real = RESTROOM_SAMPLES.filter((s) => !isDrawing(s));
    expect(real).toHaveLength(12);
    for (const a of real) {
      for (const b of real) {
        if (a.id < b.id) expect(manifest.similarity.pairs).toHaveProperty([`${a.id}|${b.id}`]);
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
