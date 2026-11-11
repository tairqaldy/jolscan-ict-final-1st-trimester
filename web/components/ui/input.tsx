import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

/*
 * G-6 states. Hover: the border darkens to --muted. Focus: the global ring,
 * eased in. Disabled: surface-2 fill, subtle text, not-allowed cursor.
 * Error: aria-invalid="true" turns the border --danger; Field's `error` sets it
 * and links the message with aria-describedby.
 */
export const inputClasses =
  "h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-fg placeholder:text-subtle transition-colors duration-[var(--duration-fast)] ease-standard focus-ring-in enabled:hover:border-muted disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-subtle aria-[invalid=true]:border-danger";
export const INPUT_HOVER = "border-muted!";

/** Text/date/number input with a visible label. */
export function Field({
  label,
  hint,
  error,
  className,
  inputClassName,
  ...props
}: ComponentProps<"input"> & {
  label: string;
  hint?: string;
  /** Shown under the input in --danger; marks the input aria-invalid. */
  error?: string;
  inputClassName?: string;
}) {
  const id = useId();
  const describedBy = [hint && `${id}-h`, error && `${id}-e`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(inputClasses, inputClassName)}
        {...props}
      />
      {hint && (
        <p id={`${id}-h`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-e`} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
