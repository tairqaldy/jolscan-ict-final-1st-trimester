import { Database, Trophy } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DemoBadge } from "@/components/app/demo-badge";
import { LifecycleDiagram } from "@/components/app/lifecycle-diagram";
import { MODULE_ICONS } from "@/components/app/nav";
import { ModelComparisonChart } from "@/components/charts/model-comparison";
import { RestroomRunsChart } from "@/components/charts/restroom-runs";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { MODULES, type ModuleId } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { DATA_CREDITS } from "@/lib/credits";
import { BASELINE, CHAMPION, EXPERIMENTS, IS_DEMO_DATA, NOT_IN_FILE } from "@/lib/mock/experiments";
import { RESTROOM_EXPERIMENTS, RESTROOM_IS_DEMO } from "@/lib/mock/restroom-experiments";

export const metadata: Metadata = { title: "Model" };

type Term = { term: string; text: ReactNode; source?: string };

const ROAD_METRICS: Term[] = [
  {
    term: "IoU",
    text: "Intersection over Union: how much a predicted box overlaps the true box, from 0 (no overlap) to 1 (identical). A prediction counts as correct when IoU is at least a chosen value, usually 0.5.",
    source: "Lec8 p42",
  },
  { term: "Precision", text: "Of the boxes the model drew, the share that really are potholes. Low precision means false alarms." },
  {
    term: "Recall",
    text: "Of the real potholes, the share the model found. Low recall means missed potholes, which matters more for road safety.",
    source: "Sup p27",
  },
  { term: "mAP50", text: "Mean average precision with IoU 0.5: the area under the precision–recall curve, averaged over classes (we have one class)." },
  { term: "mAP50-95", text: "The same, averaged over IoU thresholds 0.50 to 0.95. Stricter: it also rewards boxes that fit tightly." },
  {
    term: "Recall at 0.40",
    text: "Recall when only boxes with confidence 0.40 or more count, the threshold the app's rules use. This is the recall a road crew would actually get from the app.",
  },
  {
    term: "Validation and test",
    text: "The champion is chosen on the validation split. The test split is read once at the end and only reported, so it stays an honest estimate.",
    source: "Sup p10",
  },
  {
    term: "Latency and size",
    text: "Time per photo on the laptop CPU and the weights file size. A slightly less accurate model can be the better choice if it is much faster or smaller.",
    source: "Lec9 p34",
  },
];

const SIGN_METRICS: Term[] = [
  {
    term: "Top-1 matching accuracy",
    text: "For each query sign the method picks one gallery sign as its partner (each run's rule is in its row). Top-1 accuracy is the share of queries where that pick is the true partner from the same restroom. With 10 validation queries one query is worth 0.10, so smaller differences are noise.",
    source: "Sup p27, Lec8 p42",
  },
  {
    term: "Gender accuracy, grouped cross-validation",
    text: "The share of signs whose gender is predicted correctly, measured with 5-fold cross-validation on the 82 training restrooms. Grouped by restroom: both signs of one restroom always sit on the same side of a split, so the model is never tested on a design it was trained on (no leakage).",
    source: "Sup p10, p26",
  },
  {
    term: "Cosine similarity",
    text: (
      <>
        Each sign becomes an embedding vector. Cosine similarity measures the angle between two vectors, from −1 to 1. We scale it to 0..1
        as <span className="font-mono">(cos + 1) / 2</span>, the same scaling as the IOAI baseline. Signs from one design set score high.
      </>
    ),
  },
  {
    term: "CLIP and zero-shot",
    text: "CLIP was trained on 400 million image–text pairs. Zero-shot means no training at all: the model compares a sign with text prompts such as “a restroom sign for men” and picks the closer one.",
    source: "Lec8 p56",
  },
  {
    term: "ViT, and fine-tuning the last blocks",
    text: "CLIP's image encoder is a Vision Transformer: the image is cut into 32×32 (B/32) or 16×16 (B/16) patches that become tokens. Fine-tuning retrains only the last 1, 3 or 6 transformer blocks on our data: transfer learning. More trained blocks can fit better, or overfit on 82 restrooms.",
    source: "Lec8 p38, p46–47, Sup p24",
  },
  {
    term: "Logistic-regression probe",
    text: "A scikit-learn classifier trained on frozen CLIP embeddings to predict the gender, compared against zero-shot prompts (run R6). The same tool as in the labs.",
    source: "Labs 4 and 6",
  },
];

