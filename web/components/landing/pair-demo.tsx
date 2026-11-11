"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { GenderTag, SignImage, VerdictBadge } from "@/components/restrooms/signage-bits";
import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";
import { RESTROOM_PRESETS, getRestroomSample, mockSimilarity } from "@/lib/mock/restroom-samples";
import { DEFAULT_SIGNAGE, doorGender, evaluateSignage } from "@/lib/signage";
import { useHydrated } from "@/lib/store/local-store";

// The landing page keeps the four drawn example pairs; the real IOAI pairs are on the Compare page.
const LANDING_PRESETS = ["matching", "faint", "mismatched", "same"];

const EXAMPLES = RESTROOM_PRESETS.filter((p) => LANDING_PRESETS.includes(p.id)).map((p) => {
  const a = getRestroomSample(p.a)!;
  const b = getRestroomSample(p.b)!;
  const similarity = mockSimilarity(a.id, b.id);
  return { preset: p, a, b, similarity, result: evaluateSignage({ a: a.mock, b: b.mock, similarity }) };
});

/**
 * Landing mini-demo for the restroom module: a sign pair resolves to a
 * verdict. Cycles through the four example pairs; the first one is rendered
 * complete on the server, later ones animate in. A click on an example stops
 * the cycle. No cycling under prefers-reduced-motion.
 */
export function PairDemo() {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (reduce || !auto) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % EXAMPLES.length), 5000);
    return () => clearInterval(t);
  }, [reduce, auto]);

  const ex = EXAMPLES[index];
  const play = hydrated && !reduce;
  const step = (delay: number) => ({
    initial: play ? { opacity: 0, y: 6 } : false,
    animate: { opacity: 1, y: 0 },
    transition: { duration: duration.base, delay, ease: ease.emphasized },
  });

  return (
    <div className="grid gap-4 rounded-lg border border-border bg-surface-2 p-4 sm:p-5">
      <div key={ex.preset.id} className="grid gap-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {(["a", "b"] as const).map((k, i) => {
            const s = ex[k];
            return (
              <div key={k} className="grid content-start gap-2">
                <SignImage src={s.file} alt={`Door ${k.toUpperCase()}: ${s.title}`} className="bg-surface" />
                <motion.div {...step(0.35 + i * 0.15)}>
                  <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <GenderTag gender={doorGender(ex.result.doors, k)} />
                    <span className="tabular font-mono">P(male) {(k === "a" ? ex.result.doors.pMaleA : ex.result.doors.pMaleB).toFixed(2)}</span>
                  </span>
                </motion.div>
              </div>
            );
          })}
        </div>
        <div className="grid gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Similarity</span>
            <span className="tabular font-mono font-semibold">{ex.similarity.toFixed(2)}</span>
          </div>
          <div className="relative h-2.5 rounded-full bg-surface-3" aria-hidden>
            <motion.span
              className="absolute inset-y-0 left-0 origin-left rounded-full bg-inverse"
              style={{ width: `${ex.similarity * 100}%` }}
              initial={play ? { scaleX: 0 } : false}
              animate={{ scaleX: 1 }}
              transition={{ duration: duration.draw, delay: 0.7, ease: ease.emphasized }}
            />
            <span className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-fg" style={{ left: `${DEFAULT_SIGNAGE.s3.minSimilarity * 100}%` }} />
          </div>
        </div>
        <motion.div {...step(1.4)} className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <VerdictBadge verdict={ex.result.verdict} size="lg" />
          <span className="text-sm text-muted">{ex.result.recommendedAction}</span>
        </motion.div>
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Example pairs">
        {EXAMPLES.map((e, i) => (
          <button
            key={e.preset.id}
            type="button"
            aria-pressed={i === index}
            onClick={() => {
              setIndex(i);
              setAuto(false);
            }}
            className={cn(
              "min-h-8 rounded-full border px-3 text-xs font-medium transition-colors",
              i === index ? "border-fg bg-surface text-fg" : "border-border-strong text-muted hover:text-fg",
            )}
          >
            {e.preset.title}
          </button>
        ))}
      </div>
    </div>
  );
}
