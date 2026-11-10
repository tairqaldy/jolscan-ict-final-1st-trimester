"use client";

import * as RadixSlider from "@radix-ui/react-slider";
import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Slider with a label and a number input beside it, so values can be typed
 * exactly (keyboard users and precise thresholds).
 */
export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  disabled,
  format = (v) => String(v),
  className,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  disabled?: boolean;
  format?: (v: number) => string;
  className?: string;
}) {
  const id = useId();
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className={cn("grid gap-2", disabled && "opacity-60", className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`${id}-n`} className="text-sm font-medium">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            id={`${id}-n`}
            type="number"
            inputMode="decimal"
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(e) => {
              const v = e.target.valueAsNumber;
              if (Number.isFinite(v)) onChange(clamp(v));
            }}
            className="tabular h-8 w-20 rounded-sm border border-border-strong bg-surface px-2 text-right font-mono text-sm"
          />
          {unit && <span className="text-sm text-muted">{unit}</span>}
        </div>
      </div>
      <RadixSlider.Root
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={([v]) => onChange(v)}
        className="relative flex h-5 touch-none items-center select-none"
      >
        <RadixSlider.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-surface-3">
          <RadixSlider.Range className="absolute h-full bg-accent" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          aria-label={label}
          aria-valuetext={format(value)}
          className="block size-4.5 rounded-full border-2 border-accent bg-surface shadow-sm"
        />
      </RadixSlider.Root>
    </div>
  );
}
