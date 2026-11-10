"use client";

import { ArrowRight, CircleCheck, MapPin, ScanSearch } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SeverityBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { MODULES } from "@/lib/brand";
import { formatDate, formatDateTime, median } from "@/lib/format";
import { MOCK_ANCHOR } from "@/lib/mock/analyses";
import { SEVERITY_META } from "@/lib/severity";
import { useAnalyses } from "@/lib/store/history";
import { rulesStore } from "@/lib/store/settings";
import { SEVERITIES } from "@/lib/types";
import { AnalysesTable } from "./analyses-table";
import { DemoBadge } from "./demo-badge";
import { Kpi } from "./kpi";
import { SeverityBars } from "./severity-bars";

export function DashboardClient() {
  const analyses = useAnalyses();
  const rules = rulesStore.useStore();

  const kpis = useMemo(() => {
    const potholes = analyses.reduce(
      (sum, a) => sum + a.detections.filter((d) => !rules.r1.enabled || d.confidence >= rules.r1.threshold).length,
      0,
    );
    return {
      photos: analyses.length,
      potholes,
      critical: analyses.filter((a) => a.severity === "critical").length,
      latency: median(analyses.map((a) => a.latencyMs)),
    };
  }, [analyses, rules]);

  const review = analyses.filter((a) => a.needsReview);

  const hotspots = useMemo(() => {
    const groups = new Map<string, { label: string; count: number; worst: (typeof analyses)[number] }>();
    for (const a of analyses) {
      if (!a.location || a.severity === "clear") continue;
      const g = groups.get(a.location.label);
      if (!g) groups.set(a.location.label, { label: a.location.label, count: 1, worst: a });
      else {
        g.count++;
        if (SEVERITY_META[a.severity].rank > SEVERITY_META[g.worst.severity].rank || (a.severity === g.worst.severity && a.score > g.worst.score)) g.worst = a;
      }
    }
    return [...groups.values()]
      .sort((x, y) => SEVERITY_META[y.worst.severity].rank - SEVERITY_META[x.worst.severity].rank || y.count - x.count)
      .slice(0, 5);
  }, [analyses]);

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={`${MODULES.roads.name} · ${MODULES.roads.task}`}
        title="Road condition overview"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Photos analysed in the 30 days to {formatDate(MOCK_ANCHOR)} (demo set) and in this browser. <DemoBadge />
          </span>
        }
        actions={
          <ButtonLink href="/app/roads/analyze">
            <ScanSearch aria-hidden /> Analyze a photo
          </ButtonLink>
        }
      />

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StaggerItem>
          <Kpi label="Photos analysed" value={kpis.photos} note="all providers" />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Potholes found" value={kpis.potholes} note={`confidence ≥ ${rules.r1.threshold.toFixed(2)}`} />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Critical segments" value={kpis.critical} note="repair within 24 h" accentClass="bg-sev-critical" />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Median latency" value={kpis.latency} suffix=" ms" note="model time per photo" />
        </StaggerItem>
      </Stagger>

      <Stagger inView className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <StaggerItem>
          <Card className="h-full">
            <CardHeader>
              <div>
                <CardTitle>Severity distribution</CardTitle>
                <CardDescription>How urgent the analysed segments are.</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              <SeverityBars counts={SEVERITIES.map((s) => ({ severity: s, count: analyses.filter((a) => a.severity === s).length }))} />
            </CardBody>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="h-full">
            <CardHeader>
              <div>
                <CardTitle>Recent analyses</CardTitle>
                <CardDescription>Newest first. Open a row for the full report.</CardDescription>
              </div>
              <ButtonLink href="/app/roads/reports" variant="ghost" size="sm">
                All reports <ArrowRight aria-hidden />
              </ButtonLink>
            </CardHeader>
            <CardBody className="px-0 pb-2">
              <AnalysesTable analyses={analyses.slice(0, 6)} caption="Recent analyses" />
            </CardBody>
          </Card>
        </StaggerItem>
      </Stagger>

      <Stagger inView className="grid gap-4 lg:grid-cols-2">
        <StaggerItem>
          <Card className="h-full">
            <CardHeader>
              <div>
                <CardTitle>Review queue</CardTitle>
                <CardDescription>Photos with detections below the confidence threshold. A person should look at them.</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              {review.length === 0 ? (
                <EmptyState icon={CircleCheck} title="Nothing to review" />
              ) : (
                <ul className="grid gap-2">
                  {review.slice(0, 6).map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/app/roads/reports/${a.id}`}
                        className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5 hover:bg-surface-2"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{a.location?.label ?? a.photo.fileName ?? "Uploaded photo"}</span>
                          <span className="tabular text-xs text-muted">
                            {formatDateTime(a.createdAt)} · lowest confidence{" "}
                            {Math.round(Math.min(...a.detections.map((d) => d.confidence)) * 100)}%
                          </span>
                        </span>
                        <SeverityBadge severity={a.severity} />
                      </Link>
                    </li>
                  ))}
                  {review.length > 6 && (
                    <li className="text-sm text-muted">
                      and {review.length - 6} more in{" "}
                      <Link href="/app/roads/reports?review=1" className="text-accent-ink underline underline-offset-2">
                        Reports
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </CardBody>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="h-full">
            <CardHeader>
              <div>
                <CardTitle>Hotspots</CardTitle>
                <CardDescription>Streets with the worst and most frequent findings.</CardDescription>
              </div>
              <ButtonLink href="/app/roads/map" variant="ghost" size="sm">
                Map <ArrowRight aria-hidden />
              </ButtonLink>
            </CardHeader>
            <CardBody>
              <ol className="grid gap-2">
                {hotspots.map((h, i) => (
                  <li key={h.label} className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
                    <span className="tabular w-5 font-display text-lg font-bold text-subtle">{i + 1}</span>
                    <MapPin className="size-4 shrink-0 text-muted" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{h.label}</span>
                      <span className="text-xs text-muted">
                        {h.count} {h.count === 1 ? "finding" : "findings"}
                      </span>
                    </span>
                    <SeverityBadge severity={h.worst.severity} />
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
