"use client";

import type { ReactNode } from "react";
import { DefaultZIndexes, Label, usePlotArea, useXAxisScale, ZIndexLayer } from "recharts";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { binPosition, thresholdText } from "@/lib/charts/thresholds";
import { useHydrated } from "@/lib/store/local-store";

/**
 * Shared chart frame and Recharts styling. All colours are CSS variables from
 * app/tokens.css, so charts re-theme with the rest of the app. Charts take
 * their colours and styles from here; they do not set their own.
 */

/**
 * Series colours (--chart-1..4). Series 1 is the default bar; series 2 is the
 * one highlight the speaker points at (same amber as --accent). Severity and
 * verdict colours come from SEVERITY_META / VERDICT_META and appear only when
 * a chart shows severity or verdicts.
 */
export const SERIES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"] as const;
export const HIGHLIGHT = SERIES[1];

/** A second measure of the same series (recall next to mAP50): the same colour, lighter. */
export const FADED_OPACITY = 0.5;

export const axisProps = {
  stroke: "var(--border-strong)",
  tick: { fill: "var(--muted)", fontSize: 12 },
  tickLine: false,
  axisLine: { stroke: "var(--border-strong)" },
} as const;

/** Axis titles (Recharts <Label>): small, muted, never the only place the unit is stated. */
export const axisLabelProps = { fill: "var(--muted)", fontSize: 12, style: { textAnchor: "middle" } } as const;

export const gridProps = { stroke: "var(--chart-grid)", vertical: false } as const;

/** Height of one row of threshold labels above the plot. */
const LABEL_ROW = 15;

/**
 * Plot margins. `xTitle` leaves room for an x-axis title below the ticks;
 * `labelRows` leaves one row per stacked threshold label above the plot.
 */
export function chartMargin({ xTitle = false, labelRows = 0 }: { xTitle?: boolean; labelRows?: number } = {}) {
  return { top: 8 + labelRows * LABEL_ROW, right: 8, bottom: xTitle ? 16 : 0, left: 0 };
}

/**
 * Y-axis width for tick labels of up to `chars` characters at 12 px, plus room
 * for the rotated title on the left, so the title never overlaps the ticks.
 */
export const yAxisWidth = (chars: number) => 26 + chars * 7;

/** Rotated y-axis title, left of the tick labels. Use with `yAxisWidth` and `chartMargin`. */
export function yAxisTitle(value: string) {
  return <Label value={value} angle={-90} position="insideLeft" offset={8} {...axisLabelProps} />;
}

/** X-axis title under the ticks. Use with `chartMargin({ xTitle: true })`. */
export function xAxisTitle(value: string) {
  return <Label value={value} position="insideBottom" offset={-10} {...axisLabelProps} />;
}

/**
 * X-axis tick for a histogram whose bins are categories: the bin's lower edge,
 * printed at that edge instead of mid-bar, so a threshold line at 0.40 meets
 * the "0.40" tick. Pass as `tick={<BinEdgeTick />}` after `{...axisProps}`.
 */
export function BinEdgeTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const scale = useXAxisScale();
  const value = payload?.value;
  const edge = value === undefined ? undefined : scale?.(value, { position: "start" });
  return (
    <text x={edge ?? x} y={y} dy="0.71em" textAnchor="middle" fill={axisProps.tick.fill} fontSize={axisProps.tick.fontSize}>
      {value}
    </text>
  );
}

/** Bars start at zero and have a slightly rounded top. */
export const barRadius: [number, number, number, number] = [4, 4, 0, 0];

/** Thin gap between the segments of a stacked bar. */
export const stackSeparatorProps = { stroke: "var(--surface)", strokeWidth: 1 } as const;

/** Value printed on a bar (Recharts <LabelList>). */
export const valueLabelProps = { fill: "var(--fg)", fontSize: 11 } as const;

/** A rule threshold (ours): ink, dashed. */
export const thresholdLineProps = { stroke: "var(--fg)", strokeDasharray: "4 3", strokeWidth: 1 } as const;

/** An outside reference value (someone else's published score): muted, dashed. */
export const referenceLineProps = { stroke: "var(--muted)", strokeDasharray: "4 3", strokeWidth: 1 } as const;

