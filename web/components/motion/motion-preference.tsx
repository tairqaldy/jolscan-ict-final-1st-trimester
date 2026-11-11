"use client";

import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { AnimationControllerProvider, type AnimationController } from "recharts";
import { motionStore } from "@/lib/store/settings";

/** <html data-motion="reduce"> is set before first paint by the inline script in lib/theme-script.ts. */
function attributeSaysReduce(): boolean {
  return typeof document !== "undefined" && document.documentElement.dataset.motion === "reduce";
}

/**
 * true when the Settings switch "Reduce motion" is on. During hydration it
 * reads <html data-motion>, which the inline script set from the same
 * localStorage key, so JS animations are off from the first frame too. Only
 * context and attributes depend on it, never markup, so hydration matches.
 */
export function useReduceMotionSwitch(): boolean {
  return useSyncExternalStore(motionStore.subscribe, motionStore.get, attributeSaysReduce);
}

/** Recharts: tween as usual. Same steps as Recharts' default controller. */
const playChart: AnimationController = (timeoutController, animation, listener) => {
  let cancel: (() => void) | undefined;
  const next = (now: number) => {
    const remaining = animation.tick(now);
    if (animation.getState() === "active") {
      listener(animation.getInterpolated());
      if (animation.getProgress() === 1) {
        animation.complete();
        cancel = undefined;
        return;
      }
    }
    cancel = timeoutController.setTimeout(next, remaining);
  };
  cancel = timeoutController.setTimeout(next, 0);
  return () => cancel?.();
};

/**
 * Recharts with motion reduced: go straight to the last frame. The handle is
 * stepped to "active" first so onAnimationEnd still fires (labels that wait
 * for the end of the animation still appear).
 */
const skipChart: AnimationController = (_timeoutController, animation, listener) => {
  animation.tick(0);
  animation.tick(animation.getAnimationBegin());
  animation.complete();
  listener(animation.getInterpolated());
  return () => {};
};

/**
 * One place that decides whether the app animates. Off when the device asks
 * for reduced motion (as before) or when the Settings switch is on:
 * - motion/react: MotionConfig skips every animation, and useReducedMotionConfig()
 *   returns true, so the landing demos stop looping;
 * - imperative animate() calls (count-up): MotionGlobalConfig.skipAnimations;
 * - Recharts: an animation controller that jumps to the last frame;
 * - CSS: <html data-motion="reduce">, read by the block at the end of globals.css.
 */
export function MotionPreference({ children }: { children: ReactNode }) {
  const reduce = useReduceMotionSwitch();

  useEffect(() => {
    MotionGlobalConfig.skipAnimations = reduce;
    const root = document.documentElement;
    if (reduce) root.dataset.motion = "reduce";
    else delete root.dataset.motion;
  }, [reduce]);

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "user"} skipAnimations={reduce}>
      <AnimationControllerProvider value={reduce ? skipChart : playChart}>{children}</AnimationControllerProvider>
    </MotionConfig>
  );
}
