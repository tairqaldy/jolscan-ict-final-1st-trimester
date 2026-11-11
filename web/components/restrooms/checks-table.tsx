"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PROVIDER_META } from "@/components/app/provider-badge";
import { isSeededDemo } from "@/lib/mock/seeded";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import type { CheckWithSource } from "@/lib/store/restroom-history";
import { signTitle } from "./compare-result";
import { VerdictBadge } from "./signage-bits";

export const checkHref = (id: string) => `/app/restrooms/checks/${id}`;
export const checkLabel = (c: CheckWithSource) => c.place ?? `${signTitle(c.inputs.a, "Sign a")} / ${signTitle(c.inputs.b, "Sign b")}`;

/** Restroom sign checks as a table. The place cell is the link; the whole row is clickable too. */
export function ChecksTable({ checks, caption }: { checks: CheckWithSource[]; caption: string }) {
  const router = useRouter();
  return (
    <Table caption={caption}>
      <THead>
        <tr>
          <TH>When</TH>
          <TH>Place</TH>
          <TH>Signs</TH>
          <TH>Verdict</TH>
          <TH className="text-right">Similarity</TH>
          <TH>Provider</TH>
        </tr>
      </THead>
      <tbody>
        {checks.map((c) => (
          <TR key={c.id} className="cursor-pointer hover:bg-surface-2" onClick={() => router.push(checkHref(c.id))}>
            <TD className="tabular whitespace-nowrap text-muted">{formatDateTime(c.createdAt)}</TD>
            <TD className="min-w-40">
              <Link href={checkHref(c.id)} className="font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
                {checkLabel(c)}
              </Link>
              {c.source === "device" && <span className="ml-2 text-xs text-subtle">this device</span>}
            </TD>
            <TD>
              <span className="flex gap-1">
                {[c.inputs.a, c.inputs.b].map((i, k) =>
                  i.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={k} src={i.imageUrl} alt="" className="h-9 w-7.5 rounded-xs bg-surface-2 object-contain" loading="lazy" />
                  ) : (
                    <span key={k} className="h-9 w-7.5 rounded-xs bg-surface-2" />
                  ),
                )}
              </span>
            </TD>
            <TD>
              <VerdictBadge verdict={c.verdict} />
            </TD>
            <TD className="tabular text-right font-mono">{c.similarity.toFixed(2)}</TD>
            <TD className="whitespace-nowrap text-muted">
              {isSeededDemo(c.id) ? "Demo" : PROVIDER_META[c.provider].label}
            </TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
