/**
 * Restroom module presentation: verdict and gender labels, icons and token
 * class names. Colour is never the only carrier of meaning: every use pairs
 * the colour with the word and the icon below.
 */
import { CircleCheck, Mars, OctagonX, TriangleExclamationPoint, Venus, type LucideIcon } from "lucide-react";
import type { Gender, SignageVerdict } from "@/lib/types";

export const VERDICT_META: Record<
  SignageVerdict,
  { label: string; icon: LucideIcon; rank: number; cssVar: string; description: string }
> = {
  clear: { label: "Clear", icon: CircleCheck, rank: 0, cssVar: "var(--verdict-clear)", description: "Visitors can tell the doors apart" },
  review: { label: "Review", icon: TriangleExclamationPoint, rank: 1, cssVar: "var(--verdict-review)", description: "Check the sign design on site" },
  confusing: { label: "Confusing", icon: OctagonX, rank: 2, cssVar: "var(--verdict-confusing)", description: "Replace the signage" },
};

/** Static class names (written out in full so Tailwind can see them). */
export const VERDICT_CLASSES: Record<SignageVerdict, { badge: string; solid: string; text: string; border: string }> = {
  clear: { badge: "bg-verdict-clear-soft text-verdict-clear-ink", solid: "bg-verdict-clear", text: "text-verdict-clear-ink", border: "border-verdict-clear" },
  review: { badge: "bg-verdict-review-soft text-verdict-review-ink", solid: "bg-verdict-review", text: "text-verdict-review-ink", border: "border-verdict-review" },
  confusing: { badge: "bg-verdict-confusing-soft text-verdict-confusing-ink", solid: "bg-verdict-confusing", text: "text-verdict-confusing-ink", border: "border-verdict-confusing" },
};

export const GENDER_META: Record<Gender, { label: string; icon: LucideIcon; cssVar: string }> = {
  male: { label: "Male", icon: Mars, cssVar: "var(--gender-male)" },
  female: { label: "Female", icon: Venus, cssVar: "var(--gender-female)" },
};

export const GENDER_CLASSES: Record<Gender, { badge: string; solid: string; text: string }> = {
  male: { badge: "bg-gender-male-soft text-gender-male-ink", solid: "bg-gender-male", text: "text-gender-male-ink" },
  female: { badge: "bg-gender-female-soft text-gender-female-ink", solid: "bg-gender-female", text: "text-gender-female-ink" },
};
