/**
 * Marks for the rule hits in the landing section "Rules you can read" (G-61).
 *
 * The sentence comes from the rules engine (`detail` of a rule hit). This file
 * only finds the rule's setting (the threshold or multiplier you can change on
 * the Rules page) and the measured value inside that sentence, so the page can
 * highlight them. The tokens are formatted from the same config and result the
 * engine used, so nothing here is typed by hand.
 */
import { DEFAULT_RULES, type RulesConfig } from "@/lib/rules";
import { DEFAULT_SIGNAGE, formatAgainst, type DoorAssignment, type SignageConfig } from "@/lib/signage";
import type { RuleHit, SignageRuleHit } from "@/lib/types";

/** `setting`: the rule's threshold or multiplier. `value`: what the sample measured. */
export type MarkKind = "setting" | "value";
export type Mark = { token: string; kind: MarkKind };
export type Segment = { text: string; kind?: MarkKind };

/**
 * Split `text` into plain and marked segments. Marks are searched in order,
 * each one after the end of the previous match, so a threshold that also
 * appears earlier in the sentence is not marked in the wrong place. A token
 * that is not found is skipped; the text is never changed.
 */
export function markText(text: string, marks: Mark[]): Segment[] {
  const out: Segment[] = [];
  let from = 0;
  for (const mark of marks) {
    if (!mark.token) continue;
    const at = text.indexOf(mark.token, from);
    if (at < 0) continue;
    if (at > from) out.push({ text: text.slice(from, at) });
    out.push({ text: mark.token, kind: mark.kind });
    from = at + mark.token.length;
  }
  if (from < text.length) out.push({ text: text.slice(from) });
  return out;
}

/** Marks for a road rule hit: the setting the engine printed into the detail. */
export function roadHitMarks(hit: Pick<RuleHit, "ruleId">, config: RulesConfig = DEFAULT_RULES): Mark[] {
  switch (hit.ruleId) {
    case "R1":
      return [{ token: config.r1.threshold.toFixed(2), kind: "setting" }];
    case "R3":
      return [{ token: `×${config.r3.multiplier}`, kind: "setting" }];
    default:
      return [];
  }
}

/** Marks for a signage rule hit: the measured gap or similarity, then the threshold it was held against. */
export function signHitMarks(
  hit: Pick<SignageRuleHit, "ruleId">,
  doors: Pick<DoorAssignment, "margin">,
  similarity: number,
  config: SignageConfig = DEFAULT_SIGNAGE,
): Mark[] {
  const pair = (value: number, threshold: number): Mark[] => [
    { token: formatAgainst(value, threshold), kind: "value" },
    { token: threshold.toFixed(2), kind: "setting" },
  ];
  switch (hit.ruleId) {
    case "S2":
      return pair(doors.margin, config.s2.minMargin);
    case "S3":
      return pair(similarity, config.s3.minSimilarity);
    default:
      return [];
  }
}
