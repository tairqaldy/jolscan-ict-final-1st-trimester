/**
 * G-25: paper is always light. app/print.css gives the dark theme the light
 * values while printing; they are a copy of the light block in app/tokens.css.
 * This test fails when someone changes a light token and not its print copy.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

/** Declarations (custom properties and color-scheme) of the first block after `selector`. */
function declarations(css: string, selector: string): Map<string, string> {
  const start = css.indexOf(selector);
  expect(start, `${selector} not found`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", start);
  const body = css.slice(open + 1, css.indexOf("}", open));
  const out = new Map<string, string>();
  for (const m of body.matchAll(/^\s*(--[\w-]+|color-scheme):\s*([^;]+);/gm)) out.set(m[1], m[2].trim());
  return out;
}

describe("print tokens (G-25)", () => {
  const light = declarations(read("app/tokens.css"), ':root,\n[data-theme="light"]');
  const printCss = read("app/print.css");
  const print = declarations(printCss.slice(printCss.indexOf("@media print")), '[data-theme="dark"]');

  it("finds the light tokens", () => {
    expect(light.get("color-scheme")).toBe("light");
    expect(light.size).toBeGreaterThan(40);
  });

  it("prints the dark theme with exactly the light values", () => {
    expect(Object.fromEntries(print)).toEqual(Object.fromEntries(light));
  });

  it("is imported once from globals.css", () => {
    expect(read("app/globals.css").match(/@import "\.\/print\.css";/g)).toHaveLength(1);
  });
});
