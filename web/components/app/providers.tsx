"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useApplyTheme } from "@/lib/store/theme";

/** Client-wide setup: theme sync, reduced-motion handling, tooltips. */
export function AppProviders({ children }: { children: ReactNode }) {
  useApplyTheme();
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider>{children}</TooltipProvider>
    </MotionConfig>
  );
}
