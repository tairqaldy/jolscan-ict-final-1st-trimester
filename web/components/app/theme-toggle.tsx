"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { themeStore, type ThemePreference } from "@/lib/store/theme";

const ORDER: ThemePreference[] = ["system", "light", "dark"];
const ICONS = { system: Monitor, light: Sun, dark: Moon };

/** One button that cycles system -> light -> dark. Full choice lives in Settings. */
export function ThemeToggle({ className }: { className?: string }) {
  const pref = themeStore.useStore();
  const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
  const Icon = ICONS[pref];
  return (
    <button
      type="button"
      onClick={() => themeStore.set(next)}
      className={cn("inline-flex size-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg", className)}
      aria-label={`Theme: ${pref}. Switch to ${next}`}
      title={`Theme: ${pref}`}
    >
      <Icon className="size-4.5" aria-hidden />
    </button>
  );
}
