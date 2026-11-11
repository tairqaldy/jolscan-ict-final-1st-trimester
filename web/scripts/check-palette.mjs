#!/usr/bin/env node
/**
 * Colour-blind check of the colour sets in app/tokens.css (task G-22). No dependencies.
 *
 *   node web/scripts/check-palette.mjs
 *
 * For each theme and each set it prints, per pair of colours, the CIE76 ΔE (distance in CIELAB)
 * for normal vision and for simulated protanopia, deuteranopia and tritanopia. Pairs below
 * ΔE 10 are marked: 10 is a rule of thumb chosen for this project, not a standard.
 *
 * Simulation: Machado, Oliveira and Fernandes (2009), "A Physiologically-based Model for
 * Simulation of Color Vision Deficiency", IEEE TVCG 15(6). The matrices are the severity 1.0
 * (dichromacy) rows of Table 1 on the authors' page, read on 11 November 2026:
 * https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
 * The page does not say which RGB space the matrices expect; like common implementations, they
 * are applied to linear RGB (sRGB decoded first), then re-encoded.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TOKENS = join(dirname(fileURLToPath(import.meta.url)), "..", "app", "tokens.css");
const THRESHOLD = 10;

const SETS = {
  severity: ["sev-clear", "sev-low", "sev-medium", "sev-high", "sev-critical"],
  verdict: ["verdict-clear", "verdict-review", "verdict-confusing"],
  gender: ["gender-male", "gender-female"],
  chart: ["chart-1", "chart-2", "chart-3", "chart-4"],
  boxes: ["box", "box-review"],
};

const MACHADO = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

/** The declarations inside the first block whose selector line matches. */
function block(css, selector) {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`unclosed block: ${selector}`);
}

function declarations(text) {
  const out = {};
  for (const m of text.matchAll(/--([\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

function resolve(vars, name, seen = new Set()) {
  const value = vars[name];
  if (value === undefined) throw new Error(`token --${name} not found`);
  const alias = value.match(/^var\(--([\w-]+)\)$/);
  if (!alias) return value;
  if (seen.has(name)) throw new Error(`alias loop at --${name}`);
  seen.add(name);
  return resolve(vars, alias[1], seen);
}

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp = (c) => Math.min(1, Math.max(0, c));
const mul = (m, v) => m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);

function simulate(rgb, kind) {
  if (!kind) return rgb;
  return mul(MACHADO[kind], rgb.map(toLinear)).map((c) => toGamma(clamp(c)));
}

function toLab(rgb) {
  const [r, g, b] = rgb.map(toLinear);
  // sRGB D65 to XYZ, then CIELAB with the D65 white point.
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

const deltaE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function themeTokens(css, theme) {
  const light = declarations(block(css, '[data-theme="light"] {'));
  if (theme === "light") return light;
  return { ...light, ...declarations(block(css, '[data-theme="dark"] {')) };
}

const css = readFileSync(TOKENS, "utf8");
const kinds = [null, "protan", "deutan", "tritan"];
let flagged = 0;
console.log(`# Colour-blind check of web/app/tokens.css\n`);
console.log(`CIE76 ΔE between every pair in a set. **Bold** = below ${THRESHOLD}, a rule of thumb chosen for this project, not a standard.`);
console.log(`Simulation: Machado, Oliveira and Fernandes (2009), severity 1.0, on linear RGB.\n`);
for (const theme of ["light", "dark"]) {
  const vars = themeTokens(css, theme);
  console.log(`## ${theme[0].toUpperCase()}${theme.slice(1)} theme\n`);
  console.log("| Set | Pair | Normal | Protan | Deutan | Tritan |");
  console.log("|---|---|---|---|---|---|");
  for (const [set, names] of Object.entries(SETS)) {
    const rgb = Object.fromEntries(names.map((n) => [n, hexToRgb(resolve(vars, n))]));
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const cells = kinds.map((k) => {
          const d = deltaE(toLab(simulate(rgb[names[i]], k)), toLab(simulate(rgb[names[j]], k)));
          if (d < THRESHOLD) flagged++;
          return d < THRESHOLD ? `**${d.toFixed(1)}**` : d.toFixed(1);
        });
        console.log(`| ${set} | ${names[i]} / ${names[j]} | ${cells.join(" | ")} |`);
      }
    }
  }
  console.log("");
}
console.log(`${flagged} value(s) below ΔE ${THRESHOLD}.`);
