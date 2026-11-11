/**
 * W-28: the "Demo data" badge follows the data on screen (requirement U8).
 *
 * The seeded demo histories (lib/mock/analyses.ts, lib/mock/restroom-checks.ts)
 * are always merged into the app, so the pages that show them must keep their
 * badge after the results files turn real (`isMock: false`). Every <DemoBadge>
 * in those files therefore passes `show` instead of following the results file.
 * Single results get a "Mock result" badge only when the mock provider made them.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

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

const RESULT_VIEW_FILES = ["components/app/analysis-view.tsx", "components/restrooms/compare-result.tsx"];

/** Every `<DemoBadge ... />` tag in a source file. Paths are relative to web/. */
function demoBadges(file: string): string[] {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  return source.match(/<DemoBadge\b[^>]*\/>/g) ?? [];
}

describe("Demo data badges (W-28)", () => {
  it.each(SEEDED_HISTORY_FILES)("%s shows its badge whatever the results files say", (file) => {
    const badges = demoBadges(file);
    expect(badges.length).toBeGreaterThan(0);
    for (const badge of badges) expect(badge).toMatch(/\sshow[\s=/]/);
  });

  it.each(RESULT_VIEW_FILES)("%s marks results made by the mock provider", (file) => {
    const badges = demoBadges(file);
    expect(badges).toHaveLength(1);
    expect(badges[0]).toMatch(/show=\{\w+\.provider === "mock"\}/);
    expect(badges[0]).toContain('label="Mock result"');
  });
});
