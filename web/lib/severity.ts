/**
 * Severity presentation: label, icon and token names. Colour is never the
 * only carrier of meaning, so every use pairs the colour with the label
 * and/or the icon below.
 */
import {
  CircleCheck,
  CircleDot,
  CircleExclamationPoint,
  OctagonExclamationPoint,
  TriangleExclamationPoint,
  type LucideIcon,
} from "lucide-react";
import type { Severity } from "@/lib/types";

export const SEVERITY_META: Record<
  Severity,
  { label: string; icon: LucideIcon; rank: number; cssVar: string; description: string }
> = {
  clear: { label: "Clear", icon: CircleCheck, rank: 0, cssVar: "var(--sev-clear)", description: "No counted potholes" },
  low: { label: "Low", icon: CircleDot, rank: 1, cssVar: "var(--sev-low)", description: "Next maintenance round" },
  medium: { label: "Medium", icon: CircleExclamationPoint, rank: 2, cssVar: "var(--sev-medium)", description: "Patch repair within 14 days" },
  high: { label: "High", icon: TriangleExclamationPoint, rank: 3, cssVar: "var(--sev-high)", description: "Repair crew within 72 h" },
  critical: { label: "Critical", icon: OctagonExclamationPoint, rank: 4, cssVar: "var(--sev-critical)", description: "Mark hazard, repair within 24 h" },
};

/** Static class names per severity (written out in full so Tailwind can see them). */
export const SEVERITY_CLASSES: Record<Severity, { badge: string; solid: string; text: string; border: string }> = {
  clear: { badge: "bg-sev-clear-soft text-sev-clear-ink", solid: "bg-sev-clear", text: "text-sev-clear-ink", border: "border-sev-clear" },
  low: { badge: "bg-sev-low-soft text-sev-low-ink", solid: "bg-sev-low", text: "text-sev-low-ink", border: "border-sev-low" },
  medium: { badge: "bg-sev-medium-soft text-sev-medium-ink", solid: "bg-sev-medium", text: "text-sev-medium-ink", border: "border-sev-medium" },
  high: { badge: "bg-sev-high-soft text-sev-high-ink", solid: "bg-sev-high", text: "text-sev-high-ink", border: "border-sev-high" },
  critical: { badge: "bg-sev-critical-soft text-sev-critical-ink", solid: "bg-sev-critical", text: "text-sev-critical-ink", border: "border-sev-critical" },
};
