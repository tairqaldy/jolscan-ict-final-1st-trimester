/**
 * Overpass draws the middle dot "·" with no advance width, so "Roads · Analyze" read as "Roads ·Analyze". The fix is
 * global: a font face that covers only U+00B7 comes first in the text font stacks (app/globals.css, app/tokens.css),
 * so every separator in the app is drawn from a font whose dot is centred. The eyebrow text stays as written.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageHeader } from "@/components/ui/page-header";

const read = (file: string) => readFileSync(path.join(__dirname, "..", file), "utf8");

describe("Middle dot separator", () => {
  it("has a face that covers only U+00B7", () => {
    const face = read("app/globals.css").match(/@font-face\s*{[^}]*"Qarau Separator"[^}]*}/)?.[0] ?? "";
    expect(face).toContain("unicode-range: U+00B7;");
  });

  it("comes first in the text and heading font stacks, not in mono", () => {
    const tokens = read("app/tokens.css");
    expect(tokens).toMatch(/--font-sans: "Qarau Separator", var\(--font-body\)/);
    expect(tokens).toMatch(/--font-display: "Qarau Separator", var\(--font-body\)/);
    expect(tokens).not.toMatch(/--font-mono: "Qarau Separator"/);
  });

  it("leaves the eyebrow text as written", () => {
    const html = renderToStaticMarkup(createElement(PageHeader, { eyebrow: "Roads · Pothole detection", title: "T" }));
    expect(html).toContain(">Roads · Pothole detection</p>");
  });
});
