/**
 * G-41, G-46: the design lab data. The live colours copied into
 * lib/design-lab.ts for the contrast numbers are checked against
 * app/tokens.css, and every token a variant overrides must exist there.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CURRENT_PALETTE,
  LAB_SETS,
  LAB_THEMES,
  columnTokens,
  contrastRatio,
  contrastResults,
  getLabSet,
  variantOverrides,
} from "./design-lab";

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

function declarations(css: string, selector: string): Map<string, string> {
  const start = css.indexOf(selector);
  expect(start, `${selector} not found`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", start);
  const body = css.slice(open + 1, css.indexOf("}", open));
  const out = new Map<string, string>();
  for (const m of body.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) out.set(m[1], m[2].trim());
  return out;
}

const tokensCss = read("app/tokens.css");
const live = {
  light: declarations(tokensCss, ':root,\n[data-theme="light"]'),
  dark: declarations(tokensCss, '[data-theme="dark"] {'),
};
const theme = declarations(tokensCss, "@theme inline {");

describe("WCAG contrast", () => {
  it("matches known ratios", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    // Numbers from the G-3 audit in docs/DESIGN-BRIEF.md.
    expect(contrastRatio("#b87f00", "#ffffff")).toBeCloseTo(3.46, 2);
    expect(contrastRatio("#1b1c1e", "#f3f2ee")).toBeCloseTo(15.22, 2);
    expect(contrastRatio("#66686d", "#f3f2ee")).toBeCloseTo(4.98, 2);
  });

  it("uses the lowest background and the right target", () => {
    const results = contrastResults(CURRENT_PALETTE.light);
    const hints = results.find((r) => r.fg === "--subtle")!;
    expect(hints.ratio).toBe(4.98);
    expect(hints.pass).toBe(true);
    const mark = results.find((r) => r.fg === "--accent")!;
    expect(mark.min).toBe(3);
    expect(mark.ratio).toBe(3.46);
  });

  it("skips checks it cannot compute", () => {
    expect(contrastResults({ "--fg": "var(--x)", "--bg": "#ffffff" })).toEqual([]);
  });
});

describe("live colours match app/tokens.css", () => {
  it("palette, both themes", () => {
    for (const t of LAB_THEMES) {
      for (const [name, value] of Object.entries(CURRENT_PALETTE[t])) {
        expect(live[t].get(name), `${t} ${name}`).toBe(value);
      }
    }
  });
});

describe("lab sets", () => {
  it("have unique ids and at least two variants with unique ids", () => {
    expect(new Set(LAB_SETS.map((s) => s.id)).size).toBe(LAB_SETS.length);
    for (const set of LAB_SETS) {
      expect(set.variants.length, set.id).toBeGreaterThanOrEqual(2);
      expect(new Set(set.variants.map((v) => v.id)).size, set.id).toBe(set.variants.length);
    }
  });

  it("start with the live look: variant A overrides nothing", () => {
    for (const set of LAB_SETS) {
      for (const t of LAB_THEMES) expect(variantOverrides(set.variants[0], t), set.id).toEqual({});
    }
  });

  it("only override tokens that exist", () => {
    for (const set of LAB_SETS) {
      for (const v of set.variants) {
        for (const t of LAB_THEMES) {
          for (const name of Object.keys(columnTokens(set, v, t))) {
            expect(live[t].has(name) || theme.has(name), `${set.id}/${v.id} ${name}`).toBe(true);
          }
        }
      }
    }
  });

  it("radii: B differs from A only in --radius-md", () => {
    const set = getLabSet("radii");
    const [a, b] = set.variants;
    const ta = columnTokens(set, a, "light");
    const tb = columnTokens(set, b, "light");
    const diff = Object.keys(tb).filter((k) => ta[k] !== tb[k]);
    expect(diff).toEqual(["--radius-md"]);
  });

  it("palette: three variants, every text check passes in both themes", () => {
    const set = getLabSet("palette");
    expect(set.variants).toHaveLength(3);
    for (const v of set.variants) {
      for (const t of LAB_THEMES) {
        const results = contrastResults(columnTokens(set, v, t));
        expect(results, `${v.id} ${t}`).toHaveLength(6);
        for (const r of results) expect(r.pass, `${v.id} ${t} ${r.label} ${r.ratio}`).toBe(true);
      }
    }
  });

  it("falls back to the first set", () => {
    expect(getLabSet(undefined).id).toBe(LAB_SETS[0].id);
    expect(getLabSet("nope").id).toBe(LAB_SETS[0].id);
  });
});
