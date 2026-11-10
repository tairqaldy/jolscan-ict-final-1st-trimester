"use client";

import {
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DemoBadge } from "@/components/app/demo-badge";
import { CHAMPION, EXPERIMENTS } from "@/lib/mock/experiments";
import { axisProps, ChartCard, DataTable, gridProps, LegendSwatch, tooltipProps } from "./chart-kit";

/**
 * Roads: accuracy vs speed for every experiment run: mAP50-95 (up is better)
 * against CPU latency (left is faster). The dashed line is the latency budget.
 * Runs without a measured latency are listed in the table but not plotted.
 */
export function ModelComparisonChart() {
  const data = EXPERIMENTS.runs.map((r) => ({ ...r, champion: r.id === CHAMPION.id }));
  const plotted = data.filter((r) => r.latencyMs !== null);
  const missing = data.length - plotted.length;
  return (
    <ChartCard
      title="Pothole model: accuracy against speed"
      description={`mAP50-95 against latency per run. Up and left is better; the dashed line is the latency budget.${
        missing ? ` ${missing} run${missing > 1 ? "s have" : " has"} no latency measured yet and ${missing > 1 ? "are" : "is"} not plotted.` : ""
      }`}
      badge={<DemoBadge />}
      height={300}
      legend={
        <>
          <LegendSwatch color="var(--chart-1)" label="Run" />
          <LegendSwatch color="var(--accent)" label={`Champion (${CHAMPION.id})`} />
          <LegendSwatch color="var(--muted)" dashed label={`Budget ${EXPERIMENTS.latencyBudgetMs} ms`} />
        </>
      }
      table={
        <DataTable
          head={["Run", "Changed", "mAP50-95", "Latency ms"]}
          rows={data.map((r) => [r.id, r.changed, r.map5095.toFixed(2), r.latencyMs ?? "not measured"])}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid {...gridProps} vertical />
          <XAxis type="number" dataKey="latencyMs" name="Latency" unit=" ms" domain={[0, "dataMax + 10"]} {...axisProps} />
          <YAxis
            type="number"
            dataKey="map5095"
            name="mAP50-95"
            domain={[(min: number) => Math.max(0, Math.floor((min - 0.05) * 20) / 20), (max: number) => Math.min(1, Math.ceil((max + 0.05) * 20) / 20)]}
            width={44}
            {...axisProps}
          />
          <ReferenceLine x={EXPERIMENTS.latencyBudgetMs} stroke="var(--muted)" strokeDasharray="5 4" />
          <Tooltip
            {...tooltipProps}
            cursor={{ stroke: "var(--border-strong)" }}
            formatter={(value, name) => [name === "Latency" ? `${value} ms` : Number(value).toFixed(2), name]}
          />
          <Scatter data={plotted.filter((d) => !d.champion)} fill="var(--chart-1)" stroke="var(--surface)" strokeWidth={2} name="Run">
            <LabelList dataKey="id" position="right" fill="var(--muted)" fontSize={11} />
          </Scatter>
          <Scatter data={plotted.filter((d) => d.champion)} fill="var(--accent)" stroke="var(--fg)" strokeWidth={1.5} name="Champion">
            <LabelList dataKey="id" position="top" fill="var(--fg)" fontSize={12} fontWeight={600} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
