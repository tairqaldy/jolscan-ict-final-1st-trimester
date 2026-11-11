/**
 * W-28: the "Demo data" badge follows the data on screen (requirement U8).
 *
 * The seeded demo histories (lib/mock/analyses.ts, lib/mock/restroom-checks.ts)
 * are always merged into the app, so the pages that show them must keep their
 * badge after the results files turn real (`isMock: false`). Every <DemoBadge>
 * in those files therefore passes `show` instead of following the results file.
 *
 * G-29: every single result shows exactly one provenance badge: "Mock result"
 * when the mock provider made it, "Model result: <name>" when our model made it,
 * and "Invented demo record" on a seeded record (never a model name).
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resultProvenance } from "./mock/seeded";

const SEEDED_HISTORY_FILES = [
  "app/app/roads/reports/page.tsx",
  "app/app/roads/map/page.tsx",
  "components/app/app-shell.tsx",
  "components/app/dashboard-client.tsx",
  "components/app/analytics-client.tsx",
  "components/app/platform-overview-client.tsx",
  "components/app/report-detail-client.tsx",
  "components/restrooms/restroom-overview-client.tsx",
  "components/restrooms/restroom-analytics.tsx",
  "components/restrooms/check-detail-client.tsx",
];

const RESULT_VIEW_FILES = [
  "components/app/analysis-view.tsx",
  "components/restrooms/compare-result.tsx",
  "components/restrooms/match-client.tsx",
];

/** Paths are relative to web/. */
function source(file: string): string {
  return readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
}

/** Every `<Tag ... />` in a source file. */
function tags(file: string, tag: string): string[] {
  return source(file).match(new RegExp(`<${tag}\\b[^>]*\\/>`, "g")) ?? [];
}

describe("Demo data badges (W-28)", () => {
  it.each(SEEDED_HISTORY_FILES)("%s shows its badge whatever the results files say", (file) => {
    const badges = tags(file, "DemoBadge");
    expect(badges.length).toBeGreaterThan(0);
    for (const badge of badges) expect(badge).toMatch(/\sshow[\s=/]/);
  });
});

describe("Provenance badge on a single result (G-29)", () => {
  it.each(RESULT_VIEW_FILES)("%s shows exactly one provenance badge", (file) => {
    expect(tags(file, "ResultProvenanceBadge")).toHaveLength(1);
    expect(tags(file, "DemoBadge")).toHaveLength(0);
  });

  it("marks a seeded record as invented, whatever its provider field says", () => {
    expect(resultProvenance({ id: "demo-001", provider: "local", model: "yolo26n-e7" })).toEqual({ kind: "demo" });
    expect(resultProvenance({ id: "demo-002", provider: "mock", model: "mock-fixtures" })).toEqual({ kind: "demo" });
  });

  it("marks a result of the mock provider as a mock result", () => {
    expect(resultProvenance({ id: "an-1a2b3c4d", provider: "mock", model: "mock-fixtures" })).toEqual({ kind: "mock" });
    // A match result has no id.
    expect(resultProvenance({ provider: "mock", model: "mock-fixtures" })).toEqual({ kind: "mock" });
  });

  it("names the model on a result of Local or Cloud", () => {
    expect(resultProvenance({ id: "an-1a2b3c4d", provider: "local", model: "yolo26n-e7" })).toEqual({
      kind: "model",
      provider: "local",
      model: "yolo26n-e7",
    });
    expect(resultProvenance({ provider: "cloud", model: "clip-vitb32-ft6" })).toEqual({
      kind: "model",
      provider: "cloud",
      model: "clip-vitb32-ft6",
    });
  });

  it("keeps the three words of the badge set", () => {
    const badge = source("components/app/demo-badge.tsx");
    expect(badge).toContain('"Demo data"');
    expect(badge).toContain('"Mock result"');
    expect(badge).toContain("Model result: ");
    expect(badge).toContain('"Invented demo record"');
  });

  it("uses the provider's own icon for Mock, Local and Cloud", () => {
    const providerIcons = Object.fromEntries(
      [...source("components/app/provider-badge.tsx").matchAll(/(\w+): \{ label: "[^"]*", icon: (\w+)/g)].map((m) => [m[1], m[2]]),
    );
    const badgeIcons = Object.fromEntries(
      [...source("components/app/demo-badge.tsx").matchAll(/^\s+(mock|local|cloud): (\w+),$/gm)].map((m) => [m[1], m[2]]),
    );
    expect(Object.keys(providerIcons).sort()).toEqual(["cloud", "local", "mock"]);
    expect(badgeIcons).toEqual(providerIcons);
  });
});
