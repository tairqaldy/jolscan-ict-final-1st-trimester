/**
 * W-30: every demo path link must open its page with the input selected.
 *
 * The pages ignore an unknown sample id and open empty, so a renamed sample
 * (D-5, C-13 replace the drawings with photos) would break the demo silently.
 * This test fails instead.
 */
import { describe, expect, it } from "vitest";
import { DEMO_PATH } from "./demo-path";
import { getRestroomSample } from "./mock/restroom-samples";
import { getSample } from "./mock/samples";

describe("Demo path (W-30)", () => {
  it("has the seven steps of the demo script", () => {
    expect(DEMO_PATH).toHaveLength(7);
  });

  it.each(DEMO_PATH.map((step) => [step.title, step.href]))("%s opens with its input selected (%s)", (_title, href) => {
    const url = new URL(href, "http://localhost");
    const id = (name: string) => url.searchParams.get(name);

    if (url.pathname === "/app/roads/analyze") {
      expect(getSample(id("sample"))).toBeDefined();
    } else if (url.pathname === "/app/restrooms/compare") {
      expect(getRestroomSample(id("a"))).toBeDefined();
      expect(getRestroomSample(id("b"))).toBeDefined();
    } else if (url.pathname === "/app/restrooms/match") {
      expect(getRestroomSample(id("q"))).toBeDefined();
    } else {
      // The model page is the only step without an input to select.
      expect(url.pathname).toBe("/app/model");
    }
  });
});
