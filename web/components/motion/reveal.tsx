"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { duration, ease, stagger as staggerStep } from "@/lib/motion";

/**
 * Staggered entry: wrap a section in <Stagger>, its children in <StaggerItem>.
 * With prefers-reduced-motion the content simply appears.
 */
export function Stagger({
  children,
  className,
  as = "div",
  inView = false,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "ol";
  /** Animate when scrolled into view instead of on mount. */
  inView?: boolean;
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  const variants = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : staggerStep } } };
  return (
    <Comp
      className={className}
      variants={variants}
      initial="hidden"
      {...(inView ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } } : { animate: "show" })}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={{
        hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.emphasized } },
      }}
    >
      {children}
    </Comp>
  );
}
