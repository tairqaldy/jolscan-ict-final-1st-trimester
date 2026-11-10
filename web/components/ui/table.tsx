import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Plain semantic table. Wraps in a scroll container so narrow screens never scroll the page sideways. */
export function Table({ className, caption, children, ...props }: ComponentProps<"table"> & { caption?: string }) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props}>
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function THead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("border-b border-border text-xs tracking-wide text-muted uppercase", className)} {...props} />;
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("border-b border-border last:border-0", className)} {...props} />;
}

export function TH({ className, ...props }: ComponentProps<"th">) {
  return <th scope="col" className={cn("px-3 py-2.5 font-medium whitespace-nowrap first:pl-5 last:pr-5", className)} {...props} />;
}

export function TD({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-3 py-3 align-middle first:pl-5 last:pr-5", className)} {...props} />;
}
