import type { Metadata } from "next";
import { DemoBadge } from "@/components/app/demo-badge";
import { MapClient } from "@/components/app/map-client";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Map" };

export default function MapPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Roads · Map"
        title="Where the potholes are"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Analyzed photos around Astana, coloured by severity. Demo locations are invented. <DemoBadge show label="Includes demo data" />
          </span>
        }
      />
      <MapClient />
    </div>
  );
}
