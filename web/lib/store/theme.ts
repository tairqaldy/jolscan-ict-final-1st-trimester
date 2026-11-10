import { useEffect } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";
import { createLocalStore } from "./local-store";

export type ThemePreference = "system" | "light" | "dark";

/** Stored as a JSON string, read before paint by the inline script in app/layout.tsx. */
export const themeStore = createLocalStore<ThemePreference>(THEME_STORAGE_KEY, "system", (raw) =>
  raw === "light" || raw === "dark" ? raw : "system",
);

function resolve(pref: ThemePreference): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Keeps <html data-theme> in line with the preference and the system setting. */
export function useApplyTheme() {
  const pref = themeStore.useStore();
  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = resolve(pref);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [pref]);
}
