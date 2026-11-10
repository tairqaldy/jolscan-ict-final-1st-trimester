#!/usr/bin/env node
/**
 * Draws the six sample "photos" in public/samples/ from samples.json.
 *
 * They are simple original SVG road scenes (no downloaded images). Each
 * pothole is drawn inside its detection box from the manifest, so the mock
 * detections always line up with the picture. Re-run after editing boxes:
 *
 *   pnpm draw-samples
 *
 * When real photos arrive you do not need this script: put the photo in
 * public/samples/ and edit samples.json (file, size, detections).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "samples");
const manifest = JSON.parse(fs.readFileSync(path.join(dir, "samples.json"), "utf8"));

/** Small deterministic PRNG (mulberry32). */
function prng(seedText) {
  let seed = 0;
  for (const ch of seedText) seed = (Math.imul(seed ^ ch.charCodeAt(0), 2654435761) + 1) >>> 0;
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

/** Scene palettes. Hex is fine here: these files are pictures, not UI. */
const SCENES = {
  highway: { sky: ["#c9d3dc", "#e7e9e6"], verge: "#8c8a6a", far: "#7d8a7a", asphalt: "#4a4b4d", line: "#f1efe6" },
  arterial: { sky: ["#cfd5da", "#ecebe6"], verge: "#9a978a", far: "#8f939a", asphalt: "#505154", line: "#f2f0e8" },
  residential: { sky: ["#d6dbe0", "#efede8"], verge: "#8e9270", far: "#a49c8f", asphalt: "#545457", line: "#efede4" },
};

function pothole(box, W, H, rand, faint) {
  const cx = (box.x + box.w / 2) * W;
  const cy = (box.y + box.h / 2) * H;
  const rx = (box.w * W) / 2;
  const ry = (box.h * H) / 2;
  const ring = (scale, jitterMin) => {
    const pts = [];
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = scale * (jitterMin + rand() * (1 - jitterMin));
      pts.push(`${f(cx + Math.cos(a) * rx * r)},${f(cy + Math.sin(a) * ry * r)}`);
    }
    return pts.join(" ");
  };
  const opacity = faint ? 0.42 : 1;
  return `
  <g opacity="${opacity}">
    <polygon points="${ring(0.94, 0.8)}" fill="#7b786f"/>
    <polygon points="${ring(0.84, 0.78)}" fill="${faint ? "#3b3a38" : "#1d1d1e"}"/>
    <polygon points="${ring(0.55, 0.7)}" fill="${faint ? "#33322f" : "#121213"}" transform="translate(0 ${f(-ry * 0.12)})"/>
  </g>`;
}

function scene(sample) {
  const W = sample.imageWidth;
  const H = sample.imageHeight;
  const rand = prng(sample.id);
  const roadClass = sample.meta.roadClass;
  const p = SCENES[roadClass];
  const hy = 0.38 * H;
  const fresh = sample.detections.length === 0;
  const X = (t) => f(t * W);

  // Distant skyline: buildings for city roads, a tree line for the highway.
  let far = "";
  let x = 0;
  while (x < W) {
    const w = 30 + rand() * 90;
    const h = roadClass === "highway" ? 8 + rand() * 18 : 20 + rand() * 70;
    far += `<rect x="${f(x)}" y="${f(hy - h)}" width="${f(w)}" height="${f(h + 2)}" fill="${p.far}" opacity="${f(0.45 + rand() * 0.4)}"/>`;
    x += w + rand() * 20;
  }

  // Centre dashes, spaced in perspective (distance z -> screen y = hy + (H-hy)/z).
  let dashes = "";
  for (let z = 1.05; z < 14; z *= 1.35) {
    const y1 = hy + (H - hy) / z;
    const y2 = hy + (H - hy) / (z * 1.15);
    const w1 = 0.012 * W * ((y1 - hy) / (H - hy));
    const w2 = 0.012 * W * ((y2 - hy) / (H - hy));
    dashes += `<polygon points="${f(W / 2 - w1)},${f(y1)} ${f(W / 2 + w1)},${f(y1)} ${f(W / 2 + w2)},${f(y2)} ${f(W / 2 - w2)},${f(y2)}" fill="${p.line}" opacity="0.9"/>`;
  }

  // Asphalt cracks for a little texture.
  let cracks = "";
  for (let i = 0; i < 7; i++) {
    const sx = 0.2 + rand() * 0.6;
    const sy = 0.5 + rand() * 0.45;
    let d = `M${X(sx)},${f(sy * H)}`;
    for (let k = 0; k < 4; k++) d += ` l${f((rand() - 0.5) * 60)},${f((rand() - 0.3) * 24)}`;
    cracks += `<path d="${d}" stroke="#2c2c2e" stroke-width="1.4" fill="none" opacity="${fresh ? 0.15 : 0.5}"/>`;
  }

  const schoolSign = sample.meta.schoolZone
    ? `<g transform="translate(${X(0.9)} ${f(hy + 40)})">
        <rect x="-3" y="0" width="6" height="150" fill="#6b6d70"/>
        <polygon points="0,-70 60,30 -60,30" fill="#f2b705" stroke="#1d1d1e" stroke-width="6" stroke-linejoin="round"/>
        <circle cx="-12" cy="-12" r="7" fill="#1d1d1e"/><circle cx="14" cy="-6" r="6" fill="#1d1d1e"/>
        <rect x="-18" y="-4" width="12" height="24" rx="4" fill="#1d1d1e"/><rect x="9" y="1" width="10" height="20" rx="4" fill="#1d1d1e"/>
      </g>`
    : "";

  const potholes = sample.detections
    .map((d) => pothole(d.box, W, H, rand, d.confidence < 0.4))
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${sample.title} (illustration)">
  <!-- Original illustration generated by scripts/draw-samples.mjs from samples.json. Not a real photo. -->
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.asphalt}" stop-opacity="0.85"/><stop offset="1" stop-color="${fresh ? "#36373a" : p.asphalt}"/></linearGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${Math.floor(rand() * 100)}"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${far}
  <rect y="${f(hy)}" width="${W}" height="${f(H - hy)}" fill="${p.verge}"/>
  <polygon id="asphalt" points="${X(0.46)},${f(hy)} ${X(0.54)},${f(hy)} ${X(1.7)},${H} ${X(-0.7)},${H}" fill="url(#road)"/>
  <polygon points="${X(0.46)},${f(hy)} ${X(0.54)},${f(hy)} ${X(1.7)},${H} ${X(-0.7)},${H}" fill="#000" filter="url(#grain)" opacity="0.35"/>
  <polygon points="${X(0.466)},${f(hy)} ${X(0.47)},${f(hy)} ${X(-0.2)},${H} ${X(-0.24)},${H}" fill="${p.line}" opacity="0.85"/>
  <polygon points="${X(0.53)},${f(hy)} ${X(0.534)},${f(hy)} ${X(1.24)},${H} ${X(1.2)},${H}" fill="${p.line}" opacity="0.85"/>
  ${dashes}
  ${cracks}
  ${potholes}
  ${schoolSign}
</svg>
`;
}

for (const sample of manifest.samples) {
  const out = path.join(dir, path.basename(sample.file));
  fs.writeFileSync(out, scene(sample));
  console.log("wrote", path.relative(process.cwd(), out));
}
