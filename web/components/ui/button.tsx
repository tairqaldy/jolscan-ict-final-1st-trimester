import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { FORCED_FOCUS, type InteractionState } from "./states";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

/*
 * G-6 states: hover darkens the fill, a press scales the button to 98 % (it
 * "gives" under the finger), the focus ring eases in (globals.css .focus-ring-in),
 * disabled fades to 50 %, loading is aria-busy on a disabled button with a
 * spinner in the label. Reduce motion makes all of it instant.
 */
const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-md transition-[color,background-color,border-color,opacity,scale] duration-[var(--duration-fast)] ease-standard active:scale-[0.98] focus-ring-in disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress [&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover shadow-xs",
  secondary: "bg-surface text-fg border border-border-strong hover:bg-surface-2",
  ghost: "text-fg hover:bg-surface-2",
  danger: "bg-danger text-surface hover:opacity-90",
};

/**
 * The hover and pressed look without the pointer, for the states grid on /design.
 * "!" makes them win over the resting fill they replace.
 */
export const BUTTON_HOVER: Record<Variant, string> = {
  primary: "bg-accent-hover!",
  secondary: "bg-surface-2!",
  ghost: "bg-surface-2!",
  danger: "opacity-90!",
};
export const BUTTON_PRESSED = "scale-[0.98]!";

/** Below the sm breakpoint every size is at least 48 px tall (U6, touch targets). */
const sizes: Record<Size, string> = {
  sm: "h-12 sm:h-8 px-3 text-sm",
  md: "h-12 sm:h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  forceState,
  className,
}: { variant?: Variant; size?: Size; forceState?: InteractionState; className?: string } = {}) {
  return cn(
    base,
    variants[variant],
    sizes[size],
    forceState === "hover" && BUTTON_HOVER[variant],
    forceState === "focus" && FORCED_FOCUS,
    forceState === "pressed" && BUTTON_PRESSED,
    className,
  );
}

export function Button({
  variant,
  size,
  forceState,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  /** Draws a hover, focus or pressed look without the pointer. Only for /design. */
  forceState?: InteractionState;
}) {
  return <button type={type} className={buttonClasses({ variant, size, forceState, className })} {...props} />;
}

/** A link that looks like a button. */
export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
