import { describe, expect, it } from "vitest";
import { MOCK_ANALYSES } from "./analyses";
import { MOCK_RESTROOM_CHECKS } from "./restroom-checks";
import { isSeededDemo } from "./seeded";

describe("seeded demo records are recognisable", () => {
  it("marks every seeded road analysis and sign check", () => {
    expect(MOCK_ANALYSES.length).toBeGreaterThan(0);
    expect(MOCK_ANALYSES.every((a) => isSeededDemo(a.id))).toBe(true);
    expect(MOCK_RESTROOM_CHECKS.every((c) => isSeededDemo(c.id))).toBe(true);
  });

  it("does not mark a real analysis id from the analyze route", () => {
    // The analyze route names real analyses `an-<uuid prefix>`.
    expect(isSeededDemo("an-1a2b3c4d")).toBe(false);
  });
});
