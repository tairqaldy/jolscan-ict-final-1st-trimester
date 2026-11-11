/**
 * Theme bootstrapping, shared by the server layout and the client theme store.
 * (Kept out of the "use client" store so the server can import the string.)
 */
import { storageKey } from "./brand";

export const THEME_STORAGE_KEY = storageKey("theme");

/** Settings switch "Reduce motion": stored as JSON true or false (motionStore in lib/store/settings.ts). */
export const MOTION_STORAGE_KEY = storageKey("motion");

/**
 * Inline, render-blocking script: sets <html data-theme> before first paint (no flash):
 * "light", "dark" or "contrast" (the high-contrast theme, G-31; never chosen by the system),
 * and <html data-motion="reduce"> when the Reduce motion switch is on, so no CSS
 * animation starts and then stops. Each part has its own try, so one cannot break the other.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})||'"system"');var d=p==='dark'||(p!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=p==='contrast'?'contrast':d?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}try{if(JSON.parse(localStorage.getItem(${JSON.stringify(
  MOTION_STORAGE_KEY,
)})||'false')===true)document.documentElement.dataset.motion='reduce';}catch(e){}})();`;
