"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { duration, ease } from "@/lib/motion";

/**
 * Used by template.tsx files: each navigation fades (and lifts) the new page in.
 * Use lift={false} around anything containing position:fixed elements, because a
 * transform on an ancestor would make them scroll with the page while animating.
 */
export function PageTransition({ children, lift = true }: { children: ReactNode; lift?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : lift ? { opacity: 0, y: 8 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.slow, ease: ease.emphasized }}
    >
      {children}
    </motion.div>
  );
}
