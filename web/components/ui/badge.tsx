import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { SEVERITY_CLASSES, SEVERITY_META } from "@/lib/severity";
import type { Severity } from "@/lib/types";

type Tone = "neutral" | "accent" | "outline" | "inverse";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  accent: "bg-accent-soft text-accent-ink",
  outline: "border border-border-strong text-muted",
  inverse: "bg-inverse text-inverse-fg",
};

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Severity is always shown as colour + icon + word. */
export function SeverityBadge({
  severity,
  size = "md",
  className,
}: {
  severity: Severity;
  size?: "md" | "lg";
  className?: string;
}) {
  const meta = SEVERITY_META[severity];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm font-semibold whitespace-nowrap",
        SEVERITY_CLASSES[severity].badge,
        size === "lg" ? "px-3 py-1 text-base [&_svg]:size-5" : "px-2 py-0.5 text-xs [&_svg]:size-3.5",
        className,
      )}
    >
      <Icon aria-hidden />
      {meta.label}
    </span>
  );
}

/** A small coloured square + label, for legends. */
export function SeverityDot({ severity, className }: { severity: Severity; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-2.5 shrink-0 rounded-xs", SEVERITY_CLASSES[severity].solid, className)} />;
}
