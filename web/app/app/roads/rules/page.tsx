import type { Metadata } from "next";
import { RulesClient } from "@/components/app/rules-client";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Rules" };

export default function RulesPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Roads · Rules"
        title="Repair rules you can read"
        description="The model only finds potholes. These six rules decide how urgent a road segment is. Thresholds are team-defined starting values, not an official standard."
      />
      <RulesClient />
    </div>
  );
}
