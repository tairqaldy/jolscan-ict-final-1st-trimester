"use client";

import type { ReactNode } from "react";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/lib/store/local-store";

/**
 * Shared chart frame and Recharts styling. All colours are CSS variables from
 * app/tokens.css, so charts re-theme with the rest of the app.
 */
export const axisProps = {
  stroke: "var(--border-strong)",
  tick: { fill: "var(--muted)", fontSize: 12 },
  tickLine: false,
  axisLine: { stroke: "var(--border-strong)" },
} as const;

/** Axis titles (Recharts <Label>): small, muted, never the only place the unit is stated. */
export const axisLabelProps = { fill: "var(--muted)", fontSize: 12, style: { textAnchor: "middle" } } as const;

export const gridProps = { stroke: "var(--chart-grid)", vertical: false } as const;

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

export function LegendSwatch({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block h-2.5 w-3.5 rounded-xs"
        style={dashed ? { borderTop: `2px dashed ${color}`, height: 0 } : { background: color }}
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
