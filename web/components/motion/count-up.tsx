"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

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
    const controls = animate(start, value, { duration: 0.8, ease: [0.2, 0, 0, 1], onUpdate: setShown });
    return () => controls.stop();
  }, [value, reduce]);

  // With reduced motion the real value is shown directly, no count.
  const text = `${(reduce ? value : shown).toFixed(decimals)}${suffix}`;
  return (
    <span className={className} aria-label={`${value.toFixed(decimals)}${suffix}`}>
      <span aria-hidden className="tabular">
        {text}
      </span>
    </span>
  );
}
