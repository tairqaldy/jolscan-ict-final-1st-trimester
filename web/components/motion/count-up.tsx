"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Number that counts up from 0 when it scrolls into view.
 * Screen readers get the final value immediately (aria-label); with reduced
 * motion the final value is shown straight away.
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
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.2, 0, 0, 1],
      onUpdate: setShown,
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  const display = reduce ? value : shown;
  const text = `${display.toFixed(decimals)}${suffix}`;
  return (
    <span ref={ref} className={className} aria-label={`${value.toFixed(decimals)}${suffix}`}>
      <span aria-hidden className="tabular">
        {text}
      </span>
    </span>
  );
}
