"use client";

import { ArrowRight, CircleCheck, GitCompareArrows, Search } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { DemoBadge } from "@/components/app/demo-badge";
import { Kpi } from "@/components/app/kpi";
import { LINK_ROW } from "@/components/app/link-row";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClearQueue } from "@/components/illustrations";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { MODULES } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime } from "@/lib/format";
import { MOCK_ANCHOR } from "@/lib/mock/analyses";
import { VERDICT_META } from "@/lib/signage-ui";
import { useRestroomChecks } from "@/lib/store/restroom-history";
import { ChecksTable, checkHref, checkLabel } from "./checks-table";
import { VerdictBadge } from "./signage-bits";
import { VerdictBars } from "./verdict-bars";

export function RestroomOverviewClient() {
  const checks = useRestroomChecks();
  const kpis = useMemo(() => {
    const clear = checks.filter((c) => c.verdict === "clear").length;
    return {
      total: checks.length,
      clearPct: checks.length ? Math.round((clear / checks.length) * 100) : 0,
      review: checks.filter((c) => c.verdict === "review").length,
      confusing: checks.filter((c) => c.verdict === "confusing").length,
    };
  }, [checks]);

  // Worst first, then newest.
  const queue = useMemo(
    () =>
      checks
        .filter((c) => c.verdict !== "clear")
        .sort((a, b) => VERDICT_META[b.verdict].rank - VERDICT_META[a.verdict].rank || b.createdAt.localeCompare(a.createdAt)),
    [checks],
  );

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={`${MODULES.restrooms.name} · ${MODULES.restrooms.task}`}
        title="Restroom signage overview"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Sign pairs checked in the 30 days to {formatDate(MOCK_ANCHOR)} (demo set) and in this browser. <DemoBadge show label="Includes demo data" />
          </span>
        }
        actions={
          <>
            <ButtonLink href="/app/restrooms/compare">
              <GitCompareArrows aria-hidden /> Compare two signs
            </ButtonLink>
            <ButtonLink href="/app/restrooms/match" variant="secondary">
              <Search aria-hidden /> Find a counterpart
            </ButtonLink>
          </>
        }
      />

      <Card>
        <CardBody className="grid gap-2 text-sm text-muted sm:grid-cols-3 sm:gap-6">
          <p>
            <span className="font-semibold text-fg">What it does.</span> A CLIP image encoder turns each door sign into an
            embedding. From it the model predicts the gender the sign shows and how alike two designs are.
          </p>
          <p>
            <span className="font-semibold text-fg">What it decides.</span> Three rules (S1–S3) turn a pair into clear, review
            or confusing, with a recommended action for the facility manager.
          </p>
          <p>
            <span className="font-semibold text-fg">What it never sees.</span> People. Inputs are cropped icons. Never upload a
            photo taken inside a restroom.
          </p>
        </CardBody>
      </Card>

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StaggerItem>
          <Kpi label="Pairs checked" value={kpis.total} note="all providers" />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Clear" value={kpis.clearPct} suffix="%" note="all three rules pass" accentClass="bg-verdict-clear" />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Need review" value={kpis.review} note="S1 or S3 failed" accentClass="bg-verdict-review" />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Confusing" value={kpis.confusing} note="replace the signage" accentClass="bg-verdict-confusing" />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Verdicts</CardTitle>
                <CardDescription>How many checked pairs fall in each verdict.</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              <VerdictBars verdicts={checks.map((c) => c.verdict)} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Review queue</CardTitle>
                <CardDescription>Confusing pairs first, then pairs to check on site.</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              {queue.length === 0 ? (
                <EmptyState icon={CircleCheck} illustration={<ClearQueue />} title="Nothing to review" />
              ) : (
                <ul className="grid gap-2">
                  {queue.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={checkHref(c.id)}
                        className={cn("flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5", LINK_ROW)}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{checkLabel(c)}</span>
                          <span className="block truncate text-xs text-muted">
                            {formatDateTime(c.createdAt)} · {c.ruleHits.filter((h) => !h.passed).map((h) => h.ruleId).join(", ")} failed
                          </span>
                        </span>
                        <VerdictBadge verdict={c.verdict} />
                      </Link>
                    </li>
                  ))}
                  {queue.length > 6 && <li className="text-sm text-muted">and {queue.length - 6} more in the table.</li>}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent comparisons</CardTitle>
              <CardDescription>Newest first. Open a row for both signs, the rule checks and the raw JSON.</CardDescription>
            </div>
            <ButtonLink href="/app/restrooms/compare" variant="ghost" size="sm">
              New comparison <ArrowRight aria-hidden />
            </ButtonLink>
          </CardHeader>
          <CardBody className="px-0 pb-2">
            <ChecksTable checks={checks.slice(0, 12)} caption="Recent restroom sign comparisons" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
