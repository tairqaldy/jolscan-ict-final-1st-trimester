import type { Metadata } from "next";
import { IoaiPairsClient } from "@/components/restrooms/ioai-pairs-client";
import { PageHeader } from "@/components/ui/page-header";
import { MODULES } from "@/lib/brand";

export const metadata: Metadata = { title: "IOAI pairs" };

export default function IoaiPairsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={`${MODULES.restrooms.name} · IOAI pairs`}
        title="Find the pair on the IOAI data"
        description="Pick a door sign from the IOAI 2025 validation or test set and see how our two-step pipeline finds the sign of the other gender from the same restroom, step by step, next to the zero-shot CLIP baseline."
      />
      <IoaiPairsClient />
    </div>
  );
}
