import "server-only";
import type { Provider } from "@/lib/types";
import { cloudProvider } from "./cloud";
import { localProvider } from "./local";
import { mockProvider } from "./mock";
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

export function isProvider(value: unknown): value is Provider {
  return typeof value === "string" && value in PROVIDERS;
}

export { ProviderError } from "./types";
export type { HealthResult, PredictInput } from "./types";
