/**
 * Threshold lines on the charts (G-71): the label text and where a rule value
 * falls on a binned histogram. Pure functions, so they are unit tested.
 * The values always come from the rule stores; nothing here knows a default.
 */

/** "R1 0.40", or "R1 0.30 (your setting)" when the value is not the default. */
export function thresholdText(rule: string, value: number, defaultValue: number): string {
  const text = `${rule} ${value.toFixed(2)}`;
  return Math.abs(value - defaultValue) > 1e-9 ? `${text} (your setting)` : text;
}

/**
 * Where `value` sits on `count` equal bins of width `step` that start at `from`,
 * measured in bins: 0 is the left edge of the first bin, `count` the right edge
 * of the last. Null when the value is outside the bins.
 */
export function binPosition(value: number, from: number, step: number, count: number): number | null {
  const pos = (value - from) / step;
  if (!Number.isFinite(pos) || pos < -1e-9 || pos > count + 1e-9) return null;
  return Math.min(count, Math.max(0, pos));
}

export type SplitBin = { lo: number; label: string; count: number; below: number; atOrAbove: number };

/**
 * Equal-width bins [from, from + step), the last one closed at `to`, each split
 * into values below `threshold` and values at or above it (the rules pass at
 * "at or above"). A bin that the threshold cuts through is drawn in two parts,
 * so the chart colours agree with the counts in the title.
 */
export function splitBins(values: number[], from: number, to: number, step: number, threshold: number): SplitBin[] {
  const n = Math.round((to - from) / step);
  const out = Array.from({ length: n }, (_, i) => {
    const lo = Math.round((from + i * step) * 100) / 100;
    return { lo, label: lo.toFixed(2), count: 0, below: 0, atOrAbove: 0 };
  });
  for (const v of values) {
    const i = Math.min(n - 1, Math.floor((v - from) / step + 1e-9));
    if (i < 0) continue;
    out[i].count++;
    if (v >= threshold) out[i].atOrAbove++;
    else out[i].below++;
  }
  return out;
}
