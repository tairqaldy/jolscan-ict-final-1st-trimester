"use client";

import * as RadixSwitch from "@radix-ui/react-switch";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Accessible on/off switch with a visible label (Radix Switch). */
export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
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
        className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border-strong bg-surface-3 transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent disabled:opacity-50"
      >
        <RadixSwitch.Thumb className="block size-4.5 translate-x-0.5 rounded-full bg-surface shadow-sm ring-1 ring-border-strong transition-transform duration-[var(--duration-fast)] ease-standard data-[state=checked]:translate-x-[1.375rem] data-[state=checked]:ring-accent" />
      </RadixSwitch.Root>
    </div>
  );
}
