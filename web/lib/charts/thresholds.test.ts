import { describe, expect, it } from "vitest";
import { DEFAULT_RULES } from "@/lib/rules/config";
import { DEFAULT_SIGNAGE } from "@/lib/signage/config";
import { binPosition, splitBins, thresholdText } from "./thresholds";

describe("thresholdText", () => {
  it("names the rule and the value with two decimals", () => {
    expect(thresholdText("R1", DEFAULT_RULES.r1.threshold, DEFAULT_RULES.r1.threshold)).toBe(
      `R1 ${DEFAULT_RULES.r1.threshold.toFixed(2)}`,
    );
    expect(thresholdText("S2", DEFAULT_SIGNAGE.s2.minMargin, DEFAULT_SIGNAGE.s2.minMargin)).toBe(
      `S2 ${DEFAULT_SIGNAGE.s2.minMargin.toFixed(2)}`,
    );
  });

  it("marks a value that differs from the default", () => {
    const changed = DEFAULT_SIGNAGE.s1.minMargin + 0.1;
    expect(thresholdText("S1", changed, DEFAULT_SIGNAGE.s1.minMargin)).toBe(`S1 ${changed.toFixed(2)} (your setting)`);
  });

  it("ignores floating-point noise from the sliders", () => {
    expect(thresholdText("S1", 0.1 + 0.2, 0.3)).toBe("S1 0.30");
  });
});

describe("binPosition", () => {
  it("puts a value on a bin edge at that edge", () => {
    expect(binPosition(0.4, 0.25, 0.05, 15)).toBeCloseTo(3);
    expect(binPosition(0.25, 0.25, 0.05, 15)).toBe(0);
    expect(binPosition(1, 0.25, 0.05, 15)).toBeCloseTo(15);
  });

  it("puts a value between edges inside its bin", () => {
    expect(binPosition(0.42, 0.25, 0.05, 15)).toBeCloseTo(3.4);
  });

  it("returns null outside the bins", () => {
    expect(binPosition(0.2, 0.25, 0.05, 15)).toBeNull();
    expect(binPosition(1.1, 0, 0.05, 20)).toBeNull();
  });
});

describe("splitBins", () => {
  it("bins values and splits the bin the threshold cuts through", () => {
    const bins = splitBins([0.3, 0.86, 0.89, 0.9, 1], 0.3, 1, 0.05, 0.88);
    expect(bins).toHaveLength(14);
    expect(bins[0]).toMatchObject({ label: "0.30", count: 1, below: 1, atOrAbove: 0 });
    expect(bins[11]).toMatchObject({ label: "0.85", count: 2, below: 1, atOrAbove: 1 });
    expect(bins[12]).toMatchObject({ label: "0.90", count: 1, below: 0, atOrAbove: 1 });
    expect(bins[13]).toMatchObject({ label: "0.95", count: 1, below: 0, atOrAbove: 1 });
  });

  it("counts a value equal to the threshold as passing, like the rules", () => {
    const [bin] = splitBins([0.4], 0.4, 0.45, 0.05, 0.4);
    expect(bin).toMatchObject({ below: 0, atOrAbove: 1 });
  });

  it("drops values below the first bin", () => {
    expect(splitBins([0.1], 0.25, 1, 0.05, 0.4).every((b) => b.count === 0)).toBe(true);
  });
});
