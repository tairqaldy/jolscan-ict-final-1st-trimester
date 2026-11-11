/**
 * G-6: the states of the UI primitives.
 * The states grid on /design draws hover and pressed with plain classes
 * (`forceState`); they must be the same classes the real :hover / :active
 * variants use, or /design would show a look the app never has.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BUTTON_HOVER, BUTTON_PRESSED, buttonClasses } from "@/components/ui/button";
import { Field, INPUT_HOVER, inputClasses } from "@/components/ui/input";
import { SELECT_HOVER } from "@/components/ui/select";
import { SLIDER_HOVER, SLIDER_PRESSED } from "@/components/ui/slider";
import { FORCED_FOCUS } from "@/components/ui/states";
import { SWITCH_HOVER, SWITCH_PRESSED } from "@/components/ui/switch";
import { TABS_FOCUS, TABS_HOVER } from "@/components/ui/tabs";

const src = (file: string) => readFileSync(fileURLToPath(new URL(`../components/ui/${file}`, import.meta.url)), "utf8");
const css = readFileSync(fileURLToPath(new URL("../app/globals.css", import.meta.url)), "utf8");

/** Each forced class, without its "!", must exist in the source behind one of the given variants. */
function expectBehindVariant(source: string, forced: string, variants: string[]) {
  for (const cls of forced.split(" ").map((c) => c.replace(/!$/, ""))) {
    const found = variants.some((v) => source.includes(`${v}:${cls}`));
    expect(found, `"${cls}" behind ${variants.join(" / ")}`).toBe(true);
  }
}

describe("forced states match the real ones", () => {
  it("button hover and press", () => {
    const button = src("button.tsx");
    for (const hover of Object.values(BUTTON_HOVER)) expectBehindVariant(button, hover, ["hover"]);
    expectBehindVariant(button, BUTTON_PRESSED, ["active"]);
  });

  it("switch, slider, tabs, input and select", () => {
    expectBehindVariant(src("switch.tsx"), SWITCH_HOVER.root, ["hover"]);
    expectBehindVariant(src("switch.tsx"), SWITCH_HOVER.thumb, ["group-hover"]);
    expectBehindVariant(src("switch.tsx"), SWITCH_PRESSED.thumb, ["group-active"]);
    expectBehindVariant(src("slider.tsx"), SLIDER_HOVER, ["hover"]);
    expectBehindVariant(src("slider.tsx"), SLIDER_PRESSED, ["active"]);
    expectBehindVariant(src("tabs.tsx"), TABS_HOVER, ["hover"]);
    expectBehindVariant(src("input.tsx"), INPUT_HOVER, ["hover"]);
    expectBehindVariant(src("select.tsx"), SELECT_HOVER, ["hover"]);
  });

  it("tabs draw the focus ring inside, so the scrolling list does not clip it", () => {
    expectBehindVariant(src("tabs.tsx"), "-outline-offset-2", ["focus-visible"]);
    expect(TABS_FOCUS).toContain("-outline-offset-2");
  });

  it("forced focus is the global :focus-visible ring", () => {
    expect(FORCED_FOCUS).toBe("outline-2 outline-offset-2 outline-focus");
    expect(css).toMatch(/:focus-visible \{\s*outline: 2px solid var\(--focus\);\s*outline-offset: 2px;/);
  });
});

describe("button", () => {
  it("is at least 48 px tall below the sm breakpoint in every size (U6)", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      expect(buttonClasses({ size }).split(" ")).toContain("h-12");
    }
  });

  it("adds a forced state only when asked", () => {
    expect(buttonClasses()).not.toContain(BUTTON_HOVER.primary);
    expect(buttonClasses({ forceState: "hover" })).toContain(BUTTON_HOVER.primary);
    expect(buttonClasses({ variant: "secondary", forceState: "hover" })).toContain(BUTTON_HOVER.secondary);
    expect(buttonClasses({ forceState: "focus" })).toContain(FORCED_FOCUS);
    expect(buttonClasses({ forceState: "pressed" })).toContain(BUTTON_PRESSED);
  });
});

describe("text field", () => {
  it("shows an error, marks the input invalid and links the message", () => {
    const html = renderToStaticMarkup(createElement(Field, { label: "Street", hint: "As on the sign.", error: "Enter a street name." }));
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("Enter a street name.");
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1].split(" ") ?? [];
    expect(describedBy).toHaveLength(2);
    for (const id of describedBy) expect(html).toContain(`id="${id}"`);
  });

  it("stays as before without an error", () => {
    const html = renderToStaticMarkup(createElement(Field, { label: "Street" }));
    expect(html).not.toContain("aria-invalid");
    expect(html).not.toContain("aria-describedby");
    expect(inputClasses).toContain("aria-[invalid=true]:border-danger");
  });
});

describe("primitive motion (globals.css, G-6 block)", () => {
  const block = css.slice(css.indexOf("G-6: motion of the UI primitives"));

  it("uses the duration and easing tokens and never loops", () => {
    for (const line of block.split("\n").filter((l) => l.includes("animation:"))) {
      expect(line).toMatch(/var\(--duration-(fast|base)\) var\(--ease-(standard|emphasized|exit)\)/);
    }
    expect(block).not.toMatch(/infinite/);
  });

  it("is cut short by both reduced-motion paths (the OS setting and the Settings switch)", () => {
    expect(css).toMatch(/html\[data-motion="reduce"\] \*,\s*html\[data-motion="reduce"\] \*::before,\s*html\[data-motion="reduce"\] \*::after \{\s*animation-duration: 0.01ms !important;/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\*,\s*\*::before,\s*\*::after \{\s*animation-duration: 0.01ms !important;/);
  });
});
