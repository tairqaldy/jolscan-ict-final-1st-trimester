import type { Metadata } from "next";
import { IoaiTaskClient } from "@/components/restrooms/ioai-task-client";
import { PageHeader } from "@/components/ui/page-header";
import { MODULES } from "@/lib/brand";

export const metadata: Metadata = { title: "IOAI task" };

export default function IoaiTaskPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={`${MODULES.restrooms.name} · IOAI task`}
        title="The IOAI task we started from"
        description="Restroom Icon Matching from the IOAI 2025 individual contest: what it asks, the data that came with it, and the baseline pipeline given with the task."
      />
      <IoaiTaskClient />
    </div>
  );
}
