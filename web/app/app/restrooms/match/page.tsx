import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoBadge } from "@/components/app/demo-badge";
import { MatchClient } from "@/components/restrooms/match-client";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { MODULES } from "@/lib/brand";

export const metadata: Metadata = { title: "Find the counterpart" };

export default function MatchPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={`${MODULES.restrooms.name} · Match`}
        title="Find the other door"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Give one sign; the model ranks the gallery and picks the most similar sign of the opposite gender.{" "}
            <DemoBadge module="restrooms" label="Mock predictions" />
          </span>
        }
      />
      {/* Suspense: the client reads ?q= from the URL. */}
      <Suspense fallback={<Skeleton className="h-96" />}>
        <MatchClient />
      </Suspense>
    </div>
  );
}
