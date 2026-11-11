"use client";

import { ArrowLeft, FileQuestion } from "lucide-react";
import { DemoBadge } from "@/components/app/demo-badge";
import { PrintButton, PrintFooter, PrintRuleTable } from "@/components/app/print-bits";
import { ButtonLink } from "@/components/ui/button";
import { EmptySearch } from "@/components/illustrations";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { isSeededDemo } from "@/lib/mock/seeded";
import { useHydrated } from "@/lib/store/local-store";
import { useRestroomChecks } from "@/lib/store/restroom-history";
import { checkLabel } from "./checks-table";
import { CompareResultView } from "./compare-result";

export function CheckDetailClient({ id }: { id: string }) {
  const checks = useRestroomChecks();
  const hydrated = useHydrated();
  const check = checks.find((c) => c.id === id);

  const back = (
    <ButtonLink href="/app/restrooms" variant="ghost" size="sm" className="-ml-3 w-fit print:hidden">
      <ArrowLeft aria-hidden /> Restroom overview
    </ButtonLink>
  );

  if (!check) {
    // Checks made in this browser only exist after localStorage is read.
    if (!hydrated) return <Skeleton className="h-96" />;
    return (
      <div className="grid gap-6">
        {back}
        <EmptyState icon={FileQuestion} illustration={<EmptySearch />} title="Comparison not found">
          There is no check with id <code className="font-mono">{id}</code> in the demo set or in this browser. It may have
          been cleared in Settings.
        </EmptyState>
      </div>
    );
  }

  return (
    // print-sheet: the one-page paper layout in app/print.css (G-25).
    <div className="print-sheet grid gap-6">
      {back}
      <PageHeader
        actions={<PrintButton />}
        eyebrow={`Sign check · ${check.id}`}
        title={checkLabel(check)}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Checked {formatDateTime(check.createdAt)} (Astana time)
            {check.source === "demo" ? <DemoBadge module="restrooms" show /> : <span className="text-subtle">· made in this browser</span>}
          </span>
        }
      />
      <CompareResultView check={check} />
      <PrintRuleTable
        title="Why this verdict"
        resultLabel="Result"
        rows={check.ruleHits.map((h) => ({
          ruleId: h.ruleId,
          title: h.title,
          detail: h.detail,
          result: h.passed ? "Passed" : "Failed",
        }))}
        empty="No rule results stored for this check."
        note="Clear when all three pass. Review when S2 passes but S1 or S3 fails. Confusing when S2 fails, whatever the others say."
      />
      <PrintFooter
        demoNote={
          isSeededDemo(check.id)
            ? "Demo data: an invented record, not a real measurement."
            : check.provider === "mock"
              ? "Mock result: made by the mock provider, not the real model."
              : undefined
        }
      />
    </div>
  );
}
