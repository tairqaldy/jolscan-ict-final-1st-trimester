import { storageKey } from "@/lib/brand";
import { createLocalStore } from "./local-store";

/** true when the user hid the demo path card on /app (W-30). */
export const demoPathHiddenStore = createLocalStore<boolean>(storageKey("demo-path-hidden"), false, (raw) => raw === true);
