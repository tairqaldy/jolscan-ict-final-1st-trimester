import type { Metadata } from "next";
import { Suspense } from "react";
import { MockProviderBadge } from "@/components/app/mock-provider-badge";
import { CompareClient } from "@/components/restrooms/compare-client";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { MODULES } from "@/lib/brand";

export const metadata: Metadata = { title: "Compare two signs" };

export default function ComparePage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={`${MODULES.restrooms.name} · Compare`}
        title="Compare two door signs"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            The model reads the gender on each sign and how alike the two designs are. The rules decide whether a visitor
            can tell the doors apart. <MockProviderBadge />
          </span>
        }
      />
      {/* Suspense: the client reads ?a= and ?b= from the URL. */}
      <Suspense fallback={<Skeleton className="h-96" />}>
        <CompareClient />
      </Suspense>
    </div>
  );
}
