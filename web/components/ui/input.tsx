import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const inputClasses =
  "h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-fg placeholder:text-subtle";

/** Text/date/number input with a visible label. */
export function Field({
  label,
  hint,
  className,
  inputClassName,
  ...props
}: ComponentProps<"input"> & { label: string; hint?: string; inputClassName?: string }) {
  const id = useId();
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input id={id} aria-describedby={hint ? `${id}-h` : undefined} className={cn(inputClasses, inputClassName)} {...props} />
      {hint && (
        <p id={`${id}-h`} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
