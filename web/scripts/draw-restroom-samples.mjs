#!/usr/bin/env node
/**
 * Draws the twelve restroom door-sign icons in public/samples/restrooms/.
 *
 * They are original, simple SVG drawings made for this project (no downloaded
 * images, nothing from the IOAI repository). Each design set has a male and a
 * female sign in one style, so the mock similarity in samples.json ("high
 * within a set, lower across sets") matches what you see. Re-run after editing:
 *
 *   pnpm draw-restroom-samples
 *
 * To use real IOAI images instead: put them in public/samples/restrooms/, point
 * `file` in samples.json at them and paste real model outputs into `mock`.
 * The IOAI data is CC-BY-4.0, so keep the attribution (see web/README.md).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "samples", "restrooms");

/** Plate (the sign itself). Hex is fine here: these files are pictures, not UI. */
const plate = ({ fill, stroke, strokeWidth = 0, rx }) =>
  `<rect x="8" y="8" width="184" height="224" rx="${rx}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${strokeWidth}"` : ""}/>`;

/** Solid pictogram figures (classic, faint, twins). */
const solid = {
  male: (c) => `<g fill="${c}">
    <circle cx="100" cy="56" r="20"/>
    <rect x="72" y="84" width="56" height="76" rx="10"/>
    <rect x="55" y="86" width="13" height="64" rx="6.5"/>
    <rect x="132" y="86" width="13" height="64" rx="6.5"/>
    <rect x="74" y="150" width="23" height="72" rx="6"/>
    <rect x="103" y="150" width="23" height="72" rx="6"/>
  </g>`,
  female: (c) => `<g fill="${c}" stroke="${c}" stroke-linejoin="round">
    <circle cx="100" cy="56" r="20" stroke="none"/>
    <path d="M84 86 H116 L142 170 H58 Z" stroke-width="10"/>
    <rect x="57" y="90" width="12" height="56" rx="6" stroke="none" transform="rotate(14 63 90)"/>
    <rect x="131" y="90" width="12" height="56" rx="6" stroke="none" transform="rotate(-14 137 90)"/>
    <rect x="80" y="168" width="15" height="54" rx="6" stroke="none"/>
    <rect x="105" y="168" width="15" height="54" rx="6" stroke="none"/>
  </g>`,
};

const SIGNS = {
  // Set 1: classic pictogram, dark figure on a light plate.
  "classic-m": () => plate({ fill: "#f4f3ef", stroke: "#2b2b2b", strokeWidth: 6, rx: 6 }) + solid.male("#1f2a36"),
  "classic-f": () => plate({ fill: "#f4f3ef", stroke: "#2b2b2b", strokeWidth: 6, rx: 6 }) + solid.female("#1f2a36"),

  // Set 2: rounded, soft shapes, light figure on a dark green plate.
  "rounded-m": () =>
    plate({ fill: "#2f5d50", rx: 44 }) +
    `<g fill="#f6f1e7">
      <circle cx="100" cy="58" r="24"/>
      <rect x="70" y="92" width="60" height="80" rx="30"/>
      <rect x="50" y="96" width="16" height="60" rx="8"/>
      <rect x="134" y="96" width="16" height="60" rx="8"/>
      <rect x="76" y="148" width="21" height="72" rx="10.5"/>
      <rect x="103" y="148" width="21" height="72" rx="10.5"/>
    </g>`,
  "rounded-f": () =>
    plate({ fill: "#2f5d50", rx: 44 }) +
    `<g fill="#f6f1e7">
      <circle cx="100" cy="58" r="24"/>
      <path d="M100 90 C82 90 76 100 72 120 L58 174 Q56 184 66 184 H134 Q144 184 142 174 L128 120 C124 100 118 90 100 90 Z"/>
      <rect x="52" y="98" width="15" height="54" rx="7.5" transform="rotate(12 59 98)"/>
      <rect x="133" y="98" width="15" height="54" rx="7.5" transform="rotate(-12 141 98)"/>
      <rect x="82" y="176" width="16" height="46" rx="8"/>
      <rect x="102" y="176" width="16" height="46" rx="8"/>
    </g>`,

  // Set 3: line art, outlines only on a white plate.
  "line-m": () =>
    plate({ fill: "#ffffff", stroke: "#2a2a2a", strokeWidth: 3, rx: 12 }) +
    `<g fill="none" stroke="#2a2a2a" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="100" cy="56" r="18"/>
      <path d="M70 92 Q70 86 76 86 H124 Q130 86 130 92 V150 H118 V218 H104 V158 H96 V218 H82 V150 H70 Z"/>
    </g>`,
  "line-f": () =>
    plate({ fill: "#ffffff", stroke: "#2a2a2a", strokeWidth: 3, rx: 12 }) +
    `<g fill="none" stroke="#2a2a2a" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="100" cy="56" r="18"/>
      <path d="M90 86 H110 L138 168 H114 V218 H103 V168 H97 V218 H86 V168 H62 Z"/>
    </g>`,

  // Set 4: minimal geometric, circle plus square or triangle.
  "geometric-m": () =>
    plate({ fill: "#1f1f22", rx: 6 }) +
    `<g fill="#f2f2f2"><circle cx="100" cy="72" r="24"/><rect x="70" y="110" width="60" height="104"/></g>`,
  "geometric-f": () =>
    plate({ fill: "#1f1f22", rx: 6 }) +
    `<g fill="#f2f2f2"><circle cx="100" cy="72" r="24"/><path d="M100 106 L142 214 H58 Z"/></g>`,

  // Set 5 (tricky): the female sign differs from the male one only by a slight flare at the hips.
  "faint-m": () => plate({ fill: "#d9dad6", stroke: "#8a8b86", strokeWidth: 4, rx: 16 }) + solid.male("#3a3d42"),
  "faint-f": () =>
    plate({ fill: "#d9dad6", stroke: "#8a8b86", strokeWidth: 4, rx: 16 }) +
    `<g fill="#3a3d42" stroke="#3a3d42" stroke-linejoin="round">
      <circle cx="100" cy="56" r="20" stroke="none"/>
      <path d="M74 86 H126 L133 160 H67 Z" stroke-width="8"/>
      <rect x="55" y="86" width="13" height="64" rx="6.5" stroke="none"/>
      <rect x="132" y="86" width="13" height="64" rx="6.5" stroke="none"/>
      <rect x="74" y="150" width="23" height="72" rx="6" stroke="none"/>
      <rect x="103" y="150" width="23" height="72" rx="6" stroke="none"/>
    </g>`,

  // Set 6 (tricky): both figures wear trousers; the female one only has a ponytail.
  "twins-m": () =>
    plate({ fill: "#6b4a2f", rx: 20 }) +
    `<g fill="#f1e6cf">
      <circle cx="100" cy="56" r="19"/>
      <rect x="74" y="84" width="52" height="74" rx="9"/>
      <rect x="58" y="86" width="12" height="62" rx="6"/>
      <rect x="130" y="86" width="12" height="62" rx="6"/>
      <rect x="76" y="148" width="21" height="74" rx="6"/>
      <rect x="103" y="148" width="21" height="74" rx="6"/>
    </g>`,
  "twins-f": () =>
    plate({ fill: "#6b4a2f", rx: 20 }) +
    `<g fill="#f1e6cf">
      <circle cx="100" cy="56" r="19"/>
      <ellipse cx="121" cy="50" rx="8" ry="11" transform="rotate(-25 121 50)"/>
      <rect x="76" y="84" width="48" height="74" rx="9"/>
      <rect x="60" y="86" width="12" height="62" rx="6"/>
      <rect x="128" y="86" width="12" height="62" rx="6"/>
      <rect x="77" y="148" width="20" height="74" rx="6"/>
      <rect x="103" y="148" width="20" height="74" rx="6"/>
    </g>`,
};

fs.mkdirSync(dir, { recursive: true });
for (const [id, draw] of Object.entries(SIGNS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">\n${draw()}\n</svg>\n`;
  fs.writeFileSync(path.join(dir, `${id}.svg`), svg);
}
console.log(`Drew ${Object.keys(SIGNS).length} restroom signs in ${path.relative(process.cwd(), dir)}`);
