import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { duration, ease, stagger, timing } from "./motion";

const css = readFileSync(fileURLToPath(new URL("../app/tokens.css", import.meta.url)), "utf8");

/** Value of a CSS custom property in tokens.css (first declaration). */
function cssVar(name: string): string {
  const m = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`--${name} not found in tokens.css`);
  return m[1].trim();
}

const ms = (v: string) => Number(v.replace(/ms$/, "")) / 1000;

describe("motion tokens", () => {
  it("JS durations mirror the CSS --duration-* variables", () => {
    for (const [name, seconds] of Object.entries(duration)) {
      expect(ms(cssVar(`duration-${name}`)), name).toBeCloseTo(seconds, 5);
    }
    expect(ms(cssVar("duration-ui"))).toBeCloseTo(timing.ui, 5);
  });

  it("the default CSS transition uses a duration token, not a literal", () => {
    expect(cssVar("default-transition-duration")).toBe("var(--duration-ui)");
  });

  it("JS easings mirror the CSS --ease-* variables", () => {
    for (const [name, curve] of Object.entries(ease)) {
      expect(cssVar(`ease-${name}`), name).toBe(`cubic-bezier(${curve.join(", ")})`);
    }
  });

  it("keeps the stagger step positive and short", () => {
    expect(stagger).toBeGreaterThan(0);
    expect(stagger).toBeLessThan(duration.base);
  });
});
