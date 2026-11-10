/**
 * The rules engine: turns detections + photo metadata into a repair priority.
 * Specification: docs/RULES.md. Pure functions only (no I/O, no Date, no
 * randomness) so the same input always gives the same result, on the server,
 * in the browser and in tests.
 *
 * smallPoints = min(Σ small (sizePoints × laneMultiplier), smallCap)
 * otherPoints = Σ medium and large (sizePoints × laneMultiplier)
 * score = (smallPoints + otherPoints + clusterBonus) × roadClassMultiplier + schoolZoneBonus
 *
 * Rule hits are written so their `points` add up to the score:
 *   R2 = base size points, R3 = extra points from the lane multiplier,
 *   R4 = cluster bonus, R5 = extra points from the road-class multiplier,
 *   R6 = school-zone bonus. R1 always has 0 points (it filters, it does not add).
 */
import type { Detection, PhotoMeta, RuleHit, Severity } from "@/lib/types";
import { DEFAULT_RULES, LANE, RULE_TITLES, SEVERITY_BANDS, type RulesConfig } from "./config";

export type SizeClass = "small" | "medium" | "large";

export type DerivedDetection = {
  id: string;
  confidence: number;
  /** Share of the image covered by the box, in percent (rounded to 6 decimals). */
  areaPct: number;
  size: SizeClass;
  inLane: boolean;
  /** Counted towards the score (passed R1). */
  counted: boolean;
  /** Below the threshold but above the review floor. */
  review: boolean;
  /** Points this detection contributes after R2 and R3 (0 if not counted). */
  points: number;
};

export type ScoreResult = {
  score: number;
  severity: Severity;
  needsReview: boolean;
  ruleHits: RuleHit[];
  recommendedAction: string;
  slaHours: number | null;
  detections: DerivedDetection[];
};

const round = (value: number, digits = 2) => {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
};

export function areaPct(box: Detection["box"]): number {
  // Rounded so float noise (0.1 * 0.05 * 100 = 0.5000000000000001) never moves a size boundary.
  return round(box.w * box.h * 100, 6);
}

export function sizeClass(pct: number, config: RulesConfig = DEFAULT_RULES): SizeClass {
  if (pct < config.r2.smallBelowPct) return "small";
  if (pct < config.r2.largeFromPct) return "medium";
  return "large";
}

export function isInLane(box: Detection["box"]): boolean {
  const cx = round(box.x + box.w / 2, 6);
  const cy = round(box.y + box.h / 2, 6);
  return cx >= LANE.minCx && cx <= LANE.maxCx && cy >= LANE.minCy;
}

export function severityForScore(score: number): Severity {
  if (score <= 0) return "clear";
  if (score >= SEVERITY_BANDS.critical.fromScore) return "critical";
  if (score >= SEVERITY_BANDS.high.fromScore) return "high";
  if (score >= SEVERITY_BANDS.medium.fromScore) return "medium";
  return "low";
}

export function deriveDetections(
  detections: Detection[],
  config: RulesConfig = DEFAULT_RULES,
): DerivedDetection[] {
  const { r1, r2, r3 } = config;
  return detections.map((d) => {
    const pct = areaPct(d.box);
    const size = sizeClass(pct, config);
    const inLane = isInLane(d.box);
    const counted = r1.enabled ? d.confidence >= r1.threshold : true;
    const review = r1.enabled && !counted && d.confidence >= r1.reviewFloor;
    const sizePoints = r2.enabled ? r2[size] : 1;
    const laneMultiplier = r3.enabled && inLane ? r3.multiplier : 1;
    return {
      id: d.id,
      confidence: d.confidence,
      areaPct: pct,
      size,
      inLane,
      counted,
      review,
      points: counted ? round(sizePoints * laneMultiplier, 4) : 0,
    };
  });
}