/** Outline in the card colour, so a label stays readable where it crosses a bar or another line. */
const haloProps = { stroke: "var(--surface)", strokeWidth: 3, strokeLinejoin: "round", paintOrder: "stroke" } as const;

/** Label on a horizontal reference line: inside the plot, just above the line, at its left end. */
export function referenceLabel(value: string) {
  return <Label value={value} position="insideBottomLeft" fill="var(--muted)" fontSize={11} {...haloProps} />;
}

/** Rough width of 11 px label text, to keep the label inside the chart. */
const labelWidth = (text: string) => text.length * 6;

/**
 * A rule threshold on a histogram whose bins are the x-axis categories: a
 * dashed ink line at the exact value (between bin edges if need be) and, above
 * the plot so it never sits on a tall bar, the rule and its value ("R1 0.40",
 * plus "(your setting)" when it is not the default). Two lines on one chart
 * use two label rows: give the lower value `row={1}` so its line passes left
 * of the other label.
 */
export function ThresholdMarker({
  bins,
  value,
  rule,
  defaultValue,
  row = 0,
}: {
  bins: { lo: number; label: string }[];
  value: number;
  rule: string;
  defaultValue: number;
  row?: number;
}) {
  const scale = useXAxisScale();
  const plot = usePlotArea();
  if (!scale || !plot || bins.length < 2) return null;
  const first = scale(bins[0].label, { position: "start" });
  const second = scale(bins[1].label, { position: "start" });
  const pos = binPosition(value, bins[0].lo, bins[1].lo - bins[0].lo, bins.length);
  if (first === undefined || second === undefined || pos === null) return null;
  const x = first + pos * (second - first);
  const text = thresholdText(rule, value, defaultValue);
  const y = plot.y - 4 - row * LABEL_ROW;
  const toTheRight = x + 4 + labelWidth(text) <= plot.x + plot.width + 8;
  return (
    <ZIndexLayer zIndex={DefaultZIndexes.line}>
      <g className="threshold-marker">
        <line x1={x} x2={x} y1={plot.y + plot.height} y2={y - 9} {...thresholdLineProps} />
        <text
          x={toTheRight ? x + 4 : x - 4}
          y={y}
          textAnchor={toTheRight ? "start" : "end"}
          fill="var(--fg)"
          fontSize={11}
          {...haloProps}
        >
          {text}
        </text>
      </g>
    </ZIndexLayer>
  );
}

export const tooltipProps = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-md)",
    color: "var(--fg)",
    fontSize: 13,
  },
  labelStyle: { color: "var(--fg)", fontWeight: 600 },
  itemStyle: { color: "var(--fg)" },
  cursor: { fill: "var(--surface-2)" },
} as const;

/** Card with title, the chart, an optional legend and a collapsible data table (accessibility). */
export function ChartCard({
  title,
  description,
  legend,
  table,
  children,
  badge,
  height = 260,
}: {
  title: string;
  description?: string;
  legend?: ReactNode;
  table?: ReactNode;
  children: ReactNode;
  badge?: ReactNode;
  height?: number;
}) {
  const hydrated = useHydrated();
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {badge}
      </CardHeader>
      <CardBody className="grid gap-3">
        {legend && <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">{legend}</div>}
        <div style={{ height }} role="img" aria-label={`${title} chart. The data table below has the same numbers.`}>
          {hydrated ? children : <Skeleton className="size-full" />}
        </div>
        {table && (
          <details className="text-sm">
            <summary className="cursor-pointer text-muted hover:text-fg">Show as table</summary>
            <div className="mt-2 max-h-64 overflow-auto">{table}</div>
          </details>
        )}
      </CardBody>
    </Card>
  );
}

export function LegendSwatch({ color, label, dashed, faded }: { color: string; label: string; dashed?: boolean; faded?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block h-2.5 w-3.5 rounded-sm"
        style={dashed ? { borderTop: `2px dashed ${color}`, height: 0 } : { background: color, opacity: faded ? FADED_OPACITY : undefined }}
      />
      {label}
    </span>
  );
}

/** Minimal table for the "Show as table" view. */
export function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full text-left text-xs">
      <thead className="text-muted">
        <tr>
          {head.map((h) => (
            <th key={h} scope="col" className="py-1 pr-3 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="tabular font-mono">
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-border">
            {r.map((c, j) => (
              <td key={j} className="py-1 pr-3">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
