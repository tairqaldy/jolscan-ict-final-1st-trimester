import { describe, expect, it } from "vitest";
import type { Detection } from "@/lib/types";
import {
  DEFAULT_RULES,
  areaPct,
  isInLane,
  normaliseRules,
  scoreDetections,
  severityForScore,
  sizeClass,
  type RulesConfig,
} from "./index";
import samples from "@/public/samples/samples.json";

let n = 0;
const det = (box: Detection["box"], confidence = 0.9): Detection => ({
  id: `d${++n}`,
  label: "pothole",
  confidence,
  box,
});

// Boxes used across tests. Centres are noted for the inLane check.
const LARGE_IN_LANE = { x: 0.4, y: 0.66, w: 0.22, h: 0.16 }; // 3.52 %, centre (0.51, 0.74)
const MEDIUM_IN_LANE = { x: 0.56, y: 0.52, w: 0.12, h: 0.08 }; // 0.96 %, centre (0.62, 0.56)
const SMALL_OFF_LANE = { x: 0.82, y: 0.55, w: 0.06, h: 0.05 }; // 0.30 %, centre (0.85, 0.575)

const withRules = (patch: (c: RulesConfig) => void) => {
  const c = structuredClone(DEFAULT_RULES);
  patch(c);
  return c;
};

describe("RULES.md worked example A", () => {
  const detections = [det(LARGE_IN_LANE), det(MEDIUM_IN_LANE), det(SMALL_OFF_LANE)];
  const result = scoreDetections(detections, { roadClass: "highway" });

  it("scores 15 and is critical with a 24 h target", () => {
    expect(result.score).toBe(15);
    expect(result.severity).toBe("critical");
    expect(result.slaHours).toBe(24);
    expect(result.recommendedAction).toBe("Mark the hazard and repair urgently");
    expect(result.needsReview).toBe(false);
  });

  it("explains itself: rule hit points add up to the score, no cluster bonus", () => {
    const byId = Object.fromEntries(result.ruleHits.map((h) => [h.ruleId, h.points]));
    expect(byId).toEqual({ R1: 0, R2: 7, R3: 3, R5: 5 });
    expect(result.ruleHits.reduce((s, h) => s + h.points, 0)).toBe(15);
  });

  it("derives size and lane for each detection", () => {
    expect(result.detections.map((d) => [d.size, d.inLane])).toEqual([
      ["large", true],
      ["medium", true],
      ["small", false],
    ]);
  });

  it("matches the bundled sample s01 in samples.json", () => {
    const s01 = samples.samples.find((s) => s.id === "s01")!;
    const r = scoreDetections(s01.detections as Detection[], s01.meta as { roadClass: "highway" });
    expect(r.score).toBe(15);
    expect(r.severity).toBe("critical");
  });
});

describe("RULES.md worked examples B and C", () => {
  it("B: ten small off-lane detections on a residential road score only 2", () => {
    const r = scoreDetections(Array.from({ length: 10 }, () => det(SMALL_OFF_LANE)));
    expect(r.score).toBe(2);
    expect(r.severity).toBe("medium");
    expect(r.ruleHits.some((h) => h.ruleId === "R4")).toBe(false);
    expect(r.ruleHits.find((h) => h.ruleId === "R2")?.detail).toContain("capped at 2");
  });

  it("B: one large pothole in lane outranks ten small false alarms", () => {
    const many = scoreDetections(Array.from({ length: 10 }, () => det(SMALL_OFF_LANE))).score;
    expect(scoreDetections([det(LARGE_IN_LANE)]).score).toBeGreaterThan(many);
  });

  it("C: a clean road in a school zone stays clear", () => {
    const r = scoreDetections([], { schoolZone: true });
    expect(r.score).toBe(0);
    expect(r.severity).toBe("clear");
  });
});

describe("R1 confidence threshold boundaries (τ = 0.40, review floor 0.25)", () => {
  const one = (c: number) => scoreDetections([det(SMALL_OFF_LANE, c)]);

  it("counts a detection at exactly τ", () => {
    const r = one(0.4);
    expect(r.detections[0].counted).toBe(true);
    expect(r.needsReview).toBe(false);
    expect(r.score).toBe(1);
  });

  it("does not count just below τ, and flags for review", () => {
    const r = one(0.3999);
    expect(r.detections[0].counted).toBe(false);
    expect(r.needsReview).toBe(true);
    expect(r.score).toBe(0);
    expect(r.severity).toBe("clear");
  });

  it("flags at exactly the review floor 0.25", () => {
    expect(one(0.25).needsReview).toBe(true);
  });

  it("ignores below the review floor without flagging", () => {
    const r = one(0.2499);
    expect(r.needsReview).toBe(false);
    expect(r.detections[0].review).toBe(false);
  });

  it("counts everything when R1 is disabled", () => {
    const r = scoreDetections([det(SMALL_OFF_LANE, 0.1)], {}, withRules((c) => (c.r1.enabled = false)));
    expect(r.score).toBe(1);
    expect(r.needsReview).toBe(false);
  });
});

