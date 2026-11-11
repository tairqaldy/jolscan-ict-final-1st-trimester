"use client";

import type { LucideIcon } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * A small radio group drawn as joined buttons (theme, provider...).
 * Native radio inputs keep arrow-key navigation and screen-reader semantics.
 */
export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  hideLabel,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: LucideIcon; disabled?: boolean }[];
  hideLabel?: boolean;
  className?: string;
}) {
  const name = useId();
  return (
    <fieldset className={cn("grid gap-1.5", className)}>
      <legend className={cn("mb-1.5 text-sm font-medium", hideLabel && "sr-only")}>{label}</legend>
      {/* flex-wrap: on a phone the options wrap onto a second row instead of widening the page. */}
      <div className="inline-flex w-fit max-w-full flex-wrap rounded-md border border-border-strong bg-surface-2 p-0.5">
        {options.map((o) => {
          const Icon = o.icon;
          const active = o.value === value;
          return (
            <label
              key={o.value}
              className={cn(
                "relative inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                active ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg",
                o.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={active}
                disabled={o.disabled}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {Icon && <Icon className="size-4" aria-hidden />}
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
