"use client";

import { Bar, BarChart, CartesianGrid, Cell, Label, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoBadge } from "@/components/app/demo-badge";
import { CHAMPION, chartTakeaway, EXPERIMENTS } from "@/lib/mock/experiments";
import { axisProps, ChartCard, DataTable, gridProps, LegendSwatch, tooltipProps } from "./chart-kit";

const show = (v: number | null) => (v === null ? "no value" : v.toFixed(2));

/** Recall bars use the same colour as the mAP50 bars, only lighter. */
const RECALL_OPACITY = 0.5;

/**
 * Roads: test mAP50 and test recall at confidence 0.40 per run, bars from
 * zero (runs are categories). The champion's bars are amber, every other run
 * is slate. The champion is picked on validation, so its test bar is not
 * always the tallest. A run without a number keeps its slot on the axis.
 */
export function ModelComparisonChart() {
  const data = EXPERIMENTS.runs.map((r) => {
    const champion = r.id === CHAMPION.id;
    return {
      id: r.id,
      changed: r.changed,
      champion,
      map50: r.map50,
      recall: r.recallAtRulesConf,
      // Value labels only on the champion's bars, so the chart is not covered in numbers.
      map50Label: champion ? r.map50 : null,
      recallLabel: champion ? r.recallAtRulesConf : null,
    };
  });
  const missing = data.filter((d) => d.map50 === null || d.recall === null).length;
  const colour = (champion: boolean) => (champion ? "var(--accent)" : "var(--chart-1)");
  return (
    <ChartCard
      title={chartTakeaway(EXPERIMENTS.runs, CHAMPION.id)}
      description={`Test split, bars from zero. The champion is chosen on validation mAP50 (see the table), not on these test bars.${
        missing ? ` ${missing} run${missing > 1 ? "s have" : " has"} a missing number and keep${missing > 1 ? "" : "s"} an empty slot.` : ""
      }`}
      badge={<DemoBadge />}
      height={300}
      legend={
        <>
          <LegendSwatch color="var(--chart-1)" label="Test mAP50" />
          <LegendSwatch color="color-mix(in srgb, var(--chart-1) 50%, transparent)" label="Test recall at 0.40" />
          <LegendSwatch color="var(--accent)" label={`Champion (${CHAMPION.id})`} />
        </>
      }
      table={
        <DataTable
          head={["Run", "Changed", "Test mAP50", "Test recall at 0.40"]}
          rows={data.map((d) => [d.champion ? `${d.id} (champion)` : d.id, d.changed, show(d.map50), show(d.recall)])}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, bottom: 16, left: -8 }} barGap={2}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="id" {...axisProps}>
            <Label value="Run" position="insideBottom" offset={-10} fill="var(--muted)" fontSize={12} />
          </XAxis>
          <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} width={44} {...axisProps}>
            <Label value="Score (test)" angle={-90} position="insideLeft" offset={14} fill="var(--muted)" fontSize={12} style={{ textAnchor: "middle" }} />
          </YAxis>
          <Tooltip {...tooltipProps} formatter={(v) => (typeof v === "number" ? v.toFixed(2) : "no value")} />
          <Bar dataKey="map50" name="Test mAP50" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((d) => (
              <Cell key={d.id} fill={colour(d.champion)} />
            ))}
            <LabelList dataKey="map50Label" position="top" fill="var(--fg)" fontSize={11} formatter={(v) => (typeof v === "number" ? v.toFixed(2) : "")} />
          </Bar>
          <Bar dataKey="recall" name="Test recall at 0.40" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((d) => (
              <Cell key={d.id} fill={colour(d.champion)} fillOpacity={RECALL_OPACITY} />
            ))}
            <LabelList dataKey="recallLabel" position="top" fill="var(--fg)" fontSize={11} formatter={(v) => (typeof v === "number" ? v.toFixed(2) : "")} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
