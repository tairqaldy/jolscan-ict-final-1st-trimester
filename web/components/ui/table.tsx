import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Plain semantic table. Wraps in a scroll container so narrow screens never scroll the page sideways.
 * Tabular figures make numbers line up down a column (G-45).
 */
export function Table({ className, caption, children, ...props }: ComponentProps<"table"> & { caption?: string }) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cn("tabular w-full border-collapse text-left text-sm", className)} {...props}>
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function THead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("border-b border-border text-xs tracking-wide text-muted uppercase", className)} {...props} />;
}

/**
 * G-6: a row eases its colour when a page makes it clickable (hover:bg-surface-2)
 * and shows data-state="selected" with the accent-soft fill used by selected tiles.
 * Plain rows have no hover, so they do not pretend to be clickable.
 */
export function TR({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-border transition-colors duration-[var(--duration-fast)] ease-standard last:border-0 data-[state=selected]:bg-accent-soft",
        className,
      )}
      {...props}
    />
  );
}

export function TH({ className, ...props }: ComponentProps<"th">) {
  return <th scope="col" className={cn("px-3 py-2.5 font-medium whitespace-nowrap first:pl-5 last:pr-5", className)} {...props} />;
}

export function TD({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-3 py-3 align-middle first:pl-5 last:pr-5", className)} {...props} />;
}
