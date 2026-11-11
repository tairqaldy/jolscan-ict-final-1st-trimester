"use client";

import type { ReactNode } from "react";
import { MotionPreference } from "@/components/motion/motion-preference";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useApplyTheme } from "@/lib/store/theme";

/** Client-wide setup: theme sync, reduced-motion handling (device setting or Settings switch), tooltips. */
export function AppProviders({ children }: { children: ReactNode }) {
  useApplyTheme();
  return (
    <MotionPreference>
      <TooltipProvider>{children}</TooltipProvider>
    </MotionPreference>
  );
}
