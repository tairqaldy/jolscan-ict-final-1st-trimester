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
        title="Road reports"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Filter by severity, provider, date and review status. <DemoBadge show label="Includes demo data" />
          </span>
        }
      />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <ReportsClient />
      </Suspense>
    </div>
  );
}
