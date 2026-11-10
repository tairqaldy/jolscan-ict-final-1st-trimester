import { cn } from "@/lib/cn";
import { GENDER_CLASSES, GENDER_META, VERDICT_CLASSES, VERDICT_META } from "@/lib/signage-ui";
import type { Gender, SignageVerdict } from "@/lib/types";

/** Verdict as colour + icon + word. */
export function VerdictBadge({ verdict, size = "md", className }: { verdict: SignageVerdict; size?: "md" | "lg"; className?: string }) {
  const meta = VERDICT_META[verdict];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm font-semibold whitespace-nowrap",
        VERDICT_CLASSES[verdict].badge,
        size === "lg" ? "px-3 py-1 text-base [&_svg]:size-5" : "px-2 py-0.5 text-xs [&_svg]:size-3.5",
        className,
      )}
    >
      <Icon aria-hidden />
      {meta.label}
    </span>
  );
}

/** Predicted gender as colour + Mars/Venus icon + word, optionally with the confidence. */
export function GenderTag({ gender, confidence, className }: { gender: Gender; confidence?: number; className?: string }) {
  const meta = GENDER_META[gender];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3.5",
        GENDER_CLASSES[gender].badge,
        className,
      )}
    >
      <Icon aria-hidden />
      {meta.label}
      {confidence !== undefined && <span className="tabular font-mono font-medium">{Math.round(confidence * 100)}%</span>}
    </span>
  );
}

/**
 * A 0..1 value as a bar with the rule threshold marked. The bar colour comes
 * from `tone`; the threshold tick and the pass/fail word carry the meaning.
 */
export function ThresholdBar({
  value,
  threshold,
  label,
  valueText,
  thresholdLabel,
  tone = "neutral",
}: {
  value: number;
  threshold: number;
  label: string;
  valueText: string;
  thresholdLabel: string;
  tone?: Gender | "neutral";
}) {
  const passed = value >= threshold;
  const fill = tone === "neutral" ? "bg-inverse" : GENDER_CLASSES[tone].solid;
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted">{label}</span>
        <span className="tabular font-mono font-semibold">{valueText}</span>
      </div>
      <div
        className="relative h-2.5 rounded-full bg-surface-3"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={value}
        aria-valuetext={`${valueText}, ${passed ? "at or above" : "below"} ${thresholdLabel}`}
      >
        <span className={cn("absolute inset-y-0 left-0 rounded-full", fill)} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
        <span
          aria-hidden
          className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-fg"
          style={{ left: `calc(${threshold * 100}% - 1px)` }}
        />
      </div>
      <p className="text-xs text-subtle">
        {passed ? "At or above" : "Below"} {thresholdLabel}
      </p>
    </div>
  );
}

/** Square-ish frame for a sign image (bundled SVG, upload preview or stored thumbnail). */
export function SignImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  return (
    <div className={cn("grid aspect-[5/6] place-items-center overflow-hidden rounded-md border border-border bg-surface-2", className)}>
      {src ? (
        // Plain <img>: sources are local SVG samples, blob: previews or small data: URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="size-full object-contain p-2" draggable={false} />
      ) : (
        <span className="px-3 text-center text-xs text-muted">Image not stored on this device</span>
      )}
    </div>
  );
}
