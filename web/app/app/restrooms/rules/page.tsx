import type { Metadata } from "next";
import { RestroomRulesClient } from "@/components/restrooms/restroom-rules-client";
import { PageHeader } from "@/components/ui/page-header";
import { MODULES } from "@/lib/brand";

export const metadata: Metadata = { title: "Signage rules" };

export default function RestroomRulesPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={`${MODULES.restrooms.name} · Rules`}
        title="Signage rules you can read"
        description="The model reads each sign. These three rules decide whether a pair of signs is clear. Thresholds are team-defined starting values, not a building-code requirement."
      />
      <RestroomRulesClient />
    </div>
  );
}
