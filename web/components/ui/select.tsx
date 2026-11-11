"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { FORCED_FOCUS, type InteractionState } from "./states";

/*
 * G-6 states. Hover: the border darkens to --muted. Open: an accent border and
 * the chevron turns over. Focus: the ring eases in. The list fades in.
 */
export const SELECT_HOVER = "border-muted!";

export type SelectOption = { value: string; label: string; disabled?: boolean; hint?: string };

/** Labelled select (Radix Select): keyboard and screen-reader friendly. */
export function Select({
  label,
  value,
  onValueChange,
  options,
  hideLabel,
  className,
  triggerClassName,
  forceState,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  hideLabel?: boolean;
  className?: string;
  triggerClassName?: string;
  /** Draws a hover or focus look without the pointer. Only for /design. */
  forceState?: InteractionState;
}) {
  const id = useId();
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label id={id} className={cn("text-sm font-medium", hideLabel && "sr-only")}>
        {label}
      </label>
      <RadixSelect.Root value={value} onValueChange={onValueChange}>
        <RadixSelect.Trigger
          aria-labelledby={id}
          className={cn(
            "group inline-flex h-10 min-w-[min(10rem,100%)] items-center justify-between gap-2 rounded-md border border-border-strong bg-surface px-3 text-sm transition-colors duration-[var(--duration-fast)] ease-standard focus-ring-in hover:border-muted data-[state=open]:border-accent",
            forceState === "hover" && SELECT_HOVER,
            forceState === "focus" && FORCED_FOCUS,
            triggerClassName,
          )}
        >
          <RadixSelect.Value />
          <RadixSelect.Icon>
            <ChevronDown className="size-4 text-muted transition-[rotate] duration-[var(--duration-fast)] ease-standard group-data-[state=open]:rotate-180" aria-hidden />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="popover-in z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-surface text-fg shadow-lg"
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((o) => (
                <RadixSelect.Item
                  key={o.value}
                  value={o.value}
                  disabled={o.disabled}
                  className="relative flex cursor-default items-center justify-between gap-6 rounded-sm py-2 pr-2 pl-7 text-sm outline-none select-none data-[disabled]:text-subtle data-[highlighted]:bg-surface-2"
                >
                  <RadixSelect.ItemIndicator className="absolute left-2">
                    <Check className="size-3.5" aria-hidden />
                  </RadixSelect.ItemIndicator>
                  <RadixSelect.ItemText>{o.label}</RadixSelect.ItemText>
                  {o.hint && <span className="text-xs text-subtle">{o.hint}</span>}
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
