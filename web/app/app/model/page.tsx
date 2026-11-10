import { Database, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { DemoBadge } from "@/components/app/demo-badge";
import { LifecycleDiagram } from "@/components/app/lifecycle-diagram";
import { ModelComparisonChart } from "@/components/charts/model-comparison";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { cn } from "@/lib/cn";
import { BASELINE, CHAMPION, EXPERIMENTS, IS_DEMO_DATA } from "@/lib/mock/experiments";

export const metadata: Metadata = { title: "Model" };

const METRICS = [
  {
    term: "IoU",
    text: "Intersection over Union: how much a predicted box overlaps the true box, from 0 (no overlap) to 1 (identical). A prediction counts as correct when IoU is at least a chosen value, usually 0.5.",
  },
  {
    term: "Precision",
    text: "Of the boxes the model drew, the share that really are potholes. Low precision means false alarms.",
  },
  {
    term: "Recall",
    text: "Of the real potholes, the share the model found. Low recall means missed potholes, which matters more for road safety.",
  },
  {
    term: "mAP50",
    text: "Mean average precision with IoU 0.5: the area under the precision–recall curve, averaged over classes (we have one class).",
  },
  {
    term: "mAP50-95",
    text: "The same, averaged over IoU thresholds 0.50 to 0.95. Stricter: it also rewards boxes that fit tightly. Our main comparison metric.",
  },
];

const fmt = (v: number) => v.toFixed(2);
const delta = (v: number, base: number) => {
  const d = v - base;
  if (Math.abs(d) < 0.005) return null;
  return `${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(2)}`;
};

export default function ModelPage() {
  const { dataset } = EXPERIMENTS;
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Model"
        title="Experiments and model card"
        description="Assignment Option A: one change per run against a fixed baseline, same split and seed. Every run is tracked in MLflow."
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex flex-wrap items-center gap-2">
              Experiment runs <DemoBadge label={IS_DEMO_DATA ? "Demo data: placeholder numbers" : undefined} />
            </CardTitle>
            <CardDescription>{EXPERIMENTS.protocol}</CardDescription>
          </div>
        </CardHeader>
        <CardBody className="px-0 pb-2">
          <Table caption="Experiment runs">
            <THead>
              <tr>
                <TH>Run</TH>
                <TH>What changed</TH>
                <TH className="text-right">Precision</TH>
                <TH className="text-right">Recall</TH>
                <TH className="text-right">mAP50</TH>
                <TH className="text-right">mAP50-95</TH>
                <TH className="text-right">Latency ms</TH>
                <TH className="text-right">Size MB</TH>
              </tr>
            </THead>
            <tbody>
              {EXPERIMENTS.runs.map((r) => {
                const champion = r.id === CHAMPION.id;
                const baseline = r.id === BASELINE.id;
                const d = baseline ? null : delta(r.map5095, BASELINE.map5095);
                return (
                  <TR key={r.id} className={cn(champion && "bg-accent-soft")}>
                    <TD className="whitespace-nowrap">
                      <span className="font-mono font-medium">{r.id}</span>{" "}
                      {champion && (
                        <Badge tone="inverse" className="ml-1">
                          <Trophy aria-hidden /> Champion
                        </Badge>
                      )}
                      {baseline && (
                        <Badge tone="outline" className="ml-1">
                          Baseline
                        </Badge>
                      )}
                    </TD>
                    <TD className="min-w-56 text-muted">{r.changed}</TD>
                    <TD className="tabular text-right font-mono">{fmt(r.precision)}</TD>
                    <TD className="tabular text-right font-mono">{fmt(r.recall)}</TD>
                    <TD className="tabular text-right font-mono">{fmt(r.map50)}</TD>
                    <TD className="tabular text-right font-mono whitespace-nowrap">
                      {fmt(r.map5095)}
                      {d && <span className="ml-1.5 text-xs text-subtle">{d}</span>}
                    </TD>
                    <TD className={cn("tabular text-right font-mono", r.latencyMs > EXPERIMENTS.latencyBudgetMs && "text-sev-high-ink")}>
                      {r.latencyMs}
                      {r.latencyMs > EXPERIMENTS.latencyBudgetMs && <span className="sr-only"> (over budget)</span>}
                    </TD>
                    <TD className="tabular text-right font-mono">{r.sizeMB.toFixed(1)}</TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
          <p className="px-5 pt-3 pb-2 text-sm text-muted">
            <span className="font-medium text-fg">Champion rule:</span> {EXPERIMENTS.championRule} Latency in orange is over the{" "}
            {EXPERIMENTS.latencyBudgetMs} ms budget. Small numbers next to mAP50-95 are the change against the baseline.
          </p>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ModelComparisonChart />
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-5" aria-hidden /> Dataset card
              </CardTitle>
              <CardDescription>Placeholders until the Data lane exports the final version.</CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            <dl className="grid gap-3 text-sm sm:grid-cols-[9rem_1fr]">
              <dt className="text-muted">Name</dt>
              <dd>{dataset.name}</dd>
              <dt className="text-muted">Source</dt>
              <dd>{dataset.source}</dd>
              <dt className="text-muted">Licence</dt>
              <dd>{dataset.licence}</dd>
              <dt className="text-muted">Classes</dt>
              <dd className="font-mono">{dataset.classes.join(", ")}</dd>
              <dt className="text-muted">Images</dt>
              <dd className="tabular">
                train {dataset.images.train ?? "TBD"} · val {dataset.images.val ?? "TBD"} · test {dataset.images.test ?? "TBD"}
              </dd>
              <dt className="text-muted">Split</dt>
              <dd>{dataset.split}</dd>
              <dt className="text-muted">Notes</dt>
              <dd className="text-muted">{dataset.notes}</dd>
            </dl>
          </CardBody>
        </Card>
      </div>

      <section aria-labelledby="metrics-h" className="grid gap-4">
        <h2 id="metrics-h" className="text-2xl font-bold">
          The metrics in plain words
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((m) => (
            <div key={m.term} className="rounded-lg border border-border bg-surface p-4">
              <dt className="font-display text-lg font-semibold">{m.term}</dt>
              <dd className="mt-1 text-sm text-muted">{m.text}</dd>
            </div>
          ))}
          <div className="rounded-lg border border-border bg-surface p-4">
            <dt className="font-display text-lg font-semibold">Latency and size</dt>
            <dd className="mt-1 text-sm text-muted">
              Time per photo on the laptop CPU and the weights file size. A slightly less accurate model can be the better
              choice if it is much faster or smaller.
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="lifecycle-h" className="grid gap-4">
        <div>
          <h2 id="lifecycle-h" className="text-2xl font-bold">
            Model lifecycle
          </h2>
          <p className="mt-1 text-muted">MLOps level 0 moving to level 1. The review queue closes the loop back to data.</p>
        </div>
        <LifecycleDiagram />
      </section>
    </div>
  );
}
