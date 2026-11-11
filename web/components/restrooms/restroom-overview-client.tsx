"use client";

import { ArrowRight, CircleCheck, GitCompareArrows, Search } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { DemoBadge } from "@/components/app/demo-badge";
import { Kpi } from "@/components/app/kpi";
import { RestroomLayersChart } from "@/components/charts/restroom-layers";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClearQueue } from "@/components/illustrations";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { MODULES } from "@/lib/brand";
import { formatDate, formatDateTime } from "@/lib/format";
import { MOCK_ANCHOR } from "@/lib/mock/analyses";
import { useRestroomChecks } from "@/lib/store/restroom-history";
import { ChecksTable, checkHref, checkLabel } from "./checks-table";
import { VerdictBadge } from "./signage-bits";
import { VerdictBars } from "./verdict-bars";

export function RestroomOverviewClient() {
  const checks = useRestroomChecks();
  const kpis = useMemo(() => {
    const pairs = checks.filter((c) => c.verdict === "pair").length;
    return {
      total: checks.length,
      pairs,
      pairPct: checks.length ? Math.round((pairs / checks.length) * 100) : 0,
      notPairs: checks.length - pairs,
    };
  }, [checks]);

  // Not a pair, newest first.
  const queue = useMemo(
    () => checks.filter((c) => c.verdict === "not_pair").sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
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
            <span className="font-semibold text-fg">What it decides.</span> Pair or not a pair: the two signs are one design set
            (rule S3) and the doors read as different genders (rule S2).
          </p>
          <p>
            <span className="font-semibold text-fg">What it never sees.</span> People. Inputs are cropped icons. Never upload a
            photo taken inside a restroom.
          </p>
        </CardBody>
      </Card>

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StaggerItem>
          <Kpi label="Checks" value={kpis.total} note="sign pairs compared, all providers" />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Pair" value={kpis.pairs} note="S2 and S3 pass" accentClass="bg-verdict-clear" />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Not a pair" value={kpis.notPairs} note="S2 or S3 failed" accentClass="bg-verdict-confusing" />
        </StaggerItem>
        <StaggerItem>
          <Kpi label="Pair rate" value={kpis.pairPct} suffix="%" note="of all checks" />
        </StaggerItem>
      </Stagger>

      <RestroomLayersChart />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Verdicts</CardTitle>
                <CardDescription>How many checks were a pair and how many were not.</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              <VerdictBars verdicts={checks.map((c) => c.verdict)} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Not a pair</CardTitle>
                <CardDescription>Checks where the two signs are not one pair, newest first.</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              {queue.length === 0 ? (
                <EmptyState icon={CircleCheck} illustration={<ClearQueue />} title="Every check is a pair" />
              ) : (
                <ul className="grid gap-2">
                  {queue.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={checkHref(c.id)}
                        className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5 hover:bg-surface-2"
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
