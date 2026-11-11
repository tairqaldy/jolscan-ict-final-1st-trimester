import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/cn";

/**
 * KPI tile: label, number, note. The number is rendered at its real value on
 * the server and only animates when it changes in the browser.
 * `accentClass` draws a thin top stripe, e.g. "bg-sev-critical".
 * `nested` is for tiles inside another card (Home): no shadow, so a static number does
 * not look like a raised button next to the link rows (G-9). A prop, not className,
 * because cn() does not merge classes and "shadow-none" would not beat "shadow-sm".
 */
export function Kpi({
  label,
  value,
  note,
  suffix,
  decimals,
  accentClass,
  nested,
  className,
}: {
  label: string;
  value: number;
  note: string;
  suffix?: string;
  decimals?: number;
  accentClass?: string;
  nested?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative h-full overflow-hidden rounded-lg border border-border bg-surface p-(--card-pad)", !nested && "shadow-sm", className)}>
      {accentClass && <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", accentClass)} />}
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="tabular mt-2 font-display text-4xl font-bold whitespace-nowrap xl:text-5xl">
        <CountUp value={value} suffix={suffix} decimals={decimals} />
      </p>
      <p className="mt-1 text-xs text-subtle">{note}</p>
    </div>
  );
}
