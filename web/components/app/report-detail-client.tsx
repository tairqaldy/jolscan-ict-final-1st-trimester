"use client";

import { ArrowLeft, FileQuestion } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { useHydrated } from "@/lib/store/local-store";
import { useAnalyses } from "@/lib/store/history";
import { AnalysisView } from "./analysis-view";
import { DemoBadge } from "./demo-badge";

export function ReportDetailClient({ id }: { id: string }) {
  const analyses = useAnalyses();
  const hydrated = useHydrated();
  const analysis = analyses.find((a) => a.id === id);

  const back = (
    <ButtonLink href="/app/roads/reports" variant="ghost" size="sm" className="-ml-3 w-fit">
      <ArrowLeft aria-hidden /> All road reports
    </ButtonLink>
  );

  if (!analysis) {
    // Reports made in this browser only exist after localStorage is read.
    if (!hydrated) return <Skeleton className="h-96" />;
    return (
      <div className="grid gap-6">
        {back}
        <EmptyState icon={FileQuestion} title="Report not found">
          There is no analysis with id <code className="font-mono">{id}</code> in the demo set or in this browser. It may
          have been cleared in Settings.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {back}
      <PageHeader
        eyebrow={`Report · ${analysis.id}`}
        title={analysis.location?.label ?? analysis.photo.fileName ?? "Uploaded photo"}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Analysed {formatDateTime(analysis.createdAt)} (Astana time)
            {analysis.source === "demo" ? <DemoBadge /> : <span className="text-subtle">· made in this browser</span>}
          </span>
        }
      />
      <AnalysisView analysis={analysis} />
    </div>
  );
}
