"use client";

import { Printer } from "lucide-react";
import { useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { formatDate } from "@/lib/format";

/*
 * Pieces for printing a road report or a sign check on one page (G-25).
 * The page styles for paper live in app/print.css; these components add what
 * the paper needs and the screen does not.
 */

/** Opens the browser's print dialog. Never printed itself. */
export function PrintButton() {
  return (
    <Button variant="secondary" size="sm" onClick={() => window.print()} className="print:hidden">
      <Printer aria-hidden /> Print
    </Button>
  );
}

export type PrintRuleRow = { ruleId: string; title: string; detail: string; result: ReactNode };

/**
 * The full rule table, on paper only. On screen it sits in a tab, and Radix
 * removes inactive tabs from the page, so print.css hides the tabs and this
 * copy is printed instead, whichever tab was open.
 */
export function PrintRuleTable({
  title,
  resultLabel,
  rows,
  total,
  empty,
  note,
}: {
  title: string;
  resultLabel: string;
  rows: PrintRuleRow[];
  total?: ReactNode;
  empty: string;
  note?: string;
}) {
  return (
    <section className="hidden rounded-lg border border-border print:block">
      <h2 className="px-5 pt-3 text-base font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="px-5 pt-1 pb-3 text-sm text-muted">{empty}</p>
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Rule</TH>
              <TH>What happened</TH>
              <TH className="text-right">{resultLabel}</TH>
            </tr>
          </THead>
          <tbody>
            {rows.map((r) => (
              <TR key={r.ruleId}>
                <TD className="whitespace-nowrap">
                  <span className="font-mono text-xs text-muted">{r.ruleId}</span> <span className="font-medium">{r.title}</span>
                </TD>
                <TD className="text-muted">{r.detail}</TD>
                <TD className="tabular text-right font-mono whitespace-nowrap">{r.result}</TD>
              </TR>
            ))}
            {total !== undefined && (
              <TR className="bg-surface-2">
                <TD colSpan={2} className="font-semibold">
                  Score
                </TD>
                <TD className="tabular text-right font-mono font-semibold">{total}</TD>
              </TR>
            )}
          </tbody>
        </Table>
      )}
      {note && <p className="px-5 pb-3 text-xs text-muted">{note}</p>}
    </section>
  );
}

// The print date is read when the page opens and again right before printing.
let printedAt: string | null = null;
function subscribePrint(onChange: () => void) {
  const update = () => {
    printedAt = new Date().toISOString();
    onChange();
  };
  window.addEventListener("beforeprint", update);
  return () => window.removeEventListener("beforeprint", update);
}
function getPrintSnapshot() {
  printedAt ??= new Date().toISOString();
  return printedAt;
}
const getServerSnapshot = () => null;

/**
 * Bottom line on paper: where and when it was printed, and the honesty label
 * (U8: a demo or mock result says so on paper too).
 */
export function PrintFooter({ demoNote }: { demoNote?: string }) {
  const at = useSyncExternalStore(subscribePrint, getPrintSnapshot, getServerSnapshot);
  const url = useSyncExternalStore(noopSubscribe, () => window.location.href, () => null);
  if (!at || !url) return null;
  return (
    <p className="hidden border-t border-border pt-2 text-xs text-muted print:block">
      Printed {formatDate(at)} from {url}
      {demoNote && <strong className="font-semibold text-fg"> · {demoNote}</strong>}
    </p>
  );
}

function noopSubscribe() {
  return () => {};
}
