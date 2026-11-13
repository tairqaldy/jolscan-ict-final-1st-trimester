"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReviewBadge, SeverityBadge } from "@/components/ui/badge";
import { RowThumb } from "@/components/ui/row-thumb";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDateTime, formatScore } from "@/lib/format";
import type { AnalysisWithSource } from "@/lib/store/history";
import { getSample } from "@/lib/mock/samples";
import { isSeededDemo } from "@/lib/mock/seeded";
import { DemoBadge } from "./demo-badge";
import { PROVIDER_META } from "./provider-badge";

/** What the row's picture shows: the sample drawing's title, or the uploaded file's name. */
export function photoAlt(a: AnalysisWithSource): string {
  const sample = getSample(a.photo.sampleId);
  if (sample) return `Sample drawing: ${sample.title}`;
  return a.photo.fileName ? `Uploaded photo: ${a.photo.fileName}` : "Uploaded road photo";
}

/**
 * Analyses as a table. The location cell starts with the photo (64 x 36,
 * G-68) and holds the link; the whole row is clickable too.
 */
export function AnalysesTable({ analyses, caption }: { analyses: AnalysisWithSource[]; caption: string }) {
  const router = useRouter();
  return (
    <Table caption={caption}>
      <THead>
        <tr>
          <TH>When</TH>
          <TH>Location</TH>
          {/* On a phone the row keeps when, where and the severity (under the place); the rest is on the report. */}
          <TH className="hidden sm:table-cell">Severity</TH>
          <TH className="hidden text-right sm:table-cell">Score</TH>
          <TH className="hidden text-right sm:table-cell">Boxes</TH>
          <TH className="hidden sm:table-cell">Provider</TH>
        </tr>
      </THead>
      <tbody>
        {analyses.map((a) => (
          <TR
            key={a.id}
            className="cursor-pointer transition-colors duration-[var(--duration-fast)] ease-standard hover:bg-surface-2"
            onClick={() => router.push(`/app/roads/reports/${a.id}`)}
          >
            <TD className="tabular whitespace-nowrap text-muted">{formatDateTime(a.createdAt)}</TD>
            <TD className="max-sm:pr-5 sm:min-w-60">
              <div className="flex items-center gap-3">
                <RowThumb src={a.photo.imageUrl} alt={photoAlt(a)} />
                <div className="min-w-0">
                  <Link
                    href={`/app/roads/reports/${a.id}`}
                    className="font-medium link-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {a.location?.label ?? a.photo.fileName ?? "Road photo"}
                  </Link>
                  {a.needsReview && <ReviewBadge className="ml-2">review</ReviewBadge>}
                  {a.source === "device" && <span className="ml-2 text-xs text-subtle">this device</span>}
                  <div className="mt-1 sm:hidden">
                    <SeverityBadge severity={a.severity} />
                  </div>
                </div>
              </div>
            </TD>
            <TD className="hidden sm:table-cell">
              <SeverityBadge severity={a.severity} />
            </TD>
            <TD className="tabular hidden text-right font-mono sm:table-cell">{formatScore(a.score)}</TD>
            <TD className="tabular hidden text-right font-mono sm:table-cell">{a.detections.length}</TD>
            <TD className="hidden whitespace-nowrap text-muted sm:table-cell">
              {/* A seeded row has no provider: the demo badge marks it, so "Demo" never reads as a fourth provider. */}
              {isSeededDemo(a.id) ? <DemoBadge show label="Demo" /> : PROVIDER_META[a.provider].label}
            </TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
