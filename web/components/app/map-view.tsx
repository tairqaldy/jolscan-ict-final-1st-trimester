"use client";

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { SeverityBadge } from "@/components/ui/badge";
import { formatDateTime, formatScore } from "@/lib/format";
import { ASTANA } from "@/lib/mock/analyses";
import { SEVERITY_META } from "@/lib/severity";
import type { AnalysisWithSource } from "@/lib/store/history";

/**
 * Leaflet map (loaded only in the browser, see map-client.tsx).
 * OpenStreetMap tiles; if they fail (offline), markers still render on a
 * blank background and a notice explains why.
 */
export default function MapView({ analyses }: { analyses: AnalysisWithSource[] }) {
  const [tileErrors, setTileErrors] = useState(0);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const located = analyses.filter((a) => a.location);

  return (
    <div className="relative h-full">
      <MapContainer center={[ASTANA.lat, ASTANA.lng]} zoom={12} scrollWheelZoom={false} className="size-full" attributionControl>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          eventHandlers={{
            tileerror: () => setTileErrors((n) => n + 1),
            tileload: () => setTilesLoaded(true),
          }}
        />
        {located.map((a) => (
          <CircleMarker
            key={a.id}
            center={[a.location!.lat, a.location!.lng]}
            radius={6 + SEVERITY_META[a.severity].rank * 2}
            // className must be a constructor option; colours come from .sev-marker--* in globals.css
            className={`sev-marker sev-marker--${a.severity}`}
          >
            <Popup>
              <div className="grid gap-1.5 text-sm">
                <strong className="font-display text-base">{a.location!.label}</strong>
                <span className="flex items-center gap-2">
                  <SeverityBadge severity={a.severity} /> score {formatScore(a.score)}
                </span>
                <span className="text-xs text-muted">{formatDateTime(a.createdAt)}</span>
                <Link href={`/app/reports/${a.id}`} className="font-medium text-accent-ink underline underline-offset-2">
                  Open report
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {tileErrors > 0 && !tilesLoaded && (
        <p role="status" className="absolute top-3 right-3 left-3 z-[500] rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-md sm:left-auto sm:max-w-sm">
          Map tiles could not load (offline?). Markers are still shown and listed below.
        </p>
      )}
    </div>
  );
}
