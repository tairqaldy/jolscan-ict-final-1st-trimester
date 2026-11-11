/**
 * G-41: the design lab data. Every token a variant overrides must exist in
 * app/tokens.css, and column A must be the live look.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LAB_SETS, LAB_THEMES, getLabSet, variantOverrides } from "./design-lab";

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
          for (const name of Object.keys(variantOverrides(v, t))) {
            expect(live[t].has(name) || theme.has(name), `${set.id}/${v.id} ${name}`).toBe(true);
          }
        }
      }
    }
  });

  it("radii: B differs from A only in --radius-md", () => {
    const set = getLabSet("radii");
    const [a, b] = set.variants;
    const ta = variantOverrides(a, "light");
    const tb = variantOverrides(b, "light");
    const diff = Object.keys(tb).filter((k) => ta[k] !== tb[k]);
    expect(diff).toEqual(["--radius-md"]);
  });

  it("falls back to the first set", () => {
    expect(getLabSet(undefined).id).toBe(LAB_SETS[0].id);
    expect(getLabSet("nope").id).toBe(LAB_SETS[0].id);
  });
});
