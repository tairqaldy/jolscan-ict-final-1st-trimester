"use client";

import { Contrast, Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { themeStore, type ThemePreference } from "@/lib/store/theme";

/** The header button keeps its three steps; High contrast (G-31) is picked in Settings, and one click from it leads back to System. */
const ORDER: ThemePreference[] = ["system", "light", "dark"];
const ICONS = { system: Monitor, light: Sun, dark: Moon, contrast: Contrast };
const NAMES: Record<ThemePreference, string> = { system: "system", light: "light", dark: "dark", contrast: "high contrast" };

/** One button that cycles system -> light -> dark. Full choice, including high contrast, lives in Settings. */
export function ThemeToggle({ className }: { className?: string }) {
  const pref = themeStore.useStore();
  const next: ThemePreference = pref === "contrast" ? "system" : ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
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
