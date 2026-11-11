import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  illustration,
  className,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  /** A drawing from components/illustrations, shown instead of the icon circle (G-26). */
  illustration?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong px-6 py-12 text-center", className)}>
      {illustration ? (
        <span className="text-muted">{illustration}</span>
      ) : (
        <span className="grid size-12 place-items-center rounded-full bg-surface-2 text-muted">
          <Icon className="size-6" aria-hidden />
        </span>
      )}
      <p className="font-display text-lg font-semibold">{title}</p>
      {children && <div className="max-w-sm text-sm text-muted">{children}</div>}
      {action}
    </div>
  );
}
