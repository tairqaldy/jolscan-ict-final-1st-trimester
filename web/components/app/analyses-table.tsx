"use client";

import { CircleExclamationPoint } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SeverityBadge } from "@/components/ui/badge";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDateTime, formatScore } from "@/lib/format";
import type { AnalysisWithSource } from "@/lib/store/history";
import { PROVIDER_META } from "./provider-badge";

/** Analyses as a table. The location cell is the link; the whole row is clickable too. */
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
            onClick={() => router.push(`/app/reports/${a.id}`)}
          >
            <TD className="tabular whitespace-nowrap text-muted">{formatDateTime(a.createdAt)}</TD>
            <TD className="min-w-44">
              <Link
                href={`/app/reports/${a.id}`}
                className="font-medium hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {a.location?.label ?? a.photo.fileName ?? "Uploaded photo"}
              </Link>
              {a.needsReview && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-accent-ink">
                  <CircleExclamationPoint className="size-3.5" aria-hidden /> review
                </span>
              )}
              {a.source === "device" && <span className="ml-2 text-xs text-subtle">this device</span>}
            </TD>
            <TD>
              <SeverityBadge severity={a.severity} />
            </TD>
            <TD className="tabular text-right font-mono">{formatScore(a.score)}</TD>
            <TD className="tabular text-right font-mono">{a.detections.length}</TD>
            <TD className="whitespace-nowrap text-muted">{PROVIDER_META[a.provider].label}</TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
