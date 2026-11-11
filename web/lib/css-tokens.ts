/**
 * G-21: small readers for the token tests (lib/*.test.ts). They read the
 * stylesheets and sources as text, with no CSS engine, so they rely on
 * tokens.css keeping plain `selector { --name: value; }` blocks.
 * Test-only: node:fs, never import it from a component.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const WEB = fileURLToPath(new URL("..", import.meta.url));

/** A file under web/, as text. */
export const readWeb = (file: string) => readFileSync(join(WEB, file), "utf8");

/** Every file under the given web/ folders whose path matches `pattern`, relative to web/. */
export function sourceFiles(dirs: string[], pattern: RegExp): string[] {
  return dirs.flatMap((dir) =>
    readdirSync(join(WEB, dir), { recursive: true, encoding: "utf8" })
      .map((file) => join(dir, file))
      .filter((file) => pattern.test(file)),
  );
}

/** 1-based line number of `index` in `text`. */
export const lineOf = (text: string, index: number) => text.slice(0, index).split("\n").length;

/**
 * Removes block comments (and, with `lineComments`, // comments that start a
 * line or follow a space, so "https://" survives) but keeps line numbers.
 */
export function stripComments(text: string, lineComments = false): string {
  const out = text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ""));
  return lineComments ? out.replace(/(^|\s)\/\/.*$/gm, "$1") : out;
}

/** Declarations (custom properties and color-scheme) of the first block after `selector`. */
export function declarations(css: string, selector: string): Map<string, string> {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`${selector} not found`);
  const open = css.indexOf("{", start);
  const body = css.slice(open + 1, css.indexOf("}", open));
  const out = new Map<string, string>();
  for (const m of body.matchAll(/^\s*(--[\w-]+|color-scheme):\s*([^;]+);/gm)) out.set(m[1], m[2].trim());
  return out;
}

export interface CssBlock {
  selector: string;
  decls: Map<string, string>;
}

/** Every innermost `selector { ... }` block. A block inside @media comes back with its own selector. */
export function cssBlocks(css: string): CssBlock[] {
  return [...stripComments(css).matchAll(/([^{}]*)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    decls: new Map([...m[2].matchAll(/(--[\w-]+|color-scheme)\s*:\s*([^;]+);/g)].map((d) => [d[1], d[2].trim()])),
  }));
}

/**
 * The theme blocks of tokens.css by name ("light", "dark", "contrast", ...):
 * blocks whose selector is only `:root` and `[data-theme="..."]`.
 */
export function themeBlocks(css: string): Map<string, Map<string, string>> {
  const out = new Map<string, Map<string, string>>();
  for (const block of cssBlocks(css)) {
    const parts = block.selector.split(",").map((s) => s.trim());
    if (!parts.every((p) => p === ":root" || /^\[data-theme="[\w-]+"\]$/.test(p))) continue;
    for (const p of parts) {
      const name = p.match(/^\[data-theme="([\w-]+)"\]$/)?.[1];
      if (name && !out.has(name)) out.set(name, block.decls);
    }
  }
  return out;
}

/** Custom properties referenced with var(--x), or a Tailwind shorthand like bg-(--x). */
export function varReferences(text: string): { name: string; index: number }[] {
  return [...text.matchAll(/(?:var\(|\w-\()(--[\w-]+)/g)].map((m) => ({ name: m[1], index: m.index + m[0].length - m[1].length }));
}
