"use client";

import { FilterX, SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { dayKey } from "@/lib/format";
import { SEVERITY_CLASSES, SEVERITY_META } from "@/lib/severity";
import { useAnalyses } from "@/lib/store/history";
import { PROVIDERS, SEVERITIES, type Provider, type Severity } from "@/lib/types";
import { AnalysesTable } from "./analyses-table";
import { PROVIDER_META } from "./provider-badge";

export function ReportsClient() {
  const params = useSearchParams();
  const analyses = useAnalyses();
  const [severities, setSeverities] = useState<Severity[]>([]);
  const [provider, setProvider] = useState<Provider | "all">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reviewOnly, setReviewOnly] = useState(params.get("review") === "1");

  const filtered = useMemo(
    () =>
      analyses.filter((a) => {
        if (severities.length && !severities.includes(a.severity)) return false;
        if (provider !== "all" && a.provider !== provider) return false;
        const day = dayKey(a.createdAt);
        if (from && day < from) return false;
        if (to && day > to) return false;
        if (reviewOnly && !a.needsReview) return false;
        return true;
      }),
    [analyses, severities, provider, from, to, reviewOnly],
  );

  const active = severities.length > 0 || provider !== "all" || from || to || reviewOnly;
  const clear = () => {
    setSeverities([]);
    setProvider("all");
    setFrom("");
    setTo("");
    setReviewOnly(false);
  };

  return (
    <div className="grid gap-5">
      <Card>
        <CardBody className="grid gap-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Severity</legend>
            <div className="flex flex-wrap gap-2">
              {SEVERITIES.map((s) => {
                const on = severities.includes(s);
                const Icon = SEVERITY_META[s].icon;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSeverities((prev) => (on ? prev.filter((x) => x !== s) : [...prev, s]))}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      on ? cn(SEVERITY_CLASSES[s].badge, SEVERITY_CLASSES[s].border) : "border-border-strong text-muted hover:text-fg",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {SEVERITY_META[s].label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
            <Select
              label="Provider"
              value={provider}
              onValueChange={(v) => setProvider(v as Provider | "all")}
              options={[{ value: "all", label: "All providers" }, ...PROVIDERS.map((p) => ({ value: p, label: PROVIDER_META[p].label }))]}
            />
            <Field label="From" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
            <Field label="To" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
            <Switch label="Needs review only" checked={reviewOnly} onCheckedChange={setReviewOnly} className="lg:pb-2" />
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {filtered.length} of {analyses.length} analyses
        </p>
        {active && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <FilterX aria-hidden /> Clear filters
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No analyses match these filters"
          action={
            <Button variant="secondary" size="sm" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <Card>
          <CardBody className="px-0 py-2">
            <AnalysesTable analyses={filtered} caption="Analyses" />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
