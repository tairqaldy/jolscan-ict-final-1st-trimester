import { afterEach, describe, expect, it } from "vitest";
import { MOTION_STORAGE_KEY, THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from "./theme-script";

/**
 * The inline script is a string, so the type checker never sees it. Run it
 * against fake localStorage, matchMedia and <html> objects.
 */
function run(stored: Record<string, string>, { dark = false } = {}) {
  const dataset: Record<string, string> = {};
  const g = globalThis as Record<string, unknown>;
  g.localStorage = { getItem: (k: string) => (k in stored ? stored[k] : null) };
  g.matchMedia = (q: string) => ({ matches: dark && q.includes("dark") });
  g.document = { documentElement: { dataset } };
  new Function(THEME_INIT_SCRIPT)();
  return dataset;
}

afterEach(() => {
  const g = globalThis as Record<string, unknown>;
  delete g.localStorage;
  delete g.matchMedia;
  delete g.document;
});

describe("THEME_INIT_SCRIPT", () => {
  it("sets data-motion=reduce when the switch is stored as true", () => {
    expect(run({ [MOTION_STORAGE_KEY]: "true" }).motion).toBe("reduce");
  });

  it("leaves data-motion unset when the switch is off or never set", () => {
    expect(run({ [MOTION_STORAGE_KEY]: "false" }).motion).toBeUndefined();
    expect(run({}).motion).toBeUndefined();
  });

  it("ignores a broken motion value and still sets the theme", () => {
    const d = run({ [MOTION_STORAGE_KEY]: "{oops", [THEME_STORAGE_KEY]: '"dark"' });
    expect(d.motion).toBeUndefined();
    expect(d.theme).toBe("dark");
  });

  it("keeps the theme behaviour: stored choice, else the system setting", () => {
    expect(run({ [THEME_STORAGE_KEY]: '"light"' }, { dark: true }).theme).toBe("light");
    expect(run({}, { dark: true }).theme).toBe("dark");
    expect(run({}).theme).toBe("light");
  });

  it("sets the high-contrast theme when it is stored, whatever the system says (G-31)", () => {
    expect(run({ [THEME_STORAGE_KEY]: '"contrast"' }).theme).toBe("contrast");
    expect(run({ [THEME_STORAGE_KEY]: '"contrast"' }, { dark: true }).theme).toBe("contrast");
  });

  it("falls back to the system setting for an unknown stored theme", () => {
    expect(run({ [THEME_STORAGE_KEY]: '"sepia"' }, { dark: true }).theme).toBe("dark");
    expect(run({ [THEME_STORAGE_KEY]: '"sepia"' }).theme).toBe("light");
  });

  it("sets both attributes together", () => {
    const d = run({ [MOTION_STORAGE_KEY]: "true", [THEME_STORAGE_KEY]: '"dark"' });
    expect(d).toEqual({ theme: "dark", motion: "reduce" });
  });
});
