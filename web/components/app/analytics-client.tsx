"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { axisLabelProps, axisProps, ChartCard, DataTable, gridProps, LegendSwatch, tooltipProps } from "@/components/charts/chart-kit";
import { ModelComparisonChart } from "@/components/charts/model-comparison";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { dayKey, formatDate, formatDayKey, median, percentile } from "@/lib/format";
import { MOCK_ANCHOR } from "@/lib/mock/analyses";
import { SEVERITY_META } from "@/lib/severity";
import { useAnalyses } from "@/lib/store/history";
import { rulesStore } from "@/lib/store/settings";
import { PROVIDERS, SEVERITIES } from "@/lib/types";
import { DemoBadge } from "./demo-badge";
import { PROVIDER_META } from "./provider-badge";

const DAY = 24 * 60 * 60 * 1000;

/** Roads (pothole) charts. */
export function RoadsAnalytics() {
  const analyses = useAnalyses();
  const rules = rulesStore.useStore();
  const tau = rules.r1.threshold;

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
    const bins = Array.from({ length: 15 }, (_, i) => {
      const lo = 0.25 + i * 0.05;
      return { lo, label: lo.toFixed(2), count: 0 };
    });
    for (const a of analyses)
      for (const d of a.detections) {
        const i = Math.min(14, Math.floor((d.confidence - 0.25) / 0.05 + 1e-9));
        if (i >= 0) bins[i].count++;
      }
    return bins;
  }, [analyses]);

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
              <LegendSwatch color="var(--chart-1)" label="Counted" />
              <LegendSwatch color="var(--chart-2)" label="Needs review" />
            </>
          }
          table={<DataTable head={["Day", "Photos", "Counted", "Review"]} rows={daily.map((d) => [d.label, d.photos, d.counted, d.review])} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" interval="preserveStartEnd" minTickGap={24} {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps}>
                <Label value="Boxes" angle={-90} position="insideLeft" offset={20} {...axisLabelProps} />
              </YAxis>
              <Tooltip {...tooltipProps} />
              <Bar dataKey="counted" name="Counted" stackId="a" fill="var(--chart-1)" stroke="var(--surface)" strokeWidth={1} />
              <Bar dataKey="review" name="Needs review" stackId="a" fill="var(--chart-2)" stroke="var(--surface)" strokeWidth={1} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerItem>

      <StaggerItem>
        <ChartCard
          title="Severity breakdown"
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
            <BarChart data={severityByWeek} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis allowDecimals={false} {...axisProps}>
                <Label value="Photos" angle={-90} position="insideLeft" offset={20} {...axisLabelProps} />
              </YAxis>
              <Tooltip {...tooltipProps} />
              {SEVERITIES.map((s, i) => (
                <Bar
                  key={s}
                  dataKey={s}
                  name={SEVERITY_META[s].label}
                  stackId="sev"
                  fill={SEVERITY_META[s].cssVar}
                  stroke="var(--surface)"
                  strokeWidth={2}
                  radius={i === SEVERITIES.length - 1 ? [4, 4, 0, 0] : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerItem>

      <StaggerItem>
        <ChartCard
          title="Confidence histogram"
          description="All boxes by model confidence. The line is the R1 threshold; boxes to its left are not counted."
          legend={
            <>
              <LegendSwatch color="var(--chart-1)" label={`≥ ${tau.toFixed(2)} counted`} />
              <LegendSwatch color="var(--chart-2)" label="below threshold" />
            </>
          }
          table={<DataTable head={["From", "Boxes"]} rows={histogram.map((b) => [b.label, b.count])} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogram} margin={{ top: 8, right: 8, bottom: 14, left: -16 }} barCategoryGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" interval={2} {...axisProps}>
                <Label value="Model confidence" position="insideBottom" offset={-10} {...axisLabelProps} />
              </XAxis>
              <YAxis allowDecimals={false} {...axisProps}>
                <Label value="Boxes" angle={-90} position="insideLeft" offset={20} {...axisLabelProps} />
              </YAxis>
              <Tooltip {...tooltipProps} labelFormatter={(l) => `Confidence ${l}–${(Number(l) + 0.05).toFixed(2)}`} />
              <ReferenceLine x={histogram.find((b) => b.lo >= tau - 1e-9)?.label} stroke="var(--fg)" strokeDasharray="4 3" />
              <Bar dataKey="count" name="Boxes" radius={[4, 4, 0, 0]}>
                {histogram.map((b) => (
                  <Cell key={b.label} fill={b.lo + 1e-9 >= tau ? "var(--chart-1)" : "var(--chart-2)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerItem>

      <StaggerItem>
        <ChartCard
          title="Latency by provider"
          description="Model time per photo. Cloud adds network time on the hosted side."
          legend={
            <>
              <LegendSwatch color="var(--chart-1)" label="Median" />
              <LegendSwatch color="var(--chart-2)" label="95th percentile" />
            </>
          }
          table={<DataTable head={["Provider", "Photos", "Median ms", "p95 ms"]} rows={latency.map((l) => [l.provider, l.n, l.median, l.p95])} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={latency} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="provider" {...axisProps} />
              <YAxis unit=" ms" width={60} {...axisProps} />
              <Tooltip {...tooltipProps} formatter={(v) => `${v} ms`} />
              <Bar dataKey="median" name="Median" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="p95" name="95th percentile" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
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
