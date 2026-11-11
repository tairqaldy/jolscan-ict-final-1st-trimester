"use client";

import { motion, useReducedMotionConfig } from "motion/react";
import { useEffect, useState } from "react";
import { DetectionOverlay } from "@/components/app/detection-overlay";
import { SeverityBadge } from "@/components/ui/badge";
import { formatSla } from "@/lib/format";
import { demo, duration, ease } from "@/lib/motion";
import { getSample } from "@/lib/mock/samples";
import { deriveDetections, scoreDetections } from "@/lib/rules";
import { useHydrated } from "@/lib/store/local-store";
import { DemoPauseButton } from "./demo-pause-button";

const sample = getSample("s01")!;
const result = scoreDetections(sample.detections, sample.meta);
const derived = deriveDetections(sample.detections);

/**
 * Landing mini-demo for the roads module: boxes draw over the sample photo,
 * then the priority appears. The first frame is rendered complete on the
 * server; replays every few seconds animate. The Pause button stops the
 * replays (WCAG 2.2.2). No replay under reduced motion.
 */
export function HeroDemo() {
  const reduce = useReducedMotionConfig();
  const hydrated = useHydrated();
  const [run, setRun] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const t = setInterval(() => setRun((r) => r + 1), demo.heroReplay * 1000);
    return () => clearInterval(t);
  }, [reduce, paused]);

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-surface-2 p-(--card-pad) shadow-sm transition-all duration-[var(--duration-base)] hover:border-border-strong">
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <DetectionOverlay
          imageUrl={sample.file}
          imageWidth={sample.imageWidth}
          imageHeight={sample.imageHeight}
          detections={sample.detections}
          derived={derived}
          replayKey={run}
          alt="Illustrated highway with three potholes, each outlined by a detection box"
        />
      </div>
      <motion.div
        key={run}
        initial={reduce || !hydrated || run === 0 ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.slow, delay: demo.resultDelay, ease: ease.emphasized }}
        className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-surface p-3 border border-border/60"
      >
        <SeverityBadge severity={result.severity} size="lg" />
        <span className="tabular font-display text-2xl font-bold text-fg">score {result.score}</span>
        <span className="text-sm text-muted">
          {result.recommendedAction} · {formatSla(result.slaHours)}
        </span>
      </motion.div>
      <div className="demo-loop-control flex justify-end">
        <DemoPauseButton paused={paused} onToggle={() => setPaused((p) => !p)} name="roads demo" />
      </div>
    </div>
  );
}
