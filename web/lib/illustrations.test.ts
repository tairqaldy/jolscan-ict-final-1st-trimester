/**
 * G-26: the empty-state drawings follow the theme, so they may only use
 * currentColor and CSS variables (no hex, rgb or named colours), stay small
 * and stay hidden from screen readers.
 */
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const DIR = new URL("../components/illustrations/", import.meta.url);
const FILES = readdirSync(DIR).filter((f) => f.endsWith(".tsx"));
const DRAWINGS = FILES.filter((f) => f !== "frame.tsx");

function read(file: string): string {
  return readFileSync(new URL(file, DIR), "utf8");
}

describe("Empty-state illustrations (G-26)", () => {
  it("has four drawings", () => {
    expect(DRAWINGS).toHaveLength(4);
  });

  it.each(FILES)("%s uses no raw colour values", (file) => {
    const source = read(file);
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(source).not.toMatch(/\brgba?\(|\bhsla?\(/);
    for (const [, value] of source.matchAll(/\b(?:fill|stroke)="([^"]+)"/g)) {
      expect(value).toMatch(/^(none|currentColor|var\(--[a-z0-9-]+\))$/);
    }
  });

  it.each(DRAWINGS)("%s stays under 2 KB and draws on the shared hidden frame", (file) => {
    const source = read(file);
    expect(Buffer.byteLength(source)).toBeLessThan(2048);
    expect(source).toContain("<IllustrationFrame");
  });

  it("the frame is hidden from screen readers", () => {
    expect(read("frame.tsx")).toMatch(/\saria-hidden\s/);
  });
});
