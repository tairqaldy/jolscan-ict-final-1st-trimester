"use client";

import { Bar, BarChart, CartesianGrid, Label, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoBadge } from "@/components/app/demo-badge";
import { RESTROOM_EXPERIMENTS, RESTROOM_IS_DEMO } from "@/lib/mock/restroom-experiments";
import { axisProps, ChartCard, DataTable, gridProps, LegendSwatch, tooltipProps } from "./chart-kit";

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
          <LegendSwatch color="var(--chart-1)" label="Validation (10 queries)" />
          <LegendSwatch color="var(--chart-2)" label="Test (30 queries)" />
          <LegendSwatch color="var(--muted)" dashed label="IOAI reference" />
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
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 16, left: -8 }} barGap={2}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="run" {...axisProps}>
            <Label value="Run" position="insideBottom" offset={-10} fill="var(--muted)" fontSize={12} />
          </XAxis>
          <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} width={44} {...axisProps}>
            <Label value="Top-1 accuracy" angle={-90} position="insideLeft" offset={14} fill="var(--muted)" fontSize={12} style={{ textAnchor: "middle" }} />
          </YAxis>
          <Tooltip {...tooltipProps} formatter={(v) => (typeof v === "number" ? v.toFixed(2) : "not run yet")} />
          <ReferenceLine y={reference.ioaiBaseline} stroke="var(--muted)" strokeDasharray="5 4">
            <Label value={`IOAI baseline ${reference.ioaiBaseline.toFixed(2)}`} position="insideTopLeft" fill="var(--muted)" fontSize={11} />
          </ReferenceLine>
          <ReferenceLine y={reference.ioaiBest} stroke="var(--muted)" strokeDasharray="5 4">
            <Label value={`IOAI best ${reference.ioaiBest.toFixed(2)}`} position="insideTopLeft" fill="var(--muted)" fontSize={11} />
          </ReferenceLine>
          <Bar dataKey="val" name="Validation" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="test" name="Test" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
