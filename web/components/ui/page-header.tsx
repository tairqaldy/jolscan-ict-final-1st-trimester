import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Title block at the top of every app page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow && <p className="mb-1 eyebrow text-accent-ink">{eyebrow}</p>}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && <div className="mt-2 text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
