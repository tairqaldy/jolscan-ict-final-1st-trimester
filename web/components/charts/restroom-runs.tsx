"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoBadge } from "@/components/app/demo-badge";
import { RESTROOM_EXPERIMENTS, RESTROOM_IS_DEMO } from "@/lib/mock/restroom-experiments";
import {
  axisProps,
  barRadius,
  ChartCard,
  chartMargin,
  DataTable,
  gridProps,
  LegendSwatch,
  referenceLabel,
  referenceLineProps,
  SERIES,
  tooltipProps,
  xAxisTitle,
  yAxisTitle,
  yAxisWidth,
} from "./chart-kit";

const show = (v: number | null) => (v === null ? "not run yet" : v.toFixed(2));

/**
 * Restrooms: top-1 matching accuracy per run (validation and test), bars from
 * zero, with the two IOAI committee reference points as dashed lines. Runs
 * without numbers keep their slot on the axis, so the chart reads the same
 * before and after the experiment.
 */
export function RestroomRunsChart() {
  const { runs, reference } = RESTROOM_EXPERIMENTS;
  const data = runs.map((r) => ({ run: r.run, val: r.matchTop1Val, test: r.matchTop1Test }));
  const anyNumbers = data.some((d) => d.val !== null || d.test !== null);
  return (
    <ChartCard
      title="Sign model: matching accuracy per run"
      description={
        anyNumbers
          ? "Top-1 matching accuracy, bars from zero. Dashed lines: the IOAI committee's published baseline and best score on their test set (not our runs)."
          : "No run has numbers yet: bars appear when the experiment results are exported. The dashed lines are the IOAI committee's published baseline and best score (not our runs)."
      }
      badge={<DemoBadge module="restrooms" show={RESTROOM_IS_DEMO} label={runs.some((r) => r.isReal) ? "Some runs are placeholders" : "Demo data"} />}
      height={280}
      legend={
        <>
          <LegendSwatch color={SERIES[0]} label="Validation (10 queries)" />
          <LegendSwatch color={SERIES[1]} label="Test (30 queries)" />
          <LegendSwatch color={referenceLineProps.stroke} dashed label="IOAI reference" />
        </>
      }
      table={
        <DataTable
          head={["Run", "Top-1 validation", "Top-1 test"]}
          rows={[
            ...data.map((d) => [d.run, show(d.val), show(d.test)]),
            ["IOAI baseline (theirs)", "", reference.ioaiBaseline.toFixed(2)],
            ["IOAI best (theirs)", "", reference.ioaiBest.toFixed(2)],
          ]}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={chartMargin({ xTitle: true })} barGap={2}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="run" {...axisProps}>
            {xAxisTitle("Run")}
          </XAxis>
          <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} width={yAxisWidth(4)} {...axisProps}>
            {yAxisTitle("Top-1 accuracy")}
          </YAxis>
          <Tooltip {...tooltipProps} formatter={(v) => (typeof v === "number" ? v.toFixed(2) : "not run yet")} />
          <ReferenceLine y={reference.ioaiBaseline} {...referenceLineProps}>
            {referenceLabel(`IOAI baseline ${reference.ioaiBaseline.toFixed(2)}`)}
          </ReferenceLine>
          <ReferenceLine y={reference.ioaiBest} {...referenceLineProps}>
            {referenceLabel(`IOAI best ${reference.ioaiBest.toFixed(2)}`)}
          </ReferenceLine>
          <Bar dataKey="val" name="Validation" fill={SERIES[0]} radius={barRadius} />
          <Bar dataKey="test" name="Test" fill={SERIES[1]} radius={barRadius} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
