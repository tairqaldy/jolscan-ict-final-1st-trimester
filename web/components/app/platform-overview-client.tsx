"use client";

import { ArrowRight, ChartColumn, FlaskConical, Settings } from "lucide-react";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { checkHref, checkLabel } from "@/components/restrooms/checks-table";
import { VerdictBadge } from "@/components/restrooms/signage-bits";
import { SeverityBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { BRAND, MODULES, type ModuleId } from "@/lib/brand";
import { formatDate, formatDateTime } from "@/lib/format";
import { MOCK_ANCHOR } from "@/lib/mock/analyses";
import { useAnalyses } from "@/lib/store/history";
import { useRestroomChecks } from "@/lib/store/restroom-history";
import { DemoBadge } from "./demo-badge";
import { Kpi } from "./kpi";
import { MODULE_ICONS, MODULE_NAV } from "./nav";
import { ProviderBadge } from "./provider-badge";

/** /app: both modules side by side, clearly separated, each linking into its pages. */
export function PlatformOverviewClient() {
  const analyses = useAnalyses();
  const checks = useRestroomChecks();

  const roads = useMemo(
    () => ({
      photos: analyses.length,
      urgent: analyses.filter((a) => a.severity === "critical" || a.severity === "high").length,
      review: analyses.filter((a) => a.needsReview).length,
    }),
    [analyses],
  );
  const restrooms = useMemo(
    () => ({
      pairs: checks.length,
      confusing: checks.filter((c) => c.verdict === "confusing").length,
      review: checks.filter((c) => c.verdict === "review").length,
    }),
    [checks],
  );

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={`${BRAND.name} · Home`}
        title="Inspection overview"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Both modules at a glance: the 30 days to {formatDate(MOCK_ANCHOR)} (demo sets) plus work done in this browser.{" "}
            <DemoBadge show label="Includes demo data" />
          </span>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <ModulePanel id="roads">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Kpi label="Photos" value={roads.photos} note="analysed" className="p-3 sm:p-4" />
            <Kpi label="Urgent" value={roads.urgent} note="high or critical" accentClass="bg-sev-critical" className="p-3 sm:p-4" />
            <Kpi label="To review" value={roads.review} note="low confidence" accentClass="bg-accent" className="p-3 sm:p-4" />
          </div>
          <RecentList title="Latest road photos" moreHref="/app/roads/reports">
            {analyses.slice(0, 4).map((a) => (
              <li key={a.id}>
                <Link href={`/app/roads/reports/${a.id}`} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-surface-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{a.location?.label ?? a.photo.fileName ?? "Uploaded photo"}</span>
                    <span className="tabular block text-xs text-muted">{formatDateTime(a.createdAt)}</span>
                  </span>
                  <SeverityBadge severity={a.severity} />
                </Link>
              </li>
            ))}
          </RecentList>
        </ModulePanel>

        <ModulePanel id="restrooms">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Kpi label="Pairs" value={restrooms.pairs} note="checked" className="p-3 sm:p-4" />
            <Kpi label="Confusing" value={restrooms.confusing} note="replace signs" accentClass="bg-verdict-confusing" className="p-3 sm:p-4" />
            <Kpi label="To review" value={restrooms.review} note="check on site" accentClass="bg-verdict-review" className="p-3 sm:p-4" />
          </div>
          <RecentList title="Latest sign checks" moreHref="/app/restrooms">
            {checks.slice(0, 4).map((c) => (
              <li key={c.id}>
                <Link href={checkHref(c.id)} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-surface-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{checkLabel(c)}</span>
                    <span className="tabular block text-xs text-muted">{formatDateTime(c.createdAt)}</span>
                  </span>
                  <VerdictBadge verdict={c.verdict} />
                </Link>
              </li>
            ))}
          </RecentList>
        </ModulePanel>
      </div>

      <section aria-labelledby="shared-h" className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="shared-h" className="text-xl font-bold">
            Shared by both modules
          </h2>
          <p className="inline-flex items-center gap-2 text-sm text-muted">
            Model provider for both: <ProviderBadge />
          </p>
        </div>
        <ul className="grid gap-3 md:grid-cols-3">
          {[
            { href: "/app/analytics", icon: ChartColumn, title: "Analytics", text: "Volume, verdicts, confidence and similarity distributions, latency by provider." },
            { href: "/app/model", icon: FlaskConical, title: "Model", text: "Experiment tables for both models, metrics in plain words, IOAI reference points." },
            { href: "/app/settings", icon: Settings, title: "Settings", text: "One provider switch for both modules, privacy options, export and reset." },
          ].map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="flex h-full gap-3 rounded-lg border border-border bg-surface p-4 hover:bg-surface-2">
                <l.icon className="mt-0.5 size-5 shrink-0 text-accent-ink" aria-hidden />
                <span>
                  <span className="block font-semibold">{l.title}</span>
                  <span className="block text-sm text-muted">{l.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ModulePanel({ id, children }: { id: ModuleId; children: ReactNode }) {
  const m = MODULES[id];
  const Icon = MODULE_ICONS[id];
  const pages = MODULE_NAV[id].filter((i) => !i.exact);
  return (
    <Card aria-labelledby={`mod-${id}`} className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-surface-2 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-inverse text-inverse-fg">
            <Icon className="size-5" aria-hidden />
          </span>
          <div>
            <h2 id={`mod-${id}`} className="text-xl font-bold">
              {m.name} <span className="font-normal text-muted">· {m.task}</span>
            </h2>
            <p className="max-w-md text-sm text-muted">{m.summary}</p>
          </div>
        </div>
        <ButtonLink href={m.href} size="sm" variant="secondary">
          Open {m.name} <ArrowRight aria-hidden />
        </ButtonLink>
      </div>
      <CardBody className="grid gap-5">
        {children}
        <nav aria-label={`${m.name} pages`} className="flex flex-wrap gap-2 border-t border-border pt-4">
          {pages.map((p) => (
            <ButtonLink key={p.href} href={p.href} size="sm" variant="ghost">
              <p.icon aria-hidden /> {p.label}
            </ButtonLink>
          ))}
        </nav>
      </CardBody>
    </Card>
  );
}

function RecentList({ title, moreHref, children }: { title: string; moreHref: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Link href={moreHref} className="text-sm text-accent-ink underline underline-offset-2">
          See all
        </Link>
      </div>
      <ul className="-mx-2 grid gap-0.5">{children}</ul>
    </div>
  );
}