/** Change against the baseline, e.g. "+0.04". null when there is nothing to compare. */
const delta = (v: number | null, base: number | null) => {
  if (v === null || base === null) return null;
  const d = v - base;
  if (Math.abs(d) < 0.005) return null;
  return `${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(2)}`;
};

function NotRun({ text = "not run yet" }: { text?: string }) {
  return <span className="text-xs whitespace-nowrap text-subtle italic">{text}</span>;
}

/** A score with two decimals (three for the validation numbers the rule compares), or a dash when the results file has no number for it. */
function Score({ value, digits = 2 }: { value: number | null; digits?: number }) {
  if (value === null) return <NotRun text="—" />;
  return <>{value.toFixed(digits)}</>;
}

/** Shows a text and turns the first web address in it into a link (the dataset source). */
function TextWithLink({ text }: { text: string }) {
  const url = text.match(/https?:\/\/[^\s)]+/)?.[0];
  if (!url) return <>{text}</>;
  const [before, after] = text.split(url);
  return (
    <>
      {before}
      <a href={url} className="break-all text-accent-ink underline underline-offset-2">
        {url}
      </a>
      {after}
    </>
  );
}

export default function ModelPage() {
  const { dataset } = EXPERIMENTS;
  const rx = RESTROOM_EXPERIMENTS;
  return (
    <div className="grid gap-10">
      <PageHeader
        eyebrow="Model · both modules"
        title="Experiments and model cards"
        description="Assignment Option A in both modules: one change per run against a fixed baseline, chosen on validation, test read once. Every run is tracked in MLflow."
      />

      <nav aria-label="On this page" className="-mt-4 flex flex-wrap gap-2 text-sm">
        {[
          ["#roads", "Roads experiment"],
          ["#restrooms", "Restrooms experiment"],
          ["#metrics", "Metrics in plain words"],
          ["#lifecycle", "Lifecycle"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="rounded-full border border-border-strong px-3 py-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-fg">
            {label}
          </a>
        ))}
      </nav>

      {/* ------------------------------------------------------------ Roads */}
      <section id="roads" aria-labelledby="roads-h" className="grid scroll-mt-4 gap-4 lg:scroll-mt-24">
        <ModuleHeading id="roads" headingId="roads-h" text="YOLO object detector, fine-tuned from COCO-pretrained weights on a pothole dataset." />
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex flex-wrap items-center gap-2">
                Pothole runs <DemoBadge label={IS_DEMO_DATA ? "Demo data: placeholder numbers" : undefined} />
              </CardTitle>
              <CardDescription>{EXPERIMENTS.protocol}</CardDescription>
            </div>
          </CardHeader>
          <CardBody className="px-0 pb-2">
            <Table caption="Pothole experiment runs">
              <THead>
                <tr>
                  <TH>Run</TH>
                  <TH>What changed</TH>
                  <TH className="text-right">Val mAP50</TH>
                  <TH className="text-right">Val recall at 0.40</TH>
                  <TH className="text-right">mAP50</TH>
                  <TH className="text-right">mAP50-95</TH>
                  <TH className="text-right">Precision</TH>
                  <TH className="text-right">Recall</TH>
                  <TH className="text-right">Recall at 0.40</TH>
                  <TH className="text-right">Latency ms</TH>
                  <TH className="text-right">Size MB</TH>
                  <TH>Device</TH>
                </tr>
              </THead>
              <tbody>
                {EXPERIMENTS.runs.map((r) => {
                  const champion = r.id === CHAMPION.id;
                  const baseline = r.id === BASELINE.id;
                  const d = baseline ? null : delta(r.map50, BASELINE.map50);
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
                      <TD className="tabular text-right font-mono">
                        <Score value={r.valMap50} digits={3} />
                      </TD>
                      <TD className="tabular text-right font-mono">
                        <Score value={r.valRecallAtRulesConf} digits={3} />
                      </TD>
                      <TD className="tabular text-right font-mono whitespace-nowrap">
                        <Score value={r.map50} />
                        {d && <span className="ml-1.5 text-xs text-subtle">{d}</span>}
                      </TD>
                      <TD className="tabular text-right font-mono">
                        <Score value={r.map5095} />
                      </TD>
                      <TD className="tabular text-right font-mono">
                        <Score value={r.precision} />
                      </TD>
                      <TD className="tabular text-right font-mono">
                        <Score value={r.recall} />
                      </TD>
                      <TD className="tabular text-right font-mono">
                        <Score value={r.recallAtRulesConf} />
                      </TD>
                      <TD className="tabular text-right font-mono">
                        {r.latencyMs !== null ? Math.round(r.latencyMs) : <NotRun text="not measured" />}
                      </TD>
                      <TD className="tabular text-right font-mono">{r.sizeMB !== null ? r.sizeMB.toFixed(1) : <NotRun text="—" />}</TD>
                      <TD className="whitespace-nowrap text-muted">{r.device ?? <NotRun text="not recorded" />}</TD>
                    </TR>
                  );
                })}
              </tbody>
            </Table>
            <p className="px-5 pt-3 pb-2 text-sm text-muted">
              <span className="font-medium text-fg">Champion rule:</span> {EXPERIMENTS.championRule} Val mAP50 and val recall at 0.40
              are the validation numbers the rule uses, shown with three decimals so the 0.01 tie band is visible; every other score is on
              the test split, read once. Small numbers next to the test mAP50
              are the change against the baseline {BASELINE.id}; differences below 0.02 on test are not claimed as real.
            </p>
          </CardBody>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <ModelComparisonChart />
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="size-5" aria-hidden /> Pothole dataset card
                </CardTitle>
                <CardDescription>
                  From the dataset card (data/README.md) and the split manifest, through the results file.
                </CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              <dl className="grid gap-3 text-sm sm:grid-cols-[9rem_1fr]">
                <dt className="text-muted">Name</dt>
                <dd>{dataset.name}</dd>
                <dt className="text-muted">Source</dt>
                <dd>
                  <TextWithLink text={dataset.source} />
                </dd>
                <dt className="text-muted">Licence</dt>
                <dd>{dataset.licence}</dd>
                <dt className="text-muted">Classes</dt>
                <dd className="font-mono">{dataset.classes.length > 0 ? dataset.classes.join(", ") : NOT_IN_FILE}</dd>
                <dt className="text-muted">Images</dt>
                <dd className="tabular">
                  train {dataset.images.train ?? "—"} · validation {dataset.images.val ?? "—"} · test {dataset.images.test ?? "—"}
                </dd>
                <dt className="text-muted">Split</dt>
                <dd>{dataset.split}</dd>
                {dataset.notes && (
                  <>
                    <dt className="text-muted">Notes</dt>
                    <dd className="text-muted">{dataset.notes}</dd>
                  </>
                )}
              </dl>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* -------------------------------------------------------- Restrooms */}
      <section id="restrooms" aria-labelledby="restrooms-h" className="grid scroll-mt-4 gap-4 lg:scroll-mt-24">
        <ModuleHeading
          id="restrooms"
          headingId="restrooms-h"
          text="CLIP image encoder (a Vision Transformer): zero-shot against fine-tuning the last transformer blocks, on the IOAI 2025 Restroom Icon Matching task."
        />

        <Callout title={`IOAI reference points: baseline ${rx.reference.ioaiBaseline.toFixed(2)}, best ${rx.reference.ioaiBest.toFixed(2)}`}>
          {rx.reference.note} Our run R0 tries to reproduce the baseline; the best score is a ceiling to compare against, not a
          target we claim.
        </Callout>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex flex-wrap items-center gap-2">
                Sign runs <DemoBadge
                  module="restrooms"
                  label={rx.runs.some((r) => r.isReal) ? "Some rows are placeholders" : "Demo data: placeholder rows"}
                  show={RESTROOM_IS_DEMO}
                />
              </CardTitle>
              <CardDescription>
                Chosen on validation matching accuracy, gender accuracy as the tie-break. Rows marked “not run yet” have no
                numbers so far; rows without a badge are real runs.
              </CardDescription>
            </div>
          </CardHeader>
          <CardBody className="px-0 pb-2">
            <Table caption="Restroom experiment runs">
              <THead>
                <tr>
                  <TH>Run</TH>
                  <TH>What changed</TH>
                  <TH className="text-right">Top-1 val</TH>
                  <TH className="text-right">Top-1 test</TH>
                  <TH className="text-right">Gender acc (CV)</TH>
                  <TH className="text-right">Latency ms</TH>
                  <TH>Device</TH>
                </tr>
              </THead>
              <tbody>
                {rx.runs.map((r) => {
                  const champion = r.run === rx.champion;
                  const n = (v: number | null) => (v === null ? <NotRun /> : v.toFixed(2));
                  return (
                    <TR key={r.run} className={cn(champion && "bg-accent-soft")}>
                      <TD className="whitespace-nowrap">
                        <span className="font-mono font-medium">{r.run}</span>{" "}
                        {champion && (
                          <Badge tone="inverse" className="ml-1">
                            <Trophy aria-hidden /> Champion
                          </Badge>
                        )}
                        {r.run === "R0" && (
                          <Badge tone="outline" className="ml-1">
                            Baseline
                          </Badge>
                        )}
                        <DemoBadge module="restrooms" show={!r.isReal} label="Placeholder" className="ml-1" />
                      </TD>
                      <TD className="min-w-64 text-muted">{r.changed}</TD>
                      <TD className="tabular text-right font-mono">{n(r.matchTop1Val)}</TD>
                      <TD className="tabular text-right font-mono">{n(r.matchTop1Test)}</TD>
                      <TD className="tabular text-right font-mono">{n(r.genderAccCv)}</TD>
                      <TD className="tabular text-right font-mono">{r.latencyMs === null ? <NotRun /> : Math.round(r.latencyMs)}</TD>
                      <TD className="whitespace-nowrap text-muted">{r.device ?? <NotRun />}</TD>
                    </TR>
                  );
                })}
              </tbody>
            </Table>
          </CardBody>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <RestroomRunsChart />
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="size-5" aria-hidden /> Restroom dataset card
                </CardTitle>
                <CardDescription>From the task description; counts are checked by the data script.</CardDescription>
              </div>
            </CardHeader>
            <CardBody>
              <dl className="grid gap-3 text-sm sm:grid-cols-[9rem_1fr]">
                <dt className="text-muted">Name</dt>
                <dd>{DATA_CREDITS.restroom.name}</dd>
                <dt className="text-muted">Source</dt>
                <dd>
                  <a href={DATA_CREDITS.restroom.url} className="break-all text-accent-ink underline underline-offset-2">
                    {DATA_CREDITS.restroom.url}
                  </a>
                </dd>
                <dt className="text-muted">Licence</dt>
                <dd>{DATA_CREDITS.restroom.licence}</dd>
                <dt className="text-muted">Classes</dt>
                <dd className="font-mono">male, female</dd>
                <dt className="text-muted">Images</dt>
                <dd>Training: 82 restrooms × 4 images (crop and original, male and female). Validation: 10 queries, 20 gallery. Test: 30 queries, 60 gallery.</dd>
                <dt className="text-muted">People</dt>
                <dd>None. The images are icons on doors and walls.</dd>
                <dt className="text-muted">Sample icons in this app</dt>
                <dd className="text-muted">
                  Twelve original drawings made for the demo, and twelve real signs from the IOAI validation set.{" "}
                  {DATA_CREDITS.restroomSamples.changes}.{" "}
                  The IOAI pairs page shows all IOAI validation and test images, resized, with our pipeline&apos;s results on them.
                </dd>
              </dl>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* ---------------------------------------------------------- Metrics */}
      <section id="metrics" aria-labelledby="metrics-h" className="grid scroll-mt-4 gap-6 lg:scroll-mt-24">
        <h2 id="metrics-h" className="text-2xl font-bold">
          The metrics in plain words
        </h2>
        <TermGrid title={`${MODULES.roads.name}: detection`} terms={ROAD_METRICS} />
        <TermGrid title={`${MODULES.restrooms.name}: matching and classification`} terms={SIGN_METRICS} />
      </section>

      <section id="lifecycle" aria-labelledby="lifecycle-h" className="grid scroll-mt-4 gap-4 lg:scroll-mt-24">
        <div>
          <h2 id="lifecycle-h" className="text-2xl font-bold">
            Model lifecycle
          </h2>
          <p className="mt-1 text-muted">MLOps level 0 moving to level 1, the same loop for both models. The review queues close the loop back to data.</p>
        </div>
        <LifecycleDiagram />
      </section>
    </div>
  );
}

function ModuleHeading({ id, headingId, text }: { id: ModuleId; headingId: string; text: string }) {
  const Icon = MODULE_ICONS[id];
  return (
    <div className="flex items-start gap-3 border-t border-border pt-6">
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-inverse text-inverse-fg">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <h2 id={headingId} className="text-2xl font-bold">
          {MODULES[id].name}: {MODULES[id].task.toLowerCase()}
        </h2>
        <p className="text-muted">{text}</p>
      </div>
    </div>
  );
}

function TermGrid({ title, terms }: { title: string; terms: Term[] }) {
  return (
    <div className="grid gap-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {terms.map((m) => (
          <div key={m.term} className="rounded-lg border border-border bg-surface p-4">
            <dt className="font-display text-lg font-semibold">{m.term}</dt>
            <dd className="mt-1 text-sm text-muted">{m.text}</dd>
            {m.source && <dd className="mt-2 font-mono text-xs text-subtle">Course: {m.source}</dd>}
          </div>
        ))}
      </dl>
    </div>
  );
}