describe("R2 size boundaries", () => {
  it("uses areaPct = w*h*100 without float noise", () => {
    expect(areaPct({ x: 0, y: 0, w: 0.1, h: 0.05 })).toBe(0.5);
    expect(areaPct({ x: 0, y: 0, w: 0.3, h: 0.1 })).toBe(3);
  });

  it("small below 0.5, medium from 0.5, large from 3", () => {
    expect(sizeClass(0.4999)).toBe("small");
    expect(sizeClass(0.5)).toBe("medium");
    expect(sizeClass(2.9999)).toBe("medium");
    expect(sizeClass(3)).toBe("large");
  });

  it("gives 1 / 2 / 4 points off lane", () => {
    const pts = (box: Detection["box"]) => scoreDetections([det(box)]).score;
    expect(pts({ x: 0.0, y: 0.1, w: 0.1, h: 0.0499 })).toBe(1); // 0.499 %
    expect(pts({ x: 0.0, y: 0.1, w: 0.1, h: 0.05 })).toBe(2); // 0.5 %
    expect(pts({ x: 0.0, y: 0.1, w: 0.3, h: 0.1 })).toBe(4); // 3 %
  });
});

describe("R3 driving lane boundaries", () => {
  // A 0.02 x 0.02 box; place its centre exactly where we want.
  const at = (cx: number, cy: number) => ({ x: cx - 0.01, y: cy - 0.01, w: 0.02, h: 0.02 });

  it("is inclusive at cx = 0.25, cx = 0.75 and cy = 0.5", () => {
    expect(isInLane(at(0.25, 0.5))).toBe(true);
    expect(isInLane(at(0.75, 0.9))).toBe(true);
  });

  it("is out just outside the edges", () => {
    expect(isInLane(at(0.249, 0.8))).toBe(false);
    expect(isInLane(at(0.751, 0.8))).toBe(false);
    expect(isInLane(at(0.5, 0.499))).toBe(false);
  });

  it("multiplies points by 1.5 in lane", () => {
    expect(scoreDetections([det(at(0.5, 0.8))]).score).toBe(1.5);
  });
});

describe("R4 cluster, R5 road class, R6 school zone", () => {
  const small = () => det(SMALL_OFF_LANE);

  // A medium box off lane: 0.12 x 0.08 = 0.96 %, centre (0.88, 0.2).
  const mediumOff = (confidence = 0.9) => det({ x: 0.82, y: 0.16, w: 0.12, h: 0.08 }, confidence);

  it("adds +2 from exactly 3 counted medium or large detections, not at 2", () => {
    expect(scoreDetections([mediumOff(), mediumOff()]).score).toBe(4);
    expect(scoreDetections([mediumOff(), mediumOff(), mediumOff()]).score).toBe(8);
  });

  it("does not count small detections towards the cluster", () => {
    const r = scoreDetections([mediumOff(), mediumOff(), small(), small()]);
    expect(r.score).toBe(6); // 2 + 2 + min(2, 2)
    expect(r.ruleHits.some((h) => h.ruleId === "R4")).toBe(false);
  });

  it("does not count review-only detections towards the cluster", () => {
    const r = scoreDetections([mediumOff(), mediumOff(), mediumOff(0.3)]);
    expect(r.score).toBe(4);
    expect(r.ruleHits.some((h) => h.ruleId === "R4")).toBe(false);
  });

  it("caps small detections after the lane multiplier", () => {
    const inLaneSmall = () => det({ x: 0.49, y: 0.79, w: 0.02, h: 0.02 });
    const r = scoreDetections([inLaneSmall(), inLaneSmall()]); // 1.5 + 1.5 = 3, capped to 2
    expect(r.score).toBe(2);
    expect(r.ruleHits.reduce((s, h) => s + h.points, 0)).toBe(2);
  });

  it("does not cap small detections when R2 is off", () => {
    const r = scoreDetections([small(), small(), small()], {}, withRules((c) => (c.r2.enabled = false)));
    expect(r.score).toBe(3);
  });

  it("multiplies by road class, residential by default", () => {
    const d = [det(MEDIUM_IN_LANE)]; // 3 points
    expect(scoreDetections(d).score).toBe(3);
    expect(scoreDetections(d, { roadClass: "arterial" }).score).toBe(3.75);
    expect(scoreDetections(d, { roadClass: "highway" }).score).toBe(4.5);
  });

  it("adds the school zone bonus after R5", () => {
    expect(scoreDetections([det(MEDIUM_IN_LANE)], { roadClass: "highway", schoolZone: true }).score).toBe(6.5);
  });

  it("does not add the school zone bonus to an empty photo", () => {
    const r = scoreDetections([], { schoolZone: true });
    expect(r.score).toBe(0);
    expect(r.severity).toBe("clear");
    expect(r.recommendedAction).toBe("No action");
    expect(r.slaHours).toBeNull();
  });
});

describe("severity band boundaries", () => {
  it.each([
    [0, "clear"],
    [0.01, "low"],
    [1.99, "low"],
    [2, "medium"],
    [4.99, "medium"],
    [5, "high"],
    [8.99, "high"],
    [9, "critical"],
  ] as const)("score %s is %s", (score, severity) => {
    expect(severityForScore(score)).toBe(severity);
  });

  it("medium has a 336 h target, high 72 h, low none", () => {
    expect(scoreDetections([det(MEDIUM_IN_LANE)]).slaHours).toBe(336); // 3
    expect(scoreDetections([det(LARGE_IN_LANE)]).slaHours).toBe(72); // 6
    expect(scoreDetections([det(SMALL_OFF_LANE)]).slaHours).toBeNull(); // 1
  });
});

describe("normaliseRules", () => {
  it("keeps defaults for junk and merges valid fields", () => {
    expect(normaliseRules("nope")).toEqual(DEFAULT_RULES);
    const c = normaliseRules({ r1: { threshold: 0.5, enabled: "yes" }, r9: {} });
    expect(c.r1.threshold).toBe(0.5);
    expect(c.r1.enabled).toBe(true);
  });
});
