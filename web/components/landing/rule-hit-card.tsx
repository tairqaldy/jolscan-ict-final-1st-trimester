import Link from "next/link";
import type { ReactNode } from "react";
import { MODULES, type ModuleId } from "@/lib/brand";
import { markText, type Mark } from "@/lib/landing-rule-hits";

/**
 * One rule hit in the landing section "Rules you can read" (G-61): the rules
 * engine's own sentence, with the rule's setting (the value you can change on
 * the Rules page) highlighted and the measured value in bold. Every value is
 * computed by the engines in web/app/page.tsx; nothing is typed here.
 *
 * Picked over the earlier dark code block and over a version with the sample
 * photo: it is the shortest card at 375 and 1440 px, and it reads as plain text
 * while the threshold still stands out (docs/worklog/dameli.md, G-61).
 */
export function RuleHitCard({
  module,
  context,
  ruleId,
  title,
  detail,
  marks,
  effect,
  outcome,
  href,
}: {
  module: ModuleId;
  context: string;
  ruleId: string;
  title: string;
  detail: string;
  /** Tokens in `detail` to highlight, from web/lib/landing-rule-hits.ts. */
  marks: Mark[];
  effect: string;
  outcome: ReactNode;
  href: string;
}) {
  return (
    <article className="grid content-start gap-4 rounded-lg border border-border bg-surface p-6">
      <p className="eyebrow text-muted">
        {MODULES[module].name} · {context}
      </p>
      <div className="grid gap-2">
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-mono text-muted">{ruleId}</span>
          <span className="font-semibold">{title}</span>
        </p>
        <p className="text-lg leading-relaxed">
          {markText(detail, marks).map((part, i) =>
            part.kind === "setting" ? (
              <mark key={i} className="tabular rounded-sm bg-accent-soft px-1 font-mono font-semibold text-accent-ink">
                {part.text}
              </mark>
            ) : part.kind === "value" ? (
              <strong key={i} className="tabular font-mono font-semibold">
                {part.text}
              </strong>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}{" "}
          <span className="tabular inline-block rounded-sm border border-border-strong px-1.5 font-mono text-base font-semibold whitespace-nowrap">
            → {effect}
          </span>
        </p>
      </div>
      <p className="flex flex-wrap items-center gap-2 text-sm">{outcome}</p>
      <Link href={href} className="text-sm font-medium text-accent-ink underline underline-offset-2">
        Change the thresholds and watch the result move
      </Link>
    </article>
  );
}
