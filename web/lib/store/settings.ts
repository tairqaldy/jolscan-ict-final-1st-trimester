import { normaliseRules, DEFAULT_RULES, type RulesConfig } from "@/lib/rules/config";
import { PROVIDERS, type Provider } from "@/lib/types";
import { createLocalStore } from "./local-store";

/** Settings page state, remembered in this browser only. */
export type Settings = {
  provider: Provider;
  /** Never send photos to the cloud provider; keep thumbnails in this browser only. */
  keepPhotosLocal: boolean;
  /** Re-encode uploads in the browser before sending, which drops EXIF (and GPS). */
  stripGps: boolean;
  language: "en" | "ru" | "kk";
};

export const DEFAULT_SETTINGS: Settings = {
  provider: "mock",
  keepPhotosLocal: false,
  stripGps: true,
  language: "en",
};

export const settingsStore = createLocalStore<Settings>("jolscan:settings", DEFAULT_SETTINGS, (raw) => {
  const r = (raw ?? {}) as Partial<Settings>;
  return {
    provider: PROVIDERS.includes(r.provider as Provider) ? (r.provider as Provider) : DEFAULT_SETTINGS.provider,
    keepPhotosLocal: typeof r.keepPhotosLocal === "boolean" ? r.keepPhotosLocal : DEFAULT_SETTINGS.keepPhotosLocal,
    stripGps: typeof r.stripGps === "boolean" ? r.stripGps : DEFAULT_SETTINGS.stripGps,
    language: "en",
  };
});

/** Rules page state. Sent with every analysis so the server scores with it. */
export const rulesStore = createLocalStore<RulesConfig>("jolscan:rules", DEFAULT_RULES, normaliseRules);
