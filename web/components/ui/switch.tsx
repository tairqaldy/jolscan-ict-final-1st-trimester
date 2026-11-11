"use client";

import * as RadixSwitch from "@radix-ui/react-switch";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FORCED_FOCUS, type InteractionState } from "./states";

/*
 * G-6 states. Hover: the thumb lifts (shadow-md) and a checked track darkens.
 * Press: the thumb stretches 4 px towards the side it will slide to. Focus: the
 * ring eases in. Disabled: 50 % and a not-allowed cursor. The thumb slides in
 * --duration-fast; Reduce motion makes it jump.
 * The ::before box makes the tap target 48 px tall (U6) without moving the layout.
 * Forced classes end in "!" so they win over the resting look they replace.
 */
export const SWITCH_HOVER = { root: "data-[state=checked]:bg-accent-hover!", thumb: "shadow-md!" };
export const SWITCH_PRESSED = { thumb: "w-5.5! data-[state=checked]:translate-x-[1.125rem]!" };

/** Accessible on/off switch with a visible label (Radix Switch). */
export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  forceState,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** Draws a hover, focus or pressed look without the pointer. Only for /design. */
  forceState?: InteractionState;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <label htmlFor={id} className={cn("text-sm font-medium", disabled && "text-subtle")}>
          {label}
        </label>
        {description && <p id={`${id}-d`} className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={description ? `${id}-d` : undefined}
        className={cn(
          "group relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border-strong bg-surface-3 transition-colors duration-[var(--duration-fast)] ease-standard focus-ring-in before:absolute before:-inset-x-1 before:-inset-y-3 data-[state=checked]:border-accent data-[state=checked]:bg-accent hover:data-[state=checked]:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50",
          forceState === "hover" && SWITCH_HOVER.root,
          forceState === "focus" && FORCED_FOCUS,
        )}
      >
        <RadixSwitch.Thumb
          className={cn(
            "block h-4.5 w-4.5 translate-x-0.5 rounded-full bg-surface shadow-sm ring-1 ring-border-strong transition-[translate,width,box-shadow] duration-[var(--duration-fast)] ease-standard data-[state=checked]:translate-x-[1.375rem] data-[state=checked]:ring-accent group-hover:shadow-md group-active:w-5.5 group-active:data-[state=checked]:translate-x-[1.125rem] group-disabled:shadow-sm",
            forceState === "hover" && SWITCH_HOVER.thumb,
            forceState === "pressed" && SWITCH_PRESSED.thumb,
          )}
        />
      </RadixSwitch.Root>
    </div>
  );
}
