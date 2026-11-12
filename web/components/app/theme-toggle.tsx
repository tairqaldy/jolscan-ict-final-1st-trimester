"use client";

import { Contrast, Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { themeStore, type ThemePreference } from "@/lib/store/theme";

/**
 * The header button keeps its three steps; High contrast (G-31) is picked in Settings, and one click from it leads back
 * to System. From System the first click goes to the opposite of what the device shows, so it always changes something.
 */
const QUERY = "(prefers-color-scheme: dark)";
function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const systemIsDark = () => window.matchMedia(QUERY).matches;
const ICONS = { system: Monitor, light: Sun, dark: Moon, contrast: Contrast };
const NAMES: Record<ThemePreference, string> = { system: "system", light: "light", dark: "dark", contrast: "high contrast" };

/** One button that cycles system -> the other scheme -> the device's own scheme -> system. Full choice lives in Settings. */
export function ThemeToggle({ className }: { className?: string }) {
  const pref = themeStore.useStore();
  const dark = useSyncExternalStore(subscribe, systemIsDark, () => false);
  const order: ThemePreference[] = dark ? ["system", "light", "dark"] : ["system", "dark", "light"];
  const next: ThemePreference = pref === "contrast" ? "system" : order[(order.indexOf(pref) + 1) % order.length];
  const Icon = ICONS[pref];
  return (
    <button
      type="button"
      onClick={() => themeStore.set(next)}
      className={cn("inline-flex size-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg", className)}
      aria-label={`Theme: ${NAMES[pref]}. Switch to ${NAMES[next]}`}
      title={`Theme: ${NAMES[pref]}`}
    >
      <Icon className="size-4.5" aria-hidden />
    </button>
  );
}
