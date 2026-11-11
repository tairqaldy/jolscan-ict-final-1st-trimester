"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ease, timing } from "@/lib/motion";

/**
 * A number that is always rendered at its real value (server render, first
 * paint, screenshots, no JS). When the value changes later in the browser,
 * for example when this browser's own analyses are merged in, it counts from
 * the old value to the new one. Respects prefers-reduced-motion.
 */
export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    from.current = value;
    if (start === value || reduce) return;
    const controls = animate(start, value, { duration: timing.countUp, ease: ease.standard, onUpdate: setShown });
    return () => controls.stop();
  }, [value, reduce]);

  // With reduced motion the real value is shown directly, no count.
  const text = `${(reduce ? value : shown).toFixed(decimals)}${suffix}`;
  return (
    <span className={className}>
      <span className="sr-only">{`${value.toFixed(decimals)}${suffix}`}</span>
      {/* Tabular figures keep every digit the same width; the hidden final value under the
          counting one reserves the end width, so counting up never changes the width (G-45). */}
      <span aria-hidden className="tabular inline-grid">
        <span className="invisible col-start-1 row-start-1">{`${value.toFixed(decimals)}${suffix}`}</span>
        <span className="col-start-1 row-start-1">{text}</span>
      </span>
    </span>
  );
}
