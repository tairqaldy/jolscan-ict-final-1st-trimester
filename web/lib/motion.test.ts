import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { duration, ease, reveal, stagger, staggerDelay, timing } from "./motion";

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

  it("every CSS --duration-* and --ease-* token has a JS twin (G-21)", () => {
    const js: Record<string, number> = { ...duration, ui: timing.ui };
    for (const [, name] of css.matchAll(/--duration-([\w-]+):/g)) expect(js[name], `--duration-${name}`).toBeDefined();
    for (const [, name] of css.matchAll(/--ease-([\w-]+):/g)) expect(name in ease, `--ease-${name}`).toBe(true);
  });

  it("the default CSS timing function is --ease-standard (G-21)", () => {
    expect(cssVar("default-transition-timing-function")).toBe(cssVar("ease-standard"));
  });

  it("keeps the stagger step positive and short", () => {
    expect(stagger).toBeGreaterThan(0);
    expect(stagger).toBeLessThan(duration.base);
  });
});

describe("staged result reveal (G-75)", () => {
  it("runs card, then key value, then rows, in order", () => {
    expect(reveal.card).toBeLessThan(reveal.key);
    expect(reveal.key).toBeLessThan(reveal.rows);
    expect(reveal.rows).toBeLessThanOrEqual(reveal.lastStart);
  });

  it("ends within the 600 ms budget", () => {
    expect(reveal.lastStart + duration.base).toBeLessThanOrEqual(reveal.budget + 1e-9);
    expect(reveal.budget).toBeLessThanOrEqual(0.6);
  });
});

describe("staggered entries end within the 600 ms budget (motion grill)", () => {
  const globals = readFileSync(fileURLToPath(new URL("../app/globals.css", import.meta.url)), "utf8");

  it("the CSS step mirrors the JS stagger", () => {
    expect(ms(cssVar("stagger-step"))).toBeCloseTo(stagger, 5);
  });

  it(".stagger: the last item's rise ends by reveal.budget", () => {
    const rules = [...globals.matchAll(/\.stagger > :nth-child\([^)]*\) \{ animation-delay: ([^;]+); \}/g)].map((m) => m[1]);
    expect(rules.length).toBeGreaterThan(0);
    const steps = rules.map((v) => (v === "var(--stagger-step)" ? 1 : Number(v.match(/\* (\d+)\)$/)?.[1])));
    for (const n of steps) expect(Number.isFinite(n)).toBe(true);
    expect(duration.slow + Math.max(...steps) * stagger).toBeLessThanOrEqual(reveal.budget + 1e-9);
    expect(globals).toMatch(/\.stagger > :nth-child\(n \+ \d+\)/);
  });

  it("staggerDelay steps by stagger and caps at the budget", () => {
    expect(staggerDelay(0, duration.slow)).toBe(0);
    expect(staggerDelay(1, duration.slow)).toBeCloseTo(stagger, 5);
    for (const d of [duration.base, duration.slow]) {
      for (let i = 0; i < 20; i++) expect(staggerDelay(i, d) + d).toBeLessThanOrEqual(reveal.budget + 1e-9);
    }
  });
});
