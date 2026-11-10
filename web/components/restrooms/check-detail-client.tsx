"use client";

import { ArrowLeft, FileQuestion } from "lucide-react";
import { DemoBadge } from "@/components/app/demo-badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { useHydrated } from "@/lib/store/local-store";
import { useRestroomChecks } from "@/lib/store/restroom-history";
import { checkLabel } from "./checks-table";
import { CompareResultView } from "./compare-result";

export function CheckDetailClient({ id }: { id: string }) {
  const checks = useRestroomChecks();
  const hydrated = useHydrated();
  const check = checks.find((c) => c.id === id);

  const back = (
    <ButtonLink href="/app/restrooms" variant="ghost" size="sm" className="-ml-3 w-fit">
      <ArrowLeft aria-hidden /> Restroom overview
    </ButtonLink>
  );

  if (!check) {
    // Checks made in this browser only exist after localStorage is read.
    if (!hydrated) return <Skeleton className="h-96" />;
    return (
      <div className="grid gap-6">
        {back}
        <EmptyState icon={FileQuestion} title="Comparison not found">
          There is no check with id <code className="font-mono">{id}</code> in the demo set or in this browser. It may have
          been cleared in Settings.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {back}
      <PageHeader
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
    </div>
  );
}
