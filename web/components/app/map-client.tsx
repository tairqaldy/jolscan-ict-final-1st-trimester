"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { SeverityBadge, SeverityDot } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { SEVERITY_META } from "@/lib/severity";
import { useAnalyses } from "@/lib/store/history";
import { SEVERITIES } from "@/lib/types";

// Leaflet touches `window`, so it is loaded in the browser only.
const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

export function MapClient() {
  const analyses = useAnalyses();
  // Clear analyses have nothing to repair, so they are neither listed nor drawn:
  // the count in the heading equals the number of markers (G-27).
  const located = analyses.filter((a) => a.location && a.severity !== "clear");

  return (
    <div className="grid gap-4">
      <div className="h-[55vh] min-h-80 overflow-hidden rounded-lg border border-border bg-surface-2 shadow-sm">
        <MapView analyses={located} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted" aria-label="Legend">
        {SEVERITIES.filter((s) => s !== "clear").map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <SeverityDot severity={s} className="rounded-full" /> {SEVERITY_META[s].label}
          </span>
        ))}
        <span>· bigger circle = more severe</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Findings on the map ({located.length})</CardTitle>
        </CardHeader>
        <CardBody>
          <ul className="grid gap-2 sm:grid-cols-2">
            {located.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/app/roads/reports/${a.id}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 hover:bg-surface-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{a.location!.label}</span>
                    <span className="tabular text-xs text-muted">{formatDateTime(a.createdAt)}</span>
                  </span>
                  <SeverityBadge severity={a.severity} />
                </Link>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
