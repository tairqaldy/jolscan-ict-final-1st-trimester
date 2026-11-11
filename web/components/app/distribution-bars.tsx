"use client";

import { motion, useReducedMotionConfig } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { duration, ease, stagger } from "@/lib/motion";
import { useHydrated } from "@/lib/store/local-store";

export type DistributionItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  count: number;
  /** Static Tailwind classes from the token set, e.g. "bg-sev-high" and "text-sev-high-ink". */
  solidClass: string;
  textClass: string;
};

/**
 * A category distribution as labelled horizontal bars from zero. Each row
 * carries the icon, the word and the count, so colour is never the only
 * signal. The server render shows the final bars; the grow-in animation only
 * plays for bars mounted later in the browser (never a blank chart).
 */
export function DistributionBars({ items, unit = "items" }: { items: DistributionItem[]; unit?: string }) {
  const reduce = useReducedMotionConfig();
  const hydrated = useHydrated();
  const total = items.reduce((s, c) => s + c.count, 0) || 1;
  const max = Math.max(...items.map((c) => c.count), 1);
  return (
    <ul className="grid gap-3">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <li key={item.key} className="grid grid-cols-[6.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm">
            <span className={`inline-flex items-center gap-1.5 font-medium ${item.textClass}`}>
              <Icon className="size-4" aria-hidden />
              {item.label}
            </span>
            <span className="h-3 overflow-hidden rounded-xs bg-surface-2">
              <motion.span
                className={`block h-full origin-left rounded-xs ${item.solidClass}`}
                style={{ width: `${(item.count / max) * 100}%` }}
                initial={reduce || !hydrated ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: duration.slow * 1.5, delay: i * stagger, ease: ease.emphasized }}
              />
            </span>
            <span className="tabular text-right font-mono">
              {item.count}
              <span className="sr-only">
                {" "}
                {unit}, {Math.round((item.count / total) * 100)}%
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
