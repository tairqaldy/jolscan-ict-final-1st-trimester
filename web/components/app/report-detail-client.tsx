"use client";

import { ArrowLeft, FileQuestion } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptySearch } from "@/components/illustrations";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatScore } from "@/lib/format";
import { isSeededDemo } from "@/lib/mock/seeded";
import { useHydrated } from "@/lib/store/local-store";
import { useAnalyses } from "@/lib/store/history";
import { AnalysisView } from "./analysis-view";
import { DemoBadge } from "./demo-badge";
import { PrintButton, PrintFooter, PrintRuleTable } from "./print-bits";

export function ReportDetailClient({ id }: { id: string }) {
  const analyses = useAnalyses();
  const hydrated = useHydrated();
  const analysis = analyses.find((a) => a.id === id);

  const back = (
    <ButtonLink href="/app/roads/reports" variant="ghost" size="sm" className="-ml-3 w-fit print:hidden">
      <ArrowLeft aria-hidden /> All road reports
    </ButtonLink>
  );

  if (!analysis) {
    // Reports made in this browser only exist after localStorage is read.
    if (!hydrated) return <Skeleton className="h-96" />;
    return (
      <div className="grid gap-6">
        {back}
        <EmptyState icon={FileQuestion} illustration={<EmptySearch />} title="Report not found">
          There is no analysis with id <code className="font-mono">{id}</code> in the demo set or in this browser. It may
          have been cleared in Settings.
        </EmptyState>
      </div>
    );
  }

  const totalPoints = analysis.ruleHits.reduce((s, h) => s + h.points, 0);

  return (
    // print-sheet: the one-page paper layout in app/print.css (G-25).
    <div className="print-sheet grid gap-6">
      {back}
      <PageHeader
        actions={<PrintButton />}
        eyebrow={`Report · ${analysis.id}`}
        title={analysis.location?.label ?? analysis.photo.fileName ?? "Uploaded photo"}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Analysed {formatDateTime(analysis.createdAt)} (Astana time)
            {analysis.source === "demo" ? <DemoBadge show /> : <span className="text-subtle">· made in this browser</span>}
          </span>
        }
      />
      <AnalysisView analysis={analysis} />
      <PrintRuleTable
        title="Why this priority"
        resultLabel="Points"
        rows={analysis.ruleHits.map((h) => ({
          ruleId: h.ruleId,
          title: h.title,
          detail: h.detail,
          result: h.points > 0 ? `+${formatScore(h.points)}` : formatScore(h.points),
        }))}
        total={formatScore(Math.round(totalPoints * 100) / 100)}
        empty="No rule fired: there were no detections to score."
      />
      <PrintFooter
        demoNote={
          isSeededDemo(analysis.id)
            ? "Demo data: an invented record, not a real measurement."
            : analysis.provider === "mock"
              ? "Mock result: made by the mock provider, not the real model."
              : undefined
        }
      />
    </div>
  );
}
