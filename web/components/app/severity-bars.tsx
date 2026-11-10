"use client";

import { motion, useReducedMotion } from "motion/react";
import { duration, ease } from "@/lib/motion";
import { SEVERITY_CLASSES, SEVERITY_META } from "@/lib/severity";
import type { Severity } from "@/lib/types";

/**
 * Severity distribution as labelled horizontal bars. Each row carries the
 * icon, the word and the count, so colour is never the only signal.
 */
export function SeverityBars({ counts }: { counts: { severity: Severity; count: number }[] }) {
  const reduce = useReducedMotion();
  const total = counts.reduce((s, c) => s + c.count, 0) || 1;
  const max = Math.max(...counts.map((c) => c.count), 1);
  return (
    <ul className="grid gap-3">
      {counts.map(({ severity, count }, i) => {
        const meta = SEVERITY_META[severity];
        const Icon = meta.icon;
        return (
          <li key={severity} className="grid grid-cols-[6rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm">
            <span className={`inline-flex items-center gap-1.5 font-medium ${SEVERITY_CLASSES[severity].text}`}>
              <Icon className="size-4" aria-hidden />
              {meta.label}
            </span>
            <span className="h-3 overflow-hidden rounded-xs bg-surface-2">
              <motion.span
                className={`block h-full origin-left rounded-xs ${SEVERITY_CLASSES[severity].solid}`}
                style={{ width: `${(count / max) * 100}%` }}
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: duration.slow * 1.5, delay: i * 0.06, ease: ease.emphasized }}
              />
            </span>
            <span className="tabular text-right font-mono">
              {count}
              <span className="sr-only"> photos, {Math.round((count / total) * 100)}%</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
