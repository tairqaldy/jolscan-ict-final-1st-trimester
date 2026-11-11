/**
 * Default rule configuration. Source of truth: docs/RULES.md.
 *
 * These are not an official road-maintenance standard. R2 size bands come
 * from D-11 training data; D-6 human calibration of severity remains separate.
 */
import type { RoadClass, Severity } from "@/lib/types";

export type RulesConfig = {
  /** R1 Confidence threshold. Below `threshold` but >= `reviewFloor`: not counted, flagged for review. */
  r1: { enabled: boolean; threshold: number; reviewFloor: number };
  /**
   * R2 Size points. `smallBelowPct` / `largeFromPct` are areaPct cut-offs (share of image, in %).
   * `smallCap`: all small detections together add at most this many points (after R3), because
   * the detector's false alarms are mostly small.
   */
  r2: {
    enabled: boolean;
    small: number;
    medium: number;
    large: number;
    smallBelowPct: number;
    largeFromPct: number;
    smallCap: number;
  };
  /** R3 Driving lane multiplier. */
  r3: { enabled: boolean; multiplier: number };
  /** R4 Cluster bonus: `minCount` or more counted detections of size medium or large. */
  r4: { enabled: boolean; minCount: number; bonus: number };
  /** R5 Road class multiplier. */
  r5: { enabled: boolean } & Record<RoadClass, number>;
  /** R6 School zone bonus, added after R5. */
  r6: { enabled: boolean; bonus: number };
};

export type RuleId = keyof RulesConfig;

export const DEFAULT_RULES: RulesConfig = {
  r1: { enabled: true, threshold: 0.4, reviewFloor: 0.25 },
  r2: {
    enabled: true,
    small: 1,
    medium: 2,
    large: 4,
    smallBelowPct: 1.1479263698068863,
    largeFromPct: 7.269630165893015,
    smallCap: 2,
  },
  r3: { enabled: true, multiplier: 1.5 },
  r4: { enabled: true, minCount: 3, bonus: 2 },
  r5: { enabled: true, residential: 1.0, arterial: 1.25, highway: 1.5 },
  r6: { enabled: true, bonus: 2 },
};

/** "In lane" geometry (RULES.md). Fixed, not editable on the Rules page. */
export const LANE = { minCx: 0.25, maxCx: 0.75, minCy: 0.5 } as const;

/** Human titles, used for rule hits and the Rules page. */
export const RULE_TITLES: Record<RuleId, string> = {
  r1: "Confidence threshold",
  r2: "Size points",
  r3: "Driving lane",
  r4: "Cluster",
  r5: "Road class",
  r6: "School zone",
};

/**
 * Severity bands (RULES.md "Severity and action").
 * A score of 0 is `clear`; any score above 0 is at least `low`;
 * otherwise the highest band whose `fromScore` (inclusive) is reached wins.
 */
export const SEVERITY_BANDS: Record<
  Severity,
  { fromScore: number; action: string; slaHours: number | null }
> = {
  clear: { fromScore: 0, action: "No action", slaHours: null },
  low: { fromScore: 0, action: "Add to the next scheduled maintenance round", slaHours: null },
  medium: { fromScore: 2, action: "Schedule a patch repair", slaHours: 336 },
  high: { fromScore: 5, action: "Send a repair crew", slaHours: 72 },
  critical: { fromScore: 9, action: "Mark the hazard and repair urgently", slaHours: 24 },
};

/**
 * Merge a partial / untrusted config (from localStorage or a request body)
 * over the defaults, keeping only known numeric/boolean fields.
 */
export function normaliseRules(input: unknown): RulesConfig {
  const out = structuredClone(DEFAULT_RULES);
  if (!input || typeof input !== "object") return out;
  const src = input as Record<string, Record<string, unknown>>;
  for (const ruleId of Object.keys(out) as RuleId[]) {
    const given = src[ruleId];
    if (!given || typeof given !== "object") continue;
    const target = out[ruleId] as Record<string, number | boolean>;
    for (const key of Object.keys(target)) {
      const value = given[key];
      if (typeof target[key] === "boolean" && typeof value === "boolean") target[key] = value;
      if (typeof target[key] === "number" && typeof value === "number" && Number.isFinite(value)) {
        target[key] = value;
      }
    }
  }
  return out;
}
