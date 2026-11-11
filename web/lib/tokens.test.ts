/**
 * G-21: keep the tokens and the code in sync. app/tokens.css is the one file
 * to re-skin the app; these checks fail when a theme, the Tailwind mapping or
 * a component drifts away from it. Parsed generically, so a new token or a new
 * theme block is checked without editing this file.
 * Related checks: motion.test.ts (lib/motion.ts vs --duration-* and --ease-*),
 * print-tokens.test.ts (the light copy in print.css), contrast-theme.test.ts (G-31 ratios).
 */
import { describe, expect, it } from "vitest";
import { cssBlocks, lineOf, readWeb, sourceFiles, stripComments, themeBlocks, varReferences } from "./css-tokens";

const STYLESHEETS = ["app/tokens.css", "app/globals.css", "app/print.css"];
const tokensCss = readWeb("app/tokens.css");
const themes = themeBlocks(tokensCss);
const light = themes.get("light")!;

/** Photo-overlay tokens are the same in every theme (they sit on the photo), so dark inherits them from :root. */
const SAME_IN_EVERY_THEME = /^--box/;
/** Set at runtime by Tailwind and Radix, not by us. */
const THIRD_PARTY = /^--(tw|radix)-/;

/** Code that may reference tokens; tests are left out (they quote token names on purpose). */
const code = sourceFiles(["app", "components", "lib"], /\.(tsx?|css)$/).filter((f) => !f.endsWith(".test.ts"));

/** Every custom property the app defines: the stylesheets, next/font variables and inline `"--x":` style props. */
const defined = new Set<string>();
for (const file of STYLESHEETS) for (const block of cssBlocks(readWeb(file))) for (const name of block.decls.keys()) defined.add(name);
for (const file of code.filter((f) => /\.tsx?$/.test(f))) {
  for (const m of readWeb(file).matchAll(/variable:\s*"(--[\w-]+)"|["'](--[\w-]+)["']\s*:/g)) defined.add(m[1] ?? m[2]);
}

describe("theme blocks in tokens.css (G-21)", () => {
  it("finds the light, dark and high-contrast themes", () => {
    expect([...themes.keys()]).toEqual(expect.arrayContaining(["light", "dark", "contrast"]));
    expect(light.size).toBeGreaterThan(40);
  });

  it.each([...themes.keys()].filter((t) => t !== "light"))("%s declares the same tokens as light", (theme) => {
    const own = themes.get(theme)!;
    const missing = [...light.keys()].filter((k) => !own.has(k) && !SAME_IN_EVERY_THEME.test(k));
    const extra = [...own.keys()].filter((k) => !light.has(k));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it.each([...themes.keys()])("aliases in %s point to tokens of the same theme", (theme) => {
    const own = themes.get(theme)!;
    const broken = [...own].flatMap(([name, value]) =>
      varReferences(value)
        .filter((ref) => !own.has(ref.name) && !light.has(ref.name))
        .map((ref) => `${name}: ${ref.name}`),
    );
    expect(broken).toEqual([]);
  });
});

describe("Tailwind @theme mapping (G-21)", () => {
  const theme = STYLESHEETS.flatMap((file) => cssBlocks(readWeb(file)).filter((b) => b.selector.startsWith("@theme")));

  it("finds the @theme block", () => {
    expect(theme.length).toBeGreaterThan(0);
  });

  it("references only custom properties that exist", () => {
    const unknown = theme.flatMap((b) => [...b.decls.values()].flatMap(varReferences)).filter((ref) => !defined.has(ref.name));
    expect(unknown.map((ref) => ref.name)).toEqual([]);
  });

  it("maps each colour utility to the theme token of the same name", () => {
    const wrong: string[] = [];
    for (const [name, value] of theme.flatMap((b) => [...b.decls]).filter(([n]) => n.startsWith("--color-"))) {
      const token = `--${name.slice("--color-".length)}`;
      if (value.startsWith("var(")) {
        if (value !== `var(${token})` || !light.has(token)) wrong.push(`${name}: ${value}`);
      } else if (/#|rgb|hsl|oklch|lab\(/i.test(value)) {
        wrong.push(`${name}: ${value} (a raw colour; put it in the theme blocks)`);
      }
    }
    expect(wrong).toEqual([]);
  });
});

describe("custom properties used in the code (G-21)", () => {
  const uses = code.flatMap((file) => {
    const text = stripComments(readWeb(file), !file.endsWith(".css"));
    return varReferences(text).map((ref) => ({ ...ref, where: `${file}:${lineOf(text, ref.index)}` }));
  });

  it("finds the uses", () => {
    expect(uses.length).toBeGreaterThan(50);
  });

  it("every var(--x) is defined in the stylesheets", () => {
    const known = (name: string) =>
      THIRD_PARTY.test(name) ||
      defined.has(name) ||
      // `var(--shadow-${size})` in a template string: some token must start with the prefix.
      (name.endsWith("-") && [...defined].some((d) => d.startsWith(name)));
    expect(uses.filter((u) => !known(u.name)).map((u) => `${u.where} ${u.name}`)).toEqual([]);
  });
});

describe("theme colour of the browser chrome (G-21)", () => {
  // Read as text: importing app/layout.tsx would load next/font.
  const layout = readWeb("app/layout.tsx");
  const themeColor = layout.slice(layout.indexOf("themeColor"), layout.indexOf("]", layout.indexOf("themeColor")));

  it.each(["light", "dark"])("matches --bg of the %s theme", (scheme) => {
    const color = themeColor.match(new RegExp(`prefers-color-scheme: ${scheme}\\)",\\s*color:\\s*"(#[0-9a-fA-F]{3,8})"`))?.[1];
    expect(color, `themeColor for ${scheme} in app/layout.tsx`).toBeDefined();
    expect(color!.toLowerCase()).toBe(themes.get(scheme)!.get("--bg")!.toLowerCase());
  });
});

describe("no hard-coded colours in components (G-21)", () => {
  /** themeColor needs literal hex values; the test above keeps them equal to --bg. */
  const ALLOWED = new Set(["app/layout.tsx"]);

  it("has no hex colour in app/ or components/ code", () => {
    const hits: string[] = [];
    for (const file of code.filter((f) => /\.tsx?$/.test(f) && !ALLOWED.has(f) && /^(app|components)\//.test(f))) {
      const text = stripComments(readWeb(file), true);
      // At least three hex digits and no letter after: skips anchors like #main and #roads.
      for (const m of text.matchAll(/#[0-9a-fA-F]{3,8}(?![\w-])/g)) {
        if (/href=\{?["'`]$/.test(text.slice(Math.max(0, m.index - 7), m.index))) continue;
        const line = lineOf(text, m.index);
        hits.push(`${file}:${line} ${text.split("\n")[line - 1].trim()}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
