"use client";

import * as RadixSlider from "@radix-ui/react-slider";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { FORCED_FOCUS, type InteractionState } from "./states";

/*
 * G-6 thumb states. Hover: it lifts (shadow-md). Press and drag: it grows to
 * 110 %, so the finger sees what it holds. Focus: the ring eases in. The
 * ::before box makes the thumb's tap target 48 px (U6). Disabled: the whole
 * field is at 60 % (unchanged) with a not-allowed cursor.
 */
export const SLIDER_HOVER = "shadow-md!";
export const SLIDER_PRESSED = "scale-110!";

/** Always "0.4", never "0,4": numbers in inputs are formatted the same in every browser locale. */
function formatNumber(v: number, step: number) {
  const decimals = Math.min(4, (String(step).split(".")[1] ?? "").length);
  return Number(v.toFixed(decimals)).toString();
}

/**
 * Slider with a label and a number field beside it, so values can be typed
 * exactly (keyboard users and precise thresholds).
 *
 * The field is a text input with inputMode="decimal", not type="number":
 * a number input shows the browser locale's decimal comma (ru, kk), so the
 * same threshold read "0,4" here and "0.4" everywhere else. This field always
 * shows a dot, accepts a dot or a comma when typing, and steps with the
 * arrow keys like a number input.
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
  format,
  forceState,
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
  /** Draws a hover, focus or pressed thumb without the pointer. Only for /design. */
  forceState?: InteractionState;
  className?: string;
}) {
  const id = useId();
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const shown = formatNumber(value, step);
  // While the user types, keep their text; otherwise show the value.
  const [draft, setDraft] = useState<string | null>(null);

  const parse = (text: string) => {
    const v = Number(text.trim().replace(",", "."));
    return text.trim() !== "" && Number.isFinite(v) ? v : null;
  };

  return (
    <div className={cn("grid gap-2", disabled && "opacity-60", className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`${id}-n`} className="text-sm font-medium">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            id={`${id}-n`}
            type="text"
            inputMode="decimal"
            lang="en"
            autoComplete="off"
            spellCheck={false}
            value={draft ?? shown}
            disabled={disabled}
            aria-describedby={`${id}-range`}
            onChange={(e) => {
              setDraft(e.target.value);
              // Apply as soon as the typed value is valid; out-of-range text waits for blur.
              const v = parse(e.target.value);
              if (v !== null && v >= min && v <= max) onChange(v);
            }}
            onBlur={(e) => {
              const v = parse(e.target.value);
              if (v !== null) onChange(clamp(v));
              setDraft(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                setDraft(null);
                const dir = e.key === "ArrowUp" ? 1 : -1;
                onChange(clamp(Number((value + dir * step).toFixed(6))));
              } else if (e.key === "Enter") {
                setDraft(null);
              }
            }}
            className="tabular h-8 w-20 rounded-sm border border-border-strong bg-surface px-2 text-right font-mono text-sm transition-colors duration-[var(--duration-fast)] ease-standard hover:border-muted disabled:cursor-not-allowed"
          />
          {unit && <span className="text-sm text-muted">{unit}</span>}
          <span id={`${id}-range`} className="sr-only">
            from {formatNumber(min, step)} to {formatNumber(max, step)}
          </span>
        </div>
      </div>
      <RadixSlider.Root
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={([v]) => {
          setDraft(null);
          onChange(v);
        }}
        className="relative flex h-5 touch-none items-center select-none data-[disabled]:cursor-not-allowed"
      >
        <RadixSlider.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-surface-3">
          <RadixSlider.Range className="absolute h-full bg-accent" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          aria-label={label}
          aria-valuetext={format ? format(value) : shown}
          className={cn(
            "relative block size-4.5 rounded-full border-2 border-accent bg-surface shadow-sm transition-[scale,box-shadow] duration-[var(--duration-fast)] ease-standard focus-ring-in before:absolute before:-inset-[15px] hover:shadow-md active:scale-110 data-[disabled]:shadow-sm data-[disabled]:active:scale-100",
            forceState === "hover" && SLIDER_HOVER,
            forceState === "focus" && FORCED_FOCUS,
            forceState === "pressed" && SLIDER_PRESSED,
          )}
        />
      </RadixSlider.Root>
    </div>
  );
}
