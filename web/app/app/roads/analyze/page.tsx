import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyzeClient } from "@/components/app/analyze-client";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Analyze a photo" };

export default function AnalyzePage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Roads · Analyze"
        title="Analyze a road photo"
        description="Upload a photo or pick a sample. The model finds potholes, then the rules turn them into a repair priority."
      />
      {/* Suspense: the client reads ?sample= from the URL. */}
      <Suspense fallback={<Skeleton className="h-96" />}>
        <AnalyzeClient />
      </Suspense>
    </div>
  );
}
