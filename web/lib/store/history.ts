import { useMemo } from "react";
import { MOCK_ANALYSES } from "@/lib/mock/analyses";
import type { StoredAnalysis } from "@/lib/types";
import { createLocalStore } from "./local-store";

/** Analyses made in this browser. Merged with the seeded demo set for display. */
const MAX_HISTORY = 40;

export const historyStore = createLocalStore<StoredAnalysis[]>("jolscan:history", [], (raw) =>
  Array.isArray(raw)
    ? (raw as StoredAnalysis[]).filter(
        (a) => a && typeof a.id === "string" && typeof a.createdAt === "string" && Array.isArray(a.detections),
      )
    : [],
);

export function addToHistory(analysis: StoredAnalysis) {
  historyStore.set((prev) => [analysis, ...prev.filter((a) => a.id !== analysis.id)].slice(0, MAX_HISTORY));
}

export type AnalysisWithSource = StoredAnalysis & { source: "demo" | "device" };

/** Every analysis to show: this browser's history + the seeded demo set, newest first. */
export function useAnalyses(): AnalysisWithSource[] {
  const history = historyStore.useStore();
  return useMemo(
    () =>
      [
        ...history.map((a) => ({ ...a, source: "device" as const })),
        ...MOCK_ANALYSES.map((a) => ({ ...a, source: "demo" as const })),
      ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [history],
  );
}