export function scoreDetections(
  detections: Detection[],
  meta: PhotoMeta = {},
  config: RulesConfig = DEFAULT_RULES,
): ScoreResult {
  const derived = deriveDetections(detections, config);
  const counted = derived.filter((d) => d.counted);
  const reviewCount = derived.filter((d) => d.review).length;
  const hits: RuleHit[] = [];

  // R1: filter by confidence.
  if (config.r1.enabled) {
    const ignored = derived.length - counted.length - reviewCount;
    if (derived.length > 0) {
      const parts = [`${counted.length} of ${derived.length} detections at or above ${config.r1.threshold.toFixed(2)}`];
      if (reviewCount > 0) parts.push(`${reviewCount} flagged for review`);
      if (ignored > 0) parts.push(`${ignored} below ${config.r1.reviewFloor.toFixed(2)} ignored`);
      hits.push({ ruleId: "R1", title: RULE_TITLES.r1, detail: parts.join(", "), points: 0 });
    }
  }

  // R2 + R3: size points and lane multiplier. Small detections are capped together (R2),
  // both before and after the lane multiplier, so the R2 and R3 hits still add up.
  const capSmall = (v: number) => (config.r2.enabled ? Math.min(v, config.r2.smallCap) : v);
  const base = (d: DerivedDetection) => (config.r2.enabled ? config.r2[d.size] : 1);
  const isSmall = (d: DerivedDetection) => d.size === "small";
  const smallBase = counted.filter(isSmall).reduce((sum, d) => sum + base(d), 0);
  const smallLane = counted.filter(isSmall).reduce((sum, d) => sum + d.points, 0);
  const otherBase = counted.filter((d) => !isSmall(d)).reduce((sum, d) => sum + base(d), 0);
  const otherLane = counted.filter((d) => !isSmall(d)).reduce((sum, d) => sum + d.points, 0);
  const smallCapped = config.r2.enabled && smallBase > config.r2.smallCap;
  const basePoints = capSmall(smallBase) + otherBase;
  const lanePoints = capSmall(smallLane) + otherLane;
  if (counted.length > 0) {
    const bySize = (["large", "medium", "small"] as const)
      .map((s) => ({ s, n: counted.filter((d) => d.size === s).length }))
      .filter(({ n }) => n > 0)
      .map(({ s, n }) => `${n} ${s}`)
      .join(", ");
    hits.push({
      ruleId: "R2",
      title: RULE_TITLES.r2,
      detail: config.r2.enabled
        ? `${bySize} (${config.r2.small}/${config.r2.medium}/${config.r2.large} points)` +
          (smallCapped ? `, small detections capped at ${config.r2.smallCap} points` : "")
        : `Rule off: each counted detection is worth 1 point (${bySize})`,
      points: round(basePoints),
    });
    const inLaneCount = counted.filter((d) => d.inLane).length;
    if (config.r3.enabled && inLaneCount > 0 && lanePoints !== basePoints) {
      hits.push({
        ruleId: "R3",
        title: RULE_TITLES.r3,
        detail: `${inLaneCount} in the driving lane, points ×${config.r3.multiplier}`,
        points: round(lanePoints - basePoints),
      });
    }
  }

  // R4: cluster bonus, counting only medium and large detections.
  let subtotal = lanePoints;
  const clusterCount = counted.filter((d) => !isSmall(d)).length;
  if (config.r4.enabled && clusterCount >= config.r4.minCount && clusterCount > 0) {
    subtotal += config.r4.bonus;
    hits.push({
      ruleId: "R4",
      title: RULE_TITLES.r4,
      detail: `${clusterCount} medium or large detections (${config.r4.minCount} or more), +${config.r4.bonus}`,
      points: round(config.r4.bonus),
    });
  }

  // R5: road class multiplier (residential when unknown).
  const roadClass = meta.roadClass ?? "residential";
  const roadMultiplier = config.r5.enabled ? config.r5[roadClass] : 1;
  const afterRoad = subtotal * roadMultiplier;
  if (config.r5.enabled && subtotal > 0 && roadMultiplier !== 1) {
    hits.push({
      ruleId: "R5",
      title: RULE_TITLES.r5,
      detail: `${roadClass}, score ×${roadMultiplier}`,
      points: round(afterRoad - subtotal),
    });
  }

  // R6: school zone bonus, only when something was counted.
  let score = afterRoad;
  if (config.r6.enabled && meta.schoolZone && counted.length > 0) {
    score += config.r6.bonus;
    hits.push({
      ruleId: "R6",
      title: RULE_TITLES.r6,
      detail: `School zone, +${config.r6.bonus}`,
      points: round(config.r6.bonus),
    });
  }

  score = counted.length === 0 ? 0 : round(score);
  const severity = severityForScore(score);
  const band = SEVERITY_BANDS[severity];
  return {
    score,
    severity,
    needsReview: reviewCount > 0,
    ruleHits: hits,
    recommendedAction: band.action,
    slaHours: band.slaHours,
    detections: derived,
  };
}
