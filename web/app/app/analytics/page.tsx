import type { Metadata } from "next";
import { AnalyticsClient } from "@/components/app/analytics-client";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Analytics"
        title="Monitoring"
        description="What to watch after deployment: volume, severity, confidence drift, latency, and how the trained models compare."
      />
      <AnalyticsClient />
    </div>
  );
}
