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
          <TH>Severity</TH>
          <TH className="text-right">Score</TH>
          <TH className="text-right">Boxes</TH>
          <TH>Provider</TH>
        </tr>
      </THead>
      <tbody>
        {analyses.map((a) => (
          <TR
            key={a.id}
            className="cursor-pointer hover:bg-surface-2"
            onClick={() => router.push(`/app/roads/reports/${a.id}`)}
          >
            <TD className="tabular whitespace-nowrap text-muted">{formatDateTime(a.createdAt)}</TD>
            <TD className="min-w-60">
              <div className="flex items-center gap-3">
                <RowThumb src={a.photo.imageUrl} alt={photoAlt(a)} />
                <div className="min-w-0">
                  <Link
                    href={`/app/roads/reports/${a.id}`}
                    className="font-medium hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {a.location?.label ?? a.photo.fileName ?? "Uploaded photo"}
                  </Link>
                  {a.needsReview && <ReviewBadge className="ml-2">review</ReviewBadge>}
                  {a.source === "device" && <span className="ml-2 text-xs text-subtle">this device</span>}
                </div>
              </div>
            </TD>
            <TD>
              <SeverityBadge severity={a.severity} />
            </TD>
            <TD className="tabular text-right font-mono">{formatScore(a.score)}</TD>
            <TD className="tabular text-right font-mono">{a.detections.length}</TD>
            <TD className="whitespace-nowrap text-muted">
              {isSeededDemo(a.id) ? "Demo" : PROVIDER_META[a.provider].label}
            </TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
