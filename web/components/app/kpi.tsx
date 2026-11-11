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
      {/* The number steps down where tiles get narrow: phones (two or three tiles a row) and
          lg, where the sidebar appears and the row goes to four tiles. Checked at 320, 375,
          1024 and 1440 px that no number overflows its tile (G-9, docs/design/dashboard-review.md). */}
      <p className="tabular mt-2 font-display text-3xl font-bold whitespace-nowrap sm:text-4xl lg:text-3xl xl:text-5xl">
        <CountUp value={value} suffix={suffix} decimals={decimals} />
      </p>
      <p className="mt-1 text-xs text-subtle">{note}</p>
    </div>
  );
}
