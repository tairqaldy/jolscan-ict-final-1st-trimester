import { Fragment, type ReactNode } from "react";
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
        {eyebrow && <p className="mb-1 eyebrow text-accent-ink">{eyebrowParts(eyebrow)}</p>}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && <div className="mt-2 text-muted">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/**
 * Overpass draws the middle dot with no advance width and its ink to the right
 * of the pen, so in "Roads · Pothole detection" the dot sat against the next
 * word. Each dot gets its own 0.24em box (the ink is 0.04em to 0.20em), so the
 * spaces on both sides look the same. The text, and what a screen reader
 * reads, stay as written.
 */
function eyebrowParts(text: string): ReactNode {
  const parts = text.split(" · ");
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 && (
        <>
          {" "}
          <span className="inline-block w-[0.24em]">·</span>{" "}
        </>
      )}
      {part}
    </Fragment>
  ));
}
