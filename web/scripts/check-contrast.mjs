#!/usr/bin/env node
/**
 * Contrast check of the high-contrast theme in app/tokens.css (task G-31). No dependencies.
 *
 *   node web/scripts/check-contrast.mjs
 *
 * Prints a Markdown table of WCAG 2.x contrast ratios (relative luminance, sRGB) for the
 * [data-theme="contrast"] block, and exits with 1 when a value misses its target:
 * text 7:1 (WCAG AAA, 1.4.6), UI marks 3:1 (WCAG 1.4.11). Missing tokens fall back to the
 * light values; the block must declare every token itself (lib/contrast-theme.test.ts).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TOKENS = join(dirname(fileURLToPath(import.meta.url)), "..", "app", "tokens.css");
const TEXT = 7;
const MARK = 3;

/** [token, target, backgrounds it is measured on]. "soft" = the token's own -soft fill. */
const ROWS = [
  ["fg", TEXT, ["bg", "surface", "surface-2", "surface-3"]],
  ["muted", TEXT, ["bg", "surface", "surface-2", "surface-3"]],
  ["subtle", TEXT, ["bg", "surface", "surface-2"]],
  ["accent-ink", TEXT, ["bg", "surface", "accent-soft"]],
  ["accent-fg", TEXT, ["accent", "accent-hover"]],
  ["inverse-fg", TEXT, ["inverse"]],
  ["danger", TEXT, ["bg", "surface", "danger-soft"]],
  ["surface", TEXT, ["danger"]],
  ["sev-clear-ink", TEXT, ["bg", "surface", "sev-clear-soft"]],
  ["sev-low-ink", TEXT, ["bg", "surface", "sev-low-soft"]],
  ["sev-medium-ink", TEXT, ["bg", "surface", "sev-medium-soft"]],
  ["sev-high-ink", TEXT, ["bg", "surface", "sev-high-soft"]],
  ["sev-critical-ink", TEXT, ["bg", "surface", "sev-critical-soft"]],
  ["verdict-clear-ink", TEXT, ["bg", "surface", "verdict-clear-soft"]],
  ["verdict-review-ink", TEXT, ["bg", "surface", "verdict-review-soft"]],
  ["verdict-confusing-ink", TEXT, ["bg", "surface", "verdict-confusing-soft"]],
  ["gender-male-ink", TEXT, ["bg", "surface", "gender-male-soft"]],
  ["gender-female-ink", TEXT, ["bg", "surface", "gender-female-soft"]],
  ["review-ink", TEXT, ["bg", "surface", "review-soft"]],
  ["box-ink", TEXT, ["box", "box-review", "box-active"]],
  ["border", MARK, ["bg", "surface"]],
  ["border-strong", MARK, ["bg", "surface", "surface-2"]],
  ["focus", MARK, ["bg", "surface", "surface-2"]],
  ["accent", MARK, ["bg", "surface"]],
  ["success", MARK, ["bg", "surface"]],
  ["sev-clear", MARK, ["bg", "surface"]],
  ["sev-low", MARK, ["bg", "surface"]],
  ["sev-medium", MARK, ["bg", "surface"]],
  ["sev-high", MARK, ["bg", "surface"]],
  ["sev-critical", MARK, ["bg", "surface"]],
  ["verdict-clear", MARK, ["bg", "surface"]],
  ["verdict-review", MARK, ["bg", "surface"]],
  ["verdict-confusing", MARK, ["bg", "surface"]],
  ["gender-male", MARK, ["bg", "surface"]],
  ["gender-female", MARK, ["bg", "surface"]],
  ["review", MARK, ["bg", "surface"]],
  ["chart-1", MARK, ["bg", "surface"]],
  ["chart-2", MARK, ["bg", "surface"]],
  ["chart-3", MARK, ["bg", "surface"]],
  ["chart-4", MARK, ["bg", "surface"]],
  // Photo boxes sit on a photo inside a black halo: measured against black.
  ["box", MARK, ["#000000"]],
  ["box-review", MARK, ["#000000"]],
  ["box-active", MARK, ["#000000"]],
];

function block(css, selector) {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("}", open));
}

function declarations(text) {
  const out = {};
  for (const m of text.matchAll(/--([\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

function resolve(vars, name) {
  if (name.startsWith("#")) return name;
  const value = vars[name];
  if (value === undefined) throw new Error(`token --${name} not found`);
  const alias = value.match(/^var\(--([\w-]+)\)$/);
  return alias ? resolve(vars, alias[1]) : value;
}

const channel = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function luminance(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`not a 6-digit hex colour: ${hex}`);
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const vars = declarations(block(readFileSync(TOKENS, "utf8"), '[data-theme="contrast"] {'));
let failed = 0;
console.log(`| Token | Value | Target | Ratio on |`);
console.log(`|---|---|---|---|`);
for (const [token, target, backs] of ROWS) {
  const fg = resolve(vars, token);
  const cells = backs.map((b) => {
    const r = ratio(fg, resolve(vars, b));
    if (r < target) failed++;
    return `${b} ${r.toFixed(2)}${r < target ? " **FAIL**" : ""}`;
  });
  console.log(`| \`${token}\` | \`${fg}\` | ${target}:1 | ${cells.join(", ")} |`);
}
console.log(`\n${failed} value(s) below target.`);
process.exitCode = failed ? 1 : 0;
