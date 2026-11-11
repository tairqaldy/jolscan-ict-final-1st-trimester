"use client";

import { useMemo } from "react";
import { Bar, BarChart, BarStack, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoBadge } from "@/components/app/demo-badge";
import {
  axisProps,
  barRadius,
  BinEdgeTick,
  ChartCard,
  chartMargin,
  DataTable,
  gridProps,
  LegendSwatch,
  SERIES,
  stackSeparatorProps,
  ThresholdMarker,
  tooltipProps,
  xAxisTitle,
  yAxisTitle,
  yAxisWidth,
} from "@/components/charts/chart-kit";
import { RestroomRunsChart } from "@/components/charts/restroom-runs";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { splitBins } from "@/lib/charts/thresholds";
import { assignDoors } from "@/lib/signage";
import { DEFAULT_SIGNAGE } from "@/lib/signage/config";
import { VERDICT_META } from "@/lib/signage-ui";
import { useRestroomChecks } from "@/lib/store/restroom-history";
import { signageRulesStore } from "@/lib/store/settings";
import { VERDICTS } from "@/lib/types";

/** Restroom (signage) charts: verdicts, similarity distribution, gap in P(male) between the doors. */
export function RestroomAnalytics() {
  const checks = useRestroomChecks();
  const rules = signageRulesStore.useStore();
  const t1 = rules.s1.minMargin;
  const t2 = rules.s2.minMargin;
  const t3 = rules.s3.minSimilarity;

  const verdicts = useMemo(
    () => VERDICTS.map((v) => ({ verdict: v, label: VERDICT_META[v].label, count: checks.filter((c) => c.verdict === v).length })),
    [checks],
  );
  const clearPct = checks.length ? Math.round((verdicts[0].count / checks.length) * 100) : 0;
  const similarity = useMemo(() => splitBins(checks.map((c) => c.similarity), 0.3, 1.0, 0.05, t3), [checks, t3]);
  const confidence = useMemo(() => splitBins(checks.map((c) => assignDoors(c.a, c.b).margin), 0, 1.0, 0.05, t1), [checks, t1]);
  const belowS3 = checks.filter((c) => c.similarity < t3).length;
  const belowS1 = checks.filter((c) => assignDoors(c.a, c.b).margin < t1).length;

  return (
    <Stagger className="grid gap-4 lg:grid-cols-2">
      <StaggerItem>
        <ChartCard
          title={`${clearPct}% of checked sign pairs are clear`}
          description="Pairs per signage verdict, from zero. Clear: all rules pass. Review: S1 or S3 failed. Confusing: the two doors look almost the same to the model."
          badge={<DemoBadge show label="Includes demo data" />}
          legend={VERDICTS.map((v) => (
            <LegendSwatch key={v} color={VERDICT_META[v].cssVar} label={VERDICT_META[v].label} />
          ))}
          table={<DataTable head={["Verdict", "Pairs"]} rows={verdicts.map((v) => [v.label, v.count])} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={verdicts} margin={chartMargin({ xTitle: true })}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps}>
                {xAxisTitle("Verdict")}
              </XAxis>
              <YAxis allowDecimals={false} width={yAxisWidth(3)} {...axisProps}>
                {yAxisTitle("Pairs")}
              </YAxis>
              <Tooltip {...tooltipProps} />
              <Bar dataKey="count" name="Pairs" radius={barRadius}>
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
          description={`Similarity of compared sign pairs. The line is rule S3 at ${t3.toFixed(2)}; pairs to its left look like two different design sets.`}
          badge={<DemoBadge show label="Includes demo data" />}
          legend={
            <>
              <LegendSwatch color={SERIES[0]} label={`≥ ${t3.toFixed(2)} one set`} />
              <LegendSwatch color={SERIES[1]} label="below S3" />
            </>
          }
          table={<DataTable head={["From", "Pairs"]} rows={similarity.map((b) => [b.label, b.count])} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={similarity} margin={chartMargin({ xTitle: true, labelRows: 1 })} barCategoryGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" interval={1} {...axisProps} tick={<BinEdgeTick />}>
                {xAxisTitle("Similarity (0..1)")}
              </XAxis>
              <YAxis allowDecimals={false} width={yAxisWidth(3)} {...axisProps}>
                {yAxisTitle("Pairs")}
              </YAxis>
              <Tooltip {...tooltipProps} labelFormatter={(l) => `Similarity ${l}–${(Number(l) + 0.05).toFixed(2)}`} />
              <BarStack radius={barRadius}>
                <Bar dataKey="below" name="Below S3" fill={SERIES[1]} {...stackSeparatorProps} />
                <Bar dataKey="atOrAbove" name="One set" fill={SERIES[0]} {...stackSeparatorProps} />
              </BarStack>
              <ThresholdMarker bins={similarity} value={t3} rule="S3" defaultValue={DEFAULT_SIGNAGE.s3.minSimilarity} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerItem>

      <StaggerItem>
        <ChartCard
          title={`${belowS1} of ${checks.length} pairs had a gap below ${t1.toFixed(2)} between the doors`}
          description={`Gap in P(male) between the two doors of each pair, from zero. The lines are rule S1 at ${t1.toFixed(2)} and rule S2 at ${t2.toFixed(2)}: pairs left of S1 need a person to check which door is which, pairs left of S2 are confusing.`}
          badge={<DemoBadge show label="Includes demo data" />}
          legend={
            <>
              <LegendSwatch color={SERIES[0]} label={`≥ ${t1.toFixed(2)} clear which door is which`} />
              <LegendSwatch color={SERIES[1]} label="below S1" />
            </>
          }
          table={<DataTable head={["Gap from", "Pairs"]} rows={confidence.map((b) => [b.label, b.count])} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidence} margin={chartMargin({ xTitle: true, labelRows: 2 })} barCategoryGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} tick={<BinEdgeTick />}>
                {xAxisTitle("Gap in P(male) between the doors")}
              </XAxis>
              <YAxis allowDecimals={false} width={yAxisWidth(3)} {...axisProps}>
                {yAxisTitle("Pairs")}
              </YAxis>
              <Tooltip {...tooltipProps} labelFormatter={(l) => `Gap ${l}–${(Number(l) + 0.05).toFixed(2)}`} />
              <BarStack radius={barRadius}>
                <Bar dataKey="below" name="Below S1" fill={SERIES[1]} {...stackSeparatorProps} />
                <Bar dataKey="atOrAbove" name="Clear which door is which" fill={SERIES[0]} {...stackSeparatorProps} />
              </BarStack>
              <ThresholdMarker bins={confidence} value={t1} rule="S1" defaultValue={DEFAULT_SIGNAGE.s1.minMargin} />
              <ThresholdMarker bins={confidence} value={t2} rule="S2" defaultValue={DEFAULT_SIGNAGE.s2.minMargin} row={1} />
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
