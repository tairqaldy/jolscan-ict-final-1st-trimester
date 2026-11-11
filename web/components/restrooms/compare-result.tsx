"use client";

import { ArrowLeftRight, Brain, Clock, MapPin, Timer, type LucideIcon } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { ResultProvenanceBadge } from "@/components/app/demo-badge";
import { PROVIDER_META } from "@/components/app/provider-badge";
import { isSeededDemo, SEEDED_MODEL_LABEL } from "@/lib/mock/seeded";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { Card, CardBody } from "@/components/ui/card";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { getRestroomSample } from "@/lib/mock/restroom-samples";
import { assignDoors, doorGender, rejudge } from "@/lib/signage";
import { VERDICT_CLASSES, VERDICT_META } from "@/lib/signage-ui";
import { signageRulesStore } from "@/lib/store/settings";
import type { Gender, SignInputInfo, StoredSignageCheck } from "@/lib/types";
import { GenderTag, SignImage, ThresholdBar, VerdictBadge } from "./signage-bits";

export function signTitle(info: SignInputInfo, fallback: string): string {
  return getRestroomSample(info.sampleId)?.title ?? info.fileName ?? fallback;
}

/**
 * Full result of a compare check, shared by Compare and the check detail page:
 * both signs side by side with gender and confidence, the similarity, the
 * verdict, the rule hits and the raw JSON.
 */
