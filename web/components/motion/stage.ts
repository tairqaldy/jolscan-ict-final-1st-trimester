"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { duration, reveal } from "@/lib/motion";

/**
 * G-75: staged reveal of a fresh result. CSS does the motion (globals.css
 * .result-stage: opacity and transform only, so nothing shifts the layout);
 * this file only says which element starts when.
 *
 * true while a just-produced result is revealing. It turns false once the
 * reveal is over, so content that mounts again later (switching back to the
 * "Why" tab) does not replay. Reduced motion (device or the Settings switch)
 * is handled in CSS: .result-stage has no animation then, everything is there
 * on the first frame.
 */
export function useStagedReveal(enabled: boolean): boolean {
  const [on, setOn] = useState(enabled);
  useEffect(() => {
    if (!on) return;
    const t = window.setTimeout(() => setOn(false), (reveal.budget + duration.fast) * 1000);
    return () => window.clearTimeout(t);
  }, [on]);
  return on;
}

/** Class and start delay for one staged element; nothing when not staging. */
export function stage(on: boolean, delay: number): { className?: string; style?: CSSProperties } {
  if (!on) return {};
  return { className: "result-stage", style: { "--stage-delay": `${Math.round(delay * 1000)}ms` } as CSSProperties };
}

/** Start of rule row i: one rowStep after the previous, never after lastStart. */
export function rowDelay(i: number): number {
  return Math.min(reveal.rows + i * reveal.rowStep, reveal.lastStart);
}
