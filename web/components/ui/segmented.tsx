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
      {/* flex-wrap: on a phone the options wrap onto a second row instead of widening the page, and each row fills the
          width, so a lone option on the second row reads as part of the control rather than a broken one. */}
      <div className="inline-flex w-full max-w-full flex-wrap rounded-md border border-border-strong bg-surface-2 p-0.5 sm:w-fit">
        {options.map((o) => {
          const Icon = o.icon;
          const active = o.value === value;
          return (
            <label
              key={o.value}
              className={cn(
                // G-6: 48 px tall below sm (U6). A disabled option has no hover.
                "relative inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium sm:flex-none transition-[color,background-color,box-shadow] duration-[var(--duration-fast)] ease-standard has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus sm:min-h-0",
                active ? "bg-surface text-fg shadow-sm" : !o.disabled && "text-muted hover:text-fg",
                o.disabled && "cursor-not-allowed text-muted opacity-50",
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
