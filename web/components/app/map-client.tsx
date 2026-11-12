"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { SeverityBadge, SeverityDot } from "@/components/ui/badge";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const located = analyses.filter((a) => a.location && a.severity !== "clear");
  const cleared = analyses.filter((a) => a.location && a.severity === "clear").length;
  // Uploaded photos carry no location (the app never reads one), so only the sample reports have a place.
  const unplaced = analyses.filter((a) => !a.location).length;

  return (
    <div className="grid gap-4">
      {/* isolate keeps Leaflet's pane z-indexes (200 to 1000) inside the map, so it cannot paint over the phone's top and tab bars. */}
      <div className="isolate h-[55vh] min-h-80 overflow-hidden rounded-lg border border-border bg-surface-2 shadow-sm">
        <MapView analyses={analyses} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted" aria-label="Legend">
        {SEVERITIES.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <SeverityDot severity={s} className="rounded-full" /> {SEVERITY_META[s].label}
          </span>
        ))}
        <span>Bigger circle = more severe</span>
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Findings on the map ({located.length})</CardTitle>
            {(cleared > 0 || unplaced > 0) && (
              <CardDescription>
                {cleared > 0 && `${cleared} clear ${cleared === 1 ? "road is" : "roads are"} on the map but not listed. `}
                {unplaced > 0 &&
                  `${unplaced} ${unplaced === 1 ? "analysis has" : "analyses have"} no location (uploaded photos carry none), so ${unplaced === 1 ? "it is" : "they are"} only in Reports.`}
              </CardDescription>
            )}
          </div>
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
