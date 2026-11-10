import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoBadge } from "@/components/app/demo-badge";
import { ReportsClient } from "@/components/app/reports-client";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Roads · Reports"
        title="All road analyses"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Filter by severity, provider, date and review status. <DemoBadge />
          </span>
        }
      />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <ReportsClient />
      </Suspense>
    </div>
  );
}
