/**
 * G-25: paper is always light. app/print.css gives the dark theme the light
 * values while printing; they are a copy of the light block in app/tokens.css.
 * This test fails when someone changes a light token and not its print copy.
 */
import { describe, expect, it } from "vitest";
import { declarations, readWeb as read } from "./css-tokens";

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
