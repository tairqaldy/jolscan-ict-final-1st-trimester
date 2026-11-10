"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { DetectionOverlay } from "@/components/app/detection-overlay";
import { SeverityBadge } from "@/components/ui/badge";
import { duration, ease } from "@/lib/motion";
import { getSample } from "@/lib/mock/samples";
import { deriveDetections, scoreDetections } from "@/lib/rules";

const sample = getSample("s01")!;
const result = scoreDetections(sample.detections, sample.meta);
const derived = deriveDetections(sample.detections);

/** Animated demo: boxes draw over the sample photo, then the priority appears. Replays every few seconds. */
export function HeroDemo() {
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setRun((r) => r + 1), 7000);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div className="relative">
      <DetectionOverlay
        imageUrl={sample.file}
        imageWidth={sample.imageWidth}
        imageHeight={sample.imageHeight}
        detections={sample.detections}
        derived={derived}
        replayKey={run}
        alt="Illustrated highway with three potholes, each outlined by a detection box"
        className="shadow-lg"
      />
      <motion.div
        key={run}
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.slow, delay: reduce ? 0 : 1.4, ease: ease.emphasized }}
        className="relative -mt-8 ml-4 w-fit max-w-[calc(100%-2rem)] rounded-lg border border-border bg-surface p-4 shadow-lg sm:absolute sm:right-4 sm:-bottom-10 sm:mt-0 sm:ml-0"
      >
        <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Repair priority</p>
        <div className="mt-2 flex items-center gap-3">
          <SeverityBadge severity={result.severity} size="lg" />
          <span className="tabular font-display text-3xl font-bold">{result.score}</span>
        </div>
        <p className="mt-1 text-sm text-muted">{result.recommendedAction} · 24 h</p>
      </motion.div>
    </div>
  );
}