export function CompareResultView({ check }: { check: StoredSignageCheck }) {
  const rules = signageRulesStore.useStore();
  const current = useMemo(() => rejudge(check, rules), [check, rules]);
  const rulesChanged = current.verdict !== check.verdict;
  const t1 = rules.s1.minMargin;
  const t2 = rules.s2.minMargin;
  const t3 = rules.s3.minSimilarity;
  const doors = assignDoors(check.a, check.b);
  const meta = VERDICT_META[check.verdict];

  const raw = useMemo(() => {
    const strip = (i: SignInputInfo) => ({
      ...i,
      imageUrl: i.imageUrl?.startsWith("data:") ? "data:… (thumbnail kept in this browser)" : i.imageUrl,
    });
    const { inputs, ...rest } = check as StoredSignageCheck & { source?: string };
    delete (rest as { source?: string }).source;
    return JSON.stringify({ ...rest, inputs: { a: strip(inputs.a), b: strip(inputs.b) } }, null, 2);
  }, [check]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card>
          {/* lg: tighter gaps and smaller signs (see SignColumn), so on a 1280×720 projector
              both signs, the two bars and the verdict card fit on one screen (W-60). */}
          <CardBody className="grid gap-6 lg:gap-4">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <SignColumn door="Door A" info={check.inputs.a} pMale={doors.pMaleA} reads={doorGender(doors, "a")} />
              <SignColumn door="Door B" info={check.inputs.b} pMale={doors.pMaleB} reads={doorGender(doors, "b")} />
            </div>
            <div className="grid gap-2 border-t border-border pt-5 lg:pt-4">
              <p className="inline-flex items-center gap-2 font-display text-lg font-semibold">
                <ArrowLeftRight className="size-4.5 text-muted" aria-hidden /> How clearly do the two doors differ?
              </p>
              <ThresholdBar
                value={doors.margin}
                threshold={t1}
                label="Gap in P(male) between the doors (0 the same, 1 opposite)"
                valueText={doors.margin.toFixed(2)}
                thresholdLabel={`the S1 threshold ${t1.toFixed(2)}. Below ${t2.toFixed(2)} (S2) the doors cannot be told apart`}
              />
              <p className="text-xs text-subtle">
                The doors are compared with each other: the sign with the higher P(male) is read as the men&apos;s room. On the IOAI
                training restrooms this pairwise reading is right 90% of the time; classifying each sign on its own gets both right only 57%.
              </p>
            </div>
            <div className="grid gap-2 border-t border-border pt-5 lg:pt-4">
              <p className="inline-flex items-center gap-2 font-display text-lg font-semibold">
                <ArrowLeftRight className="size-4.5 text-muted" aria-hidden /> How alike are the two designs?
              </p>
              <ThresholdBar
                value={check.similarity}
                threshold={t3}
                label="Similarity (0 unrelated, 1 identical)"
                valueText={check.similarity.toFixed(2)}
                thresholdLabel={`the S3 threshold ${t3.toFixed(2)}`}
              />
            </div>
          </CardBody>
        </Card>

        <Card className={cn("border-t-4", VERDICT_CLASSES[check.verdict].border)}>
          <CardBody className="grid content-start gap-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Signage verdict</p>
              <div className="mt-2">
                <VerdictBadge verdict={check.verdict} size="lg" />
              </div>
              <p className="mt-2 text-sm text-muted">{meta.description}.</p>
            </div>
            <div className="grid gap-0.5 text-sm">
              <p className="text-xs text-muted">Recommended action</p>
              <p className="font-semibold">{check.recommendedAction}</p>
            </div>
            {rulesChanged && (
              <Callout tone="info" title="Your rules have changed since this check">
                With the current thresholds this pair would be {VERDICT_META[current.verdict].label.toLowerCase()}.
              </Callout>
            )}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 text-sm">
              <Meta icon={PROVIDER_META[check.provider].icon} label="Provider" wide>
                <span className="inline-flex max-w-full flex-wrap items-center gap-1.5">
                  {PROVIDER_META[check.provider].label}
                  <ResultProvenanceBadge result={check} />
                </span>
              </Meta>
              <Meta icon={Brain} label="Model">
                <span className="font-mono text-xs break-all">{isSeededDemo(check.id) ? SEEDED_MODEL_LABEL : check.model}</span>
              </Meta>
              <Meta icon={Timer} label="Model latency">
                <span className="tabular">{check.latencyMs} ms</span>
              </Meta>
              <Meta icon={Clock} label="Checked">
                {formatDateTime(check.createdAt)}
              </Meta>
              {check.place && (
                <Meta icon={MapPin} label="Place" wide>
                  {check.place}
                </Meta>
              )}
            </dl>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <Tabs defaultValue="rules">
            <TabsList aria-label="Result details">
              <TabsTrigger value="rules">Why this verdict</TabsTrigger>
              <TabsTrigger value="json">Raw JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="rules">
              <Table caption="Signage rule hits">
                <THead>
                  <tr>
                    <TH>Rule</TH>
                    <TH>What happened</TH>
                    <TH className="text-right">Result</TH>
                  </tr>
                </THead>
                <tbody>
                  {check.ruleHits.map((h) => (
                    <TR key={h.ruleId}>
                      <TD className="whitespace-nowrap">
                        <span className="font-mono text-xs text-muted">{h.ruleId}</span>{" "}
                        <span className="font-medium">{h.title}</span>
                      </TD>
                      <TD className="min-w-64 text-muted">{h.detail}</TD>
                      <TD className="text-right">
                        {h.passed ? <Badge tone="outline">Passed</Badge> : <Badge tone="accent">Failed</Badge>}
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
              <p className="mt-3 text-sm text-muted">
                Clear when all three pass. Review when S2 passes but S1 or S3 fails. Confusing when S2 fails, whatever the others say.
              </p>
            </TabsContent>
            <TabsContent value="json">
              <pre className="max-h-[28rem] overflow-auto rounded-md bg-surface-2 p-4 font-mono text-xs leading-relaxed">
                <code>{raw}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}

function SignColumn({ door, info, pMale, reads }: { door: string; info: SignInputInfo; pMale: number; reads: Gender }) {
  const title = signTitle(info, door);
  return (
    <div className="grid content-start gap-3 lg:gap-2">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">{door}</p>
      {/* lg: the sign is 20% of the window height wide (144 px at 720 px high, 180 px at 900),
          never wider than its column. Its height follows from the 5:6 shape. */}
      <SignImage src={info.imageUrl} alt={`${door}: ${title}`} className="lg:mx-auto lg:w-[20vh] lg:max-w-full" />
      <p className="truncate text-sm font-medium" title={title}>
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        Reads as <GenderTag gender={reads} />
        <span className="sr-only">room, compared with the other door</span>
      </div>
      <ThresholdBar
        value={pMale}
        threshold={0.5}
        label="P(male), this sign alone"
        valueText={pMale.toFixed(2)}
        thresholdLabel="0.50, where a sign judged alone would flip"
        tone={reads}
      />
    </div>
  );
}

function Meta({ icon: Icon, label, children, wide }: { icon: LucideIcon; label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn("grid gap-0.5", wide && "col-span-2")}>
      <dt className="inline-flex items-center gap-1.5 text-xs text-muted">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
