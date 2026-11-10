import "server-only";
import type { Provider } from "@/lib/types";
import { cloudProvider } from "./cloud";
import { localProvider } from "./local";
import { mockProvider } from "./mock";
import { restroomCloudProvider, restroomLocalProvider } from "./restroom-http";
import { restroomMockProvider } from "./restroom-mock";
import type { RestroomProvider } from "./restroom-types";
import type { ModelProvider } from "./types";

/**
 * The provider switch. The browser sends `provider` (chosen in Settings);
 * the route picks the implementation here. To add a provider: implement
 * ModelProvider, add it to this map and to the Provider type in lib/types.ts.
 */
const PROVIDERS: Record<Provider, ModelProvider> = {
  mock: mockProvider,
  local: localProvider,
  cloud: cloudProvider,
};

export function getProvider(id: Provider): ModelProvider {
  return PROVIDERS[id];
}

/** The same switch for the restroom module: one provider setting drives both modules. */
const RESTROOM_PROVIDERS: Record<Provider, RestroomProvider> = {
  mock: restroomMockProvider,
  local: restroomLocalProvider,
  cloud: restroomCloudProvider,
};

export function getRestroomProvider(id: Provider): RestroomProvider {
  return RESTROOM_PROVIDERS[id];
}

export function isProvider(value: unknown): value is Provider {
  return typeof value === "string" && value in PROVIDERS;
}

export { ProviderError } from "./types";
export type { HealthResult, PredictInput } from "./types";
export type { CompareInput, MatchInput, SignInput } from "./restroom-types";
