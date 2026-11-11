import { Check } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Check mark in a filled circle: the selected cue that does not rely on colour
 * (G-30, U3). Decorative; the state itself is announced by aria-pressed or the
 * checked radio next to it.
 */
export function SelectedMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full bg-accent text-accent-fg shadow-sm ring-2 ring-surface",
        className,
      )}
    >
      <Check className="size-4" strokeWidth={3} />
    </span>
  );
}

/**
 * A pick-one tile (sample photo, sample sign, example pair). Selected: amber
 * border, tinted fill and a check mark in the corner, so it still reads in a
 * greyscale screenshot. Unselected: darker border and grey fill on hover.
 * Focus uses the global ring from globals.css.
 */
export function SelectableTile({
  selected,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "relative rounded-md border-2 text-left transition-colors",
        selected ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-border-strong hover:bg-surface-2",
        className,
      )}
      {...props}
    >
      {children}
      {selected && <SelectedMark className="absolute top-1.5 right-1.5" />}
    </button>
  );
}
