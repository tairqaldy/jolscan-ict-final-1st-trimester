import { describe, expect, it } from "vitest";
import { dayKey, formatDate, formatDateTime, formatDayKey, formatPct, formatScore, formatSla, median, percentile } from "./format";

describe("formatting helpers", () => {
  it("formats UTC timestamps consistently across Astana midnight", () => {
    expect(formatDate("2026-11-10T19:30:00.000Z")).toBe("11 Nov 2026");
    expect(formatDateTime("2026-11-08T09:05:00.000Z")).toBe("8 Nov, 14:05");
    expect(dayKey("2026-11-10T19:30:00.000Z")).toBe("2026-11-11");
    expect(formatDayKey("2026-11-08")).toBe("8 Nov");
  });
  it("formats deadlines, percentages and scores", () => {
    expect([null, 24, 60, 72, 336].map(formatSla)).toEqual(["No target", "24 h", "60 h", "3 days (72 h)", "14 days (336 h)"]);
    expect(formatPct(0.4)).toBe("40%"); expect(formatPct(0.456, 1)).toBe("45.6%");
    expect([3, 2.5, 2.25].map(formatScore)).toEqual(["3", "2.5", "2.25"]);
  });
  it("computes rounded median and nearest-rank percentiles without mutating input", () => {
    const values = [3, 1, 2]; expect(median([])).toBe(0); expect(median(values)).toBe(2); expect(values).toEqual([3, 1, 2]);
    expect(median([1, 2, 3, 4])).toBe(3); expect(percentile([10, 20, 30, 40], 50)).toBe(20); expect(percentile([10, 20, 30, 40], 95)).toBe(40);
  });
});
