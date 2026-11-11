import { normaliseRules, DEFAULT_RULES, type RulesConfig } from "@/lib/rules/config";
import { PROVIDERS, type Provider } from "@/lib/types";
import { storageKey } from "@/lib/brand";
import { normaliseSignage, DEFAULT_SIGNAGE, type SignageConfig } from "@/lib/signage/config";
import { MOTION_STORAGE_KEY } from "@/lib/theme-script";
import { createLocalStore } from "./local-store";

/** Settings page state, remembered in this browser only. One provider setting drives both modules. */
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

export const settingsStore = createLocalStore<Settings>(storageKey("settings"), DEFAULT_SETTINGS, (raw) => {
  const r = (raw ?? {}) as Partial<Settings>;
  return {
    provider: PROVIDERS.includes(r.provider as Provider) ? (r.provider as Provider) : DEFAULT_SETTINGS.provider,
    keepPhotosLocal: typeof r.keepPhotosLocal === "boolean" ? r.keepPhotosLocal : DEFAULT_SETTINGS.keepPhotosLocal,
    stripGps: typeof r.stripGps === "boolean" ? r.stripGps : DEFAULT_SETTINGS.stripGps,
    language: "en",
  };
});

/** Rules page state. Sent with every analysis so the server scores with it. */
export const rulesStore = createLocalStore<RulesConfig>(storageKey("rules"), DEFAULT_RULES, normaliseRules);

/** Restroom Rules page state (S1, S3 thresholds). Sent with every compare so the server judges with it. */
export const signageRulesStore = createLocalStore<SignageConfig>(storageKey("signage-rules"), DEFAULT_SIGNAGE, normaliseSignage);

/**
 * Settings switch "Reduce motion": true stops animations in this app; false follows
 * the device setting. Its own key, so the inline script in lib/theme-script.ts can read
 * it before first paint. Kept on "Reset demo data", like the theme.
 */
export const motionStore = createLocalStore<boolean>(MOTION_STORAGE_KEY, false, (raw) => raw === true);
