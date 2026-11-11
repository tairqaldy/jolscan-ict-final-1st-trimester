"use client";

import { settingsStore } from "@/lib/store/settings";
import { DemoBadge } from "./demo-badge";

/**
 * "Mock predictions" badge for pages whose answers come from the provider
 * chosen in Settings (Compare and Match). Shown only while that provider is
 * Mock; Local and Cloud run the real model. A client component, because the
 * provider setting is stored in this browser.
 */
export function MockProviderBadge() {
  const { provider } = settingsStore.useStore();
  return <DemoBadge show={provider === "mock"} label="Mock predictions" />;
}
