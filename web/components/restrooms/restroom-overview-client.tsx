"use client";

import { GitCompareArrows, Search } from "lucide-react";
import { useMemo } from "react";
import { DemoBadge } from "@/components/app/demo-badge";
import { Kpi } from "@/components/app/kpi";
import { RestroomLayersChart } from "@/components/charts/restroom-layers";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MODULES } from "@/lib/brand";
import { formatDate } from "@/lib/format";
import { MOCK_ANCHOR } from "@/lib/mock/analyses";
import { useRestroomChecks } from "@/lib/store/restroom-history";

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
    </div>
  );
}
