"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Label, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoBadge } from "@/components/app/demo-badge";
import { axisLabelProps, axisProps, ChartCard, DataTable, gridProps, LegendSwatch, tooltipProps } from "@/components/charts/chart-kit";
import { RestroomRunsChart } from "@/components/charts/restroom-runs";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { VERDICT_META } from "@/lib/signage-ui";
import { useRestroomChecks } from "@/lib/store/restroom-history";
import { signageRulesStore } from "@/lib/store/settings";
import { VERDICTS } from "@/lib/types";

/** Equal-width bins [from, from + step), the last one closed at `to`. */
function bins(values: number[], from: number, to: number, step: number) {
  const n = Math.round((to - from) / step);
  const out = Array.from({ length: n }, (_, i) => {
    const lo = Math.round((from + i * step) * 100) / 100;
    return { lo, label: lo.toFixed(2), count: 0 };
  });
  for (const v of values) {
    const i = Math.min(n - 1, Math.floor((v - from) / step + 1e-9));
    if (i >= 0) out[i].count++;
  }
  return out;
}

/** Restroom (signage) charts: verdicts, similarity distribution, gender confidence. */
export function RestroomAnalytics() {
  const checks = useRestroomChecks();
  const rules = signageRulesStore.useStore();
  const t1 = rules.s1.minConfidence;
  const t3 = rules.s3.minSimilarity;

  const verdicts = useMemo(
    () => VERDICTS.map((v) => ({ verdict: v, label: VERDICT_META[v].label, count: checks.filter((c) => c.verdict === v).length })),
    [checks],
  );
  const clearPct = checks.length ? Math.round((verdicts[0].count / checks.length) * 100) : 0;
  const similarity = useMemo(() => bins(checks.map((c) => c.similarity), 0.3, 1.0, 0.05), [checks]);
  const confidence = useMemo(() => bins(checks.flatMap((c) => [c.a.confidence, c.b.confidence]), 0.5, 1.0, 0.05), [checks]);
  const belowS3 = checks.filter((c) => c.similarity < t3).length;
  const belowS1 = checks.flatMap((c) => [c.a.confidence, c.b.confidence]).filter((v) => v < t1).length;
  const lineAt = (b: { lo: number; label: string }[], t: number) => b.find((x) => x.lo >= t - 1e-9)?.label;

  return (
    <Stagger className="grid gap-4 lg:grid-cols-2">
      <StaggerItem>
        <ChartCard
          title={`${clearPct}% of checked sign pairs are clear`}
          description="Pairs per signage verdict, from zero. Clear: all rules pass. Review: S1 or S3 failed. Confusing: both signs read as one gender."
          badge={<DemoBadge module="restrooms" />}
          legend={VERDICTS.map((v) => (
            <LegendSwatch key={v} color={VERDICT_META[v].cssVar} label={VERDICT_META[v].label} />
          ))}
          table={<DataTable head={["Verdict", "Pairs"]} rows={verdicts.map((v) => [v.label, v.count])} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={verdicts} margin={{ top: 8, right: 8, bottom: 14, left: -16 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps}>
                <Label value="Verdict" position="insideBottom" offset={-10} {...axisLabelProps} />
              </XAxis>
              <YAxis allowDecimals={false} {...axisProps}>
                <Label value="Pairs" angle={-90} position="insideLeft" offset={20} {...axisLabelProps} />
              </YAxis>
              <Tooltip {...tooltipProps} />
              <Bar dataKey="count" name="Pairs" radius={[4, 4, 0, 0]}>
                {verdicts.map((v) => (
                  <Cell key={v.verdict} fill={VERDICT_META[v.verdict].cssVar} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerItem>

      <StaggerItem>
        <ChartCard
          title={`${belowS3} of ${checks.length} pairs fall below the S3 similarity line`}
          description={`Similarity of compared sign pairs. The dashed line is rule S3 (${t3.toFixed(2)}); pairs to its left look like two different design sets.`}
          badge={<DemoBadge module="restrooms" />}
          legend={
            <>
              <LegendSwatch color="var(--chart-1)" label={`≥ ${t3.toFixed(2)} one set`} />
              <LegendSwatch color="var(--chart-2)" label="below S3" />
            </>
          }
          table={<DataTable head={["From", "Pairs"]} rows={similarity.map((b) => [b.label, b.count])} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={similarity} margin={{ top: 8, right: 8, bottom: 14, left: -16 }} barCategoryGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" interval={1} {...axisProps}>
                <Label value="Similarity (0..1)" position="insideBottom" offset={-10} {...axisLabelProps} />
              </XAxis>
              <YAxis allowDecimals={false} {...axisProps}>
                <Label value="Pairs" angle={-90} position="insideLeft" offset={20} {...axisLabelProps} />
              </YAxis>
              <Tooltip {...tooltipProps} labelFormatter={(l) => `Similarity ${l}–${(Number(l) + 0.05).toFixed(2)}`} />
              <ReferenceLine x={lineAt(similarity, t3)} stroke="var(--fg)" strokeDasharray="4 3" />
              <Bar dataKey="count" name="Pairs" radius={[4, 4, 0, 0]}>
                {similarity.map((b) => (
                  <Cell key={b.label} fill={b.lo + 1e-9 >= t3 ? "var(--chart-1)" : "var(--chart-2)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerItem>

      <StaggerItem>
        <ChartCard
          title={`${belowS1} signs were read with less than ${Math.round(t1 * 100)}% confidence`}
          description={`Confidence of the predicted gender, every sign of every pair. The dashed line is rule S1 (${t1.toFixed(2)}); signs to its left fail it. A binary prediction is never below 0.50.`}
          badge={<DemoBadge module="restrooms" />}
          legend={
            <>
              <LegendSwatch color="var(--chart-1)" label={`≥ ${t1.toFixed(2)} recognisable`} />
              <LegendSwatch color="var(--chart-2)" label="below S1" />
            </>
          }
          table={<DataTable head={["From", "Signs"]} rows={confidence.map((b) => [b.label, b.count])} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidence} margin={{ top: 8, right: 8, bottom: 14, left: -16 }} barCategoryGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps}>
                <Label value="Gender confidence" position="insideBottom" offset={-10} {...axisLabelProps} />
              </XAxis>
              <YAxis allowDecimals={false} {...axisProps}>
                <Label value="Signs" angle={-90} position="insideLeft" offset={20} {...axisLabelProps} />
              </YAxis>
              <Tooltip {...tooltipProps} labelFormatter={(l) => `Confidence ${l}–${(Number(l) + 0.05).toFixed(2)}`} />
              <ReferenceLine x={lineAt(confidence, t1)} stroke="var(--fg)" strokeDasharray="4 3" />
              <Bar dataKey="count" name="Signs" radius={[4, 4, 0, 0]}>
                {confidence.map((b) => (
                  <Cell key={b.label} fill={b.lo + 1e-9 >= t1 ? "var(--chart-1)" : "var(--chart-2)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerItem>

      <StaggerItem>
        <RestroomRunsChart />
      </StaggerItem>
    </Stagger>
  );
}
