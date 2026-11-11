"use client";

import { settingsStore } from "@/lib/store/settings";
import { ProvenanceBadge } from "./demo-badge";

/**
 * "Mock predictions" badge for pages whose answers come from the provider
 * chosen in Settings (Compare and Match). Shown only while that provider is
 * Mock; Local and Cloud run the real model. A client component, because the
 * provider setting is stored in this browser. Styled as the Mock kind of the
 * provenance badge set (G-29): same icon as Mock in PROVIDER_META.
 */
export function MockProviderBadge() {
  const { provider } = settingsStore.useStore();
  if (provider !== "mock") return null;
  return <ProvenanceBadge kind="mock" label="Mock predictions" />;
}
