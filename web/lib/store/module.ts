import { storageKey, type ModuleId } from "@/lib/brand";
import { createLocalStore } from "./local-store";

/**
 * The module the user last worked in. The sidebar shows its pages while the
 * user is on a shared page (Home, Analytics, Model, Settings).
 */
export const lastModuleStore = createLocalStore<ModuleId>(storageKey("last-module"), "roads", (raw) =>
  raw === "restrooms" ? "restrooms" : "roads",
);
