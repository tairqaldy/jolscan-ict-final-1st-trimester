/**
 * Theme bootstrapping, shared by the server layout and the client theme store.
 * (Kept out of the "use client" store so the server can import the string.)
 */
import { storageKey } from "./brand";

export const THEME_STORAGE_KEY = storageKey("theme");

/** Inline, render-blocking script: sets <html data-theme> before first paint (no flash). */
export const THEME_INIT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})||'"system"');var d=p==='dark'||(p!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();`;
