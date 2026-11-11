/**
 * G-31: the high-contrast theme in app/tokens.css. It must declare every token
 * itself (a missing one silently falls back to light), keep text at 7:1 and
 * marks at 3:1 (WCAG 2.x relative luminance), and print as light paper.
 * The full table: node scripts/check-contrast.mjs, copied to docs/DESIGN-BRIEF.md.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

function declarations(css: string, selector: string): Map<string, string> {
  const start = css.indexOf(selector);
  expect(start, `${selector} not found`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", start);
  const body = css.slice(open + 1, css.indexOf("}", open));
  const out = new Map<string, string>();
  for (const m of body.matchAll(/^\s*(--[\w-]+|color-scheme):\s*([^;]+);/gm)) out.set(m[1], m[2].trim());
  return out;
}

const channel = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const tokens = read("app/tokens.css");
const light = declarations(tokens, ':root,\n[data-theme="light"]');
const contrast = declarations(tokens, '[data-theme="contrast"] {');

function hex(name: string): string {
  const value = contrast.get(`--${name}`);
  expect(value, `--${name}`).toBeDefined();
  const alias = value!.match(/^var\(--([\w-]+)\)$/);
  return alias ? hex(alias[1]) : value!;
}

const TEXT = [
  "fg",
  "muted",
  "subtle",
  "accent-ink",
  "danger",
  "sev-clear-ink",
  "sev-low-ink",
  "sev-medium-ink",
  "sev-high-ink",
  "sev-critical-ink",
  "verdict-clear-ink",
  "verdict-review-ink",
  "verdict-confusing-ink",
  "gender-male-ink",
  "gender-female-ink",
  "review-ink",
];
const MARKS = [
  "border",
  "border-strong",
  "focus",
  "accent",
  "success",
  "sev-clear",
  "sev-low",
  "sev-medium",
  "sev-high",
  "sev-critical",
  "review",
  "gender-male",
  "gender-female",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
];

describe("high-contrast theme (G-31)", () => {
  it("declares every token of the light theme, and no others", () => {
    expect([...contrast.keys()].sort()).toEqual([...light.keys()].sort());
    expect(contrast.get("color-scheme")).toBe("light");
  });

  it.each(TEXT)("text token --%s is at least 7:1 on bg and surface", (name) => {
    expect(ratio(hex(name), hex("bg"))).toBeGreaterThanOrEqual(7);
    expect(ratio(hex(name), hex("surface"))).toBeGreaterThanOrEqual(7);
  });

  it("text on fills is at least 7:1 (buttons, tooltips, badges)", () => {
    expect(ratio(hex("accent-fg"), hex("accent"))).toBeGreaterThanOrEqual(7);
    expect(ratio(hex("accent-fg"), hex("accent-hover"))).toBeGreaterThanOrEqual(7);
    expect(ratio(hex("inverse-fg"), hex("inverse"))).toBeGreaterThanOrEqual(7);
    expect(ratio(hex("surface"), hex("danger"))).toBeGreaterThanOrEqual(7);
    for (const ink of TEXT.filter((t) => t.endsWith("-ink") && t !== "accent-ink")) {
      expect(ratio(hex(ink), hex(ink.replace(/-ink$/, "-soft"))), ink).toBeGreaterThanOrEqual(7);
    }
  });

  it.each(MARKS)("mark --%s is at least 3:1 on bg and surface", (name) => {
    expect(ratio(hex(name), hex("bg"))).toBeGreaterThanOrEqual(3);
    expect(ratio(hex(name), hex("surface"))).toBeGreaterThanOrEqual(3);
  });

  it("prints as light paper, like the dark theme (G-25)", () => {
    const print = read("app/print.css");
    const media = print.slice(print.indexOf("@media print"));
    const selector = media.slice(0, media.indexOf("{", media.indexOf('[data-theme="dark"]')));
    expect(selector).toContain('[data-theme="contrast"]');
  });
});
