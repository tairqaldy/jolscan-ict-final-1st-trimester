import { useMemo } from "react";
import { storageKey } from "@/lib/brand";
import { MOCK_RESTROOM_CHECKS } from "@/lib/mock/restroom-checks";
import type { StoredSignageCheck } from "@/lib/types";
import { createLocalStore } from "./local-store";

/** Restroom sign checks (Compare) made in this browser. Merged with the seeded demo set for display. */
const MAX_HISTORY = 40;

export const restroomHistoryStore = createLocalStore<StoredSignageCheck[]>(storageKey("restroom-history"), [], (raw) =>
  Array.isArray(raw)
    ? (raw as StoredSignageCheck[]).filter(
        (c) =>
          c &&
          typeof c.id === "string" &&
          typeof c.createdAt === "string" &&
          typeof c.similarity === "number" &&
          c.a &&
          c.b &&
          Array.isArray(c.ruleHits),
      )
    : [],
);

export function addRestroomCheck(check: StoredSignageCheck) {
  restroomHistoryStore.set((prev) => [check, ...prev.filter((c) => c.id !== check.id)].slice(0, MAX_HISTORY));
}

export type CheckWithSource = StoredSignageCheck & { source: "demo" | "device" };

/** Every check to show: this browser's history + the seeded demo set, newest first. */
export function useRestroomChecks(): CheckWithSource[] {
  const history = restroomHistoryStore.useStore();
  return useMemo(
    () =>
      [
        ...history.map((c) => ({ ...c, source: "device" as const })),
        ...MOCK_RESTROOM_CHECKS.map((c) => ({ ...c, source: "demo" as const })),
      ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [history],
  );
}
