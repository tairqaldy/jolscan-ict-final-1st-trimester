"use client";

import { useMemo } from "react";
import { Bar, BarChart, BarStack, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
import { ModelComparisonChart } from "@/components/charts/model-comparison";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { splitBins } from "@/lib/charts/thresholds";
import { dayKey, formatDate, formatDayKey, median, percentile } from "@/lib/format";
import { MOCK_ANCHOR } from "@/lib/mock/analyses";
import { DEFAULT_RULES } from "@/lib/rules/config";
import { SEVERITY_META } from "@/lib/severity";
import { useAnalyses } from "@/lib/store/history";
import { rulesStore } from "@/lib/store/settings";
import { PROVIDERS, SEVERITIES } from "@/lib/types";
import { DemoBadge } from "./demo-badge";
import { PROVIDER_META } from "./provider-badge";

const DAY = 24 * 60 * 60 * 1000;

/** Confidence histogram: bins of 0.05 from 0.25 (or from a lower review floor) up to 1. */
const HIST_FROM = 0.25;
const HIST_STEP = 0.05;

/** Roads (pothole) charts. */
export function RoadsAnalytics() {
  const analyses = useAnalyses();
  const rules = rulesStore.useStore();
  const tau = rules.r1.threshold;
  const floor = rules.r1.reviewFloor;

  // 30 days ending on the demo anchor date (10 Nov 2026), or on the newest
  // analysis if this browser has newer ones. Deterministic: no Date.now().
  const windowEnd = useMemo(
    () => Math.max(Date.parse(MOCK_ANCHOR), analyses.length ? Date.parse(analyses[0].createdAt) : 0),
    [analyses],
  );
  const daily = useMemo(() => {
    const last = windowEnd;
    const days = Array.from({ length: 30 }, (_, i) => dayKey(new Date(last - (29 - i) * DAY).toISOString()));
    const rows = days.map((d) => ({ day: d, label: formatDayKey(d), counted: 0, review: 0, photos: 0 }));
    const index = new Map(rows.map((r) => [r.day, r]));
    for (const a of analyses) {
      const row = index.get(dayKey(a.createdAt));
      if (!row) continue;
      row.photos++;
      for (const d of a.detections) {
        if (d.confidence >= tau) row.counted++;
        else if (d.confidence >= rules.r1.reviewFloor) row.review++;
      }
    }
    return rows;
  }, [analyses, tau, rules.r1.reviewFloor, windowEnd]);

  const severityByWeek = useMemo(() => {
    const weeks = [0, 1, 2, 3].map((w) => ({
      label: w === 0 ? "This week" : `${w} wk ago`,
      ...Object.fromEntries(SEVERITIES.map((s) => [s, 0])),
    })) as ({ label: string } & Record<(typeof SEVERITIES)[number], number>)[];
    for (const a of analyses) {
      const w = Math.floor((windowEnd - Date.parse(a.createdAt)) / (7 * DAY));
      if (w >= 0 && w < 4) weeks[w][a.severity]++;
    }
    return weeks.reverse();
  }, [analyses, windowEnd]);

  const histogram = useMemo(() => {
    // Start lower when the review floor is set below 0.25, so its line stays on the chart.
    const from = Math.min(HIST_FROM, Math.floor(floor / HIST_STEP + 1e-9) * HIST_STEP);
    const values = analyses.flatMap((a) => a.detections.map((d) => d.confidence));
    return splitBins(values, from, 1, HIST_STEP, tau);
  }, [analyses, floor, tau]);

  const latency = useMemo(
    () =>
      PROVIDERS.map((p) => {
        const values = analyses.filter((a) => a.provider === p).map((a) => a.latencyMs);
        return { provider: PROVIDER_META[p].label, median: median(values), p95: percentile(values, 95), n: values.length };
      }),
    [analyses],
  );

  return (
    <Stagger inView className="grid gap-4 lg:grid-cols-2">
      <StaggerItem className="lg:col-span-2">
        <ChartCard
          title="Detections over time"
          description={`Pothole boxes per day, 30 days to ${formatDate(new Date(windowEnd).toISOString())}. Counted means confidence ≥ ${tau.toFixed(2)} (rule R1).`}
          badge={<DemoBadge show label="Includes demo data" />}
          legend={
            <>
              <LegendSwatch color={SERIES[0]} label="Counted" />
              <LegendSwatch color={SERIES[1]} label="Needs review" />
            </>
          }
          table={<DataTable head={["Day", "Photos", "Counted", "Review"]} rows={daily.map((d) => [d.label, d.photos, d.counted, d.review])} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily} margin={chartMargin()}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" interval={0} {...axisProps} />
              <YAxis allowDecimals={false} width={yAxisWidth(3)} {...axisProps}>
                {yAxisTitle("Boxes")}
              </YAxis>
              <Tooltip {...tooltipProps} />
              <BarStack radius={barRadius}>
                <Bar dataKey="counted" name="Counted" fill={SERIES[0]} {...stackSeparatorProps} />
                <Bar dataKey="review" name="Needs review" fill={SERIES[1]} {...stackSeparatorProps} />
              </BarStack>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerItem>

      <StaggerItem>
        <ChartCard
          title="Severity breakdown"
          badge={<DemoBadge show label="Includes demo data" />}
          description={`Analyses per week, stacked by severity. Weeks end on ${formatDate(new Date(windowEnd).toISOString())}.`}
          legend={SEVERITIES.map((s) => (
            <LegendSwatch key={s} color={SEVERITY_META[s].cssVar} label={SEVERITY_META[s].label} />
          ))}
          table={
            <DataTable
              head={["Week", ...SEVERITIES.map((s) => SEVERITY_META[s].label)]}
              rows={severityByWeek.map((w) => [w.label, ...SEVERITIES.map((s) => w[s])])}
            />
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityByWeek} margin={chartMargin()}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis allowDecimals={false} width={yAxisWidth(3)} {...axisProps}>
                {yAxisTitle("Photos")}
              </YAxis>
              <Tooltip {...tooltipProps} />
              <BarStack radius={barRadius}>
                {SEVERITIES.map((s) => (
                  <Bar key={s} dataKey={s} name={SEVERITY_META[s].label} fill={SEVERITY_META[s].cssVar} {...stackSeparatorProps} />
                ))}
              </BarStack>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerItem>

      <StaggerItem>
        <ChartCard
          title="Confidence histogram"
          badge={<DemoBadge show label="Includes demo data" />}
          description={`All boxes by model confidence. The lines are rule R1 at ${tau.toFixed(2)} and its review floor at ${floor.toFixed(2)}: boxes at or above R1 are counted, boxes between the lines go to review, boxes below the floor are ignored.`}
          legend={
            <>
              <LegendSwatch color={SERIES[0]} label={`≥ ${tau.toFixed(2)} counted`} />
              <LegendSwatch color={SERIES[1]} label="below R1, not counted" />
            </>
          }
          table={<DataTable head={["From", "Boxes"]} rows={histogram.map((b) => [b.label, b.count])} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogram} margin={chartMargin({ xTitle: true, labelRows: 2 })} barCategoryGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" interval={2} {...axisProps} tick={<BinEdgeTick />}>
                {xAxisTitle("Model confidence")}
              </XAxis>
              <YAxis allowDecimals={false} width={yAxisWidth(3)} {...axisProps}>
                {yAxisTitle("Boxes")}
              </YAxis>
              <Tooltip {...tooltipProps} labelFormatter={(l) => `Confidence ${l}–${(Number(l) + HIST_STEP).toFixed(2)}`} />
              <BarStack radius={barRadius}>
                <Bar dataKey="below" name="Not counted" fill={SERIES[1]} {...stackSeparatorProps} />
                <Bar dataKey="atOrAbove" name="Counted" fill={SERIES[0]} {...stackSeparatorProps} />
              </BarStack>
              <ThresholdMarker bins={histogram} value={tau} rule="R1" defaultValue={DEFAULT_RULES.r1.threshold} />
              <ThresholdMarker bins={histogram} value={floor} rule="R1 floor" defaultValue={DEFAULT_RULES.r1.reviewFloor} row={1} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerItem>

      <StaggerItem>
        <ChartCard
          title="Latency by provider"
          badge={<DemoBadge show label="Includes demo data" />}
          description="Model time per photo, from the demo set and the analyses made in this browser. Cloud adds the trip to the hosted service."
          legend={
            <>
              <LegendSwatch color={SERIES[0]} label="Median" />
              <LegendSwatch color={SERIES[1]} label="95th percentile" />
            </>
          }
          table={<DataTable head={["Provider", "Photos", "Median ms", "p95 ms"]} rows={latency.map((l) => [l.provider, l.n, l.median, l.p95])} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={latency} margin={chartMargin()} barGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="provider" {...axisProps} />
              <YAxis width={yAxisWidth(4)} {...axisProps}>
                {yAxisTitle("Model time (ms)")}
              </YAxis>
              <Tooltip {...tooltipProps} formatter={(v) => `${v} ms`} />
              <Bar dataKey="median" name="Median" fill={SERIES[0]} radius={barRadius} />
              <Bar dataKey="p95" name="95th percentile" fill={SERIES[1]} radius={barRadius} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerItem>

      <StaggerItem>
        <ModelComparisonChart />
      </StaggerItem>
    </Stagger>
  );
}
