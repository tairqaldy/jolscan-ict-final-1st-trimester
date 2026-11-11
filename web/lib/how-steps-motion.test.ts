import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/*
 * G-60: the step line on the landing "How it works" list (globals.css, .how-steps).
 * It must stop under both reduced-motion paths and never loop (ANTI-SLOP.md R7).
 */
const css = readFileSync(fileURLToPath(new URL("../app/globals.css", import.meta.url)), "utf8");
const page = readFileSync(fileURLToPath(new URL("../app/page.tsx", import.meta.url)), "utf8");
const block = css.slice(css.indexOf("G-60: How it works"));

describe("How it works step line", () => {
  it("is on the landing steps list", () => {
    expect(page).toMatch(/as="ol" className="how-steps /);
  });

  it("is tied to scrolling and does not loop", () => {
    expect(block).toMatch(/animation-timeline: view\(\)/);
    expect(block).not.toMatch(/infinite/);
  });

  it("stops with the OS setting and with the Settings switch (G-64)", () => {
    expect(block).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\.how-steps > li::before \{\s*animation: none !important;/,
    );
    expect(block).toMatch(/html\[data-motion="reduce"\] \.how-steps > li::before \{\s*animation: none !important;/);
  });
});
