"use client";

import { CircleCheck, CircleX, LoaderCircle, Search, Trophy } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ResultProvenanceBadge } from "@/components/app/demo-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BlankSigns } from "@/components/illustrations";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { RESTROOM_SAMPLES, getRestroomSample, truePartner } from "@/lib/mock/restroom-samples";
import { oppositeGender } from "@/lib/signage";
import { settingsStore, signageRulesStore } from "@/lib/store/settings";
import type { Provider, WebMatchResult } from "@/lib/types";
import type { ApiError } from "@/lib/upload";
import { ProviderErrorCallout, ProviderLine } from "./provider-error";
import { GenderTag, SignImage } from "./signage-bits";
import { SignSlot, type SlotValue } from "./sign-slot";
import { appendSign, cloudBlocked, postRestroom, useRevokePreviews } from "./use-sign-upload";

const REAL_SAMPLE_COUNT = RESTROOM_SAMPLES.filter((s) => !s.file.endsWith(".svg")).length;

type Status =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; error: ApiError["error"] }
  | { state: "done"; result: WebMatchResult; queryUrl?: string; querySampleId?: string };

export function MatchClient() {
  const params = useSearchParams();
  const settings = settingsStore.useStore();
  const rules = signageRulesStore.useStore();
  const [query, setQuery] = useState<SlotValue | null>(() => {
    const s = getRestroomSample(params.get("q"));
    return s ? { kind: "sample", sample: s } : null;
  });
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const resultRef = useRef<HTMLDivElement>(null);
  useRevokePreviews([query]);

  const run = async (provider: Provider = settings.provider) => {
    if (!query) return;
    if (provider === "cloud" && settings.keepPhotosLocal) {
      setStatus({ state: "error", error: cloudBlocked });
      return;
    }
    setStatus({ state: "loading" });
    const form = new FormData();
    form.set("mode", "match");
    form.set("provider", provider);
    const info = await appendSign(form, query, "query", "sampleQuery", settings);
    const res = await postRestroom<WebMatchResult>(form);
    if (!res.ok) {
      setStatus({ state: "error", error: res.error });
      return;
    }
    setStatus({ state: "done", result: res.body, queryUrl: info.imageUrl, querySampleId: info.sampleId });
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  return (
    <div className="grid gap-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Query sign</CardTitle>
              <CardDescription>
                One door sign. The gallery is the {RESTROOM_SAMPLES.length} bundled samples, minus this one. Local and Cloud rank
                only the {REAL_SAMPLE_COUNT} real signs: a real model cannot read the drawings.
              </CardDescription>
            </div>
          </CardHeader>
          <CardBody className="grid gap-4">
            <div className="mx-auto w-full max-w-56">
              <SignSlot
                label="Query"
                value={query}
                onChange={(v) => {
                  setQuery(v);
                  setStatus({ state: "idle" });
                }}
                disabled={status.state === "loading"}
              />
            </div>
            <ProviderLine provider={settings.provider} />
            <Button size="lg" disabled={!query || status.state === "loading"} onClick={() => void run()}>
              {status.state === "loading" ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden /> Searching…
                </>
              ) : (
                <>
                  <Search aria-hidden /> Find the counterpart
                </>
              )}
            </Button>
            <p className="sr-only" aria-live="polite">
              {status.state === "loading" ? "Ranking the gallery" : ""}
            </p>
            {status.state === "error" && (
              <ProviderErrorCallout error={status.error} provider={settings.provider} onRetry={(p) => void run(p)} />
            )}
          </CardBody>
        </Card>

        <Callout title="This is the IOAI 2025 task">
          <p>
            “Restroom Icon Matching” from the International Olympiad in AI: given one sign, find the sign of the{" "}
            <strong className="text-fg">opposite gender</strong> from the <strong className="text-fg">same restroom</strong>.
            The model turns every sign into an embedding, ranks the gallery by similarity, and the answer is the most similar
            sign whose predicted gender is opposite to the query’s. Scored as top-1 accuracy: the share of queries whose
            answer is the true partner.
          </p>
          <p className="mt-2">
            Similarity is the cosine of two embeddings scaled to 0..1, <span className="font-mono">(cos + 1) / 2</span>. On
            the sample set, two signs of one design set score high and signs from different sets score lower.
          </p>
        </Callout>
      </div>

      <section aria-labelledby="ranked-h" className="grid gap-4">
        <h2 id="ranked-h" className="text-2xl font-bold">
          Ranked gallery
        </h2>
        <div ref={resultRef} tabIndex={-1} className="outline-none">
          {status.state === "done" ? (
            <MatchResultView result={status.result} queryUrl={status.queryUrl} querySampleId={status.querySampleId} s3={rules.s3.minSimilarity} />
          ) : status.state === "loading" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-56" />
              ))}
            </div>
          ) : (
            <EmptyState icon={Search} illustration={<BlankSigns />} title="Nothing ranked yet">
              Choose a query sign and press Find the counterpart. Every gallery sign appears here, most similar first, with
              the best match highlighted.
            </EmptyState>
          )}
        </div>
      </section>
    </div>
  );
}

function MatchResultView({
  result,
  queryUrl,
  querySampleId,
  s3,
}: {
  result: WebMatchResult;
  queryUrl?: string;
  querySampleId?: string;
  s3: number;
}) {
  const querySample = getRestroomSample(querySampleId);
  const partner = querySample ? truePartner(querySample) : undefined;
  const best = result.candidates.find((c) => c.id === result.bestMatchId);
  const bestSample = getRestroomSample(best?.id);
  const correct = partner && best ? partner.id === best.id : null;
  const want = oppositeGender(result.query.gender);
  const raw = useMemo(() => JSON.stringify(result, null, 2), [result]);

  return (
    <div className="grid gap-6">
      <ResultProvenanceBadge result={result} className="justify-self-start" />
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardBody className="flex gap-4">
            <SignImage src={queryUrl} alt={querySample?.title ?? "Query sign"} className="w-28 shrink-0" />
            <div className="grid content-start gap-2">
              <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Query</p>
              <p className="font-medium">{querySample?.title ?? result.queryInput.fileName ?? "Uploaded sign"}</p>
              <p className="text-sm text-muted">
                Read as <GenderTag gender={result.query.gender} confidence={result.query.confidence} />, so the answer must be{" "}
                {want}.
              </p>
            </div>
          </CardBody>
        </Card>
        <Card className="border-2 border-accent">
          <CardBody className="flex gap-4">
            <SignImage src={bestSample?.file} alt={bestSample?.title ?? "Best match"} className="w-28 shrink-0" />
            <div className="grid content-start gap-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-accent-ink uppercase">
                <Trophy className="size-3.5" aria-hidden /> Best match
              </p>
              {best && bestSample ? (
                <>
                  <p className="font-medium">{bestSample.title}</p>
                  <p className="tabular text-sm text-muted">
                    Similarity <span className="font-mono font-semibold text-fg">{best.similarity.toFixed(2)}</span>, rank{" "}
                    {result.candidates.indexOf(best) + 1} of {result.candidates.length}
                  </p>
                  {correct !== null && (
                    <p className={cn("inline-flex items-center gap-1.5 text-sm font-medium", correct ? "text-verdict-clear-ink" : "text-verdict-confusing-ink")}>
                      {correct ? <CircleCheck className="size-4" aria-hidden /> : <CircleX className="size-4" aria-hidden />}
                      {correct ? "Correct: the other door of the same set" : `Wrong: the true partner is “${partner!.title}”`}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted">No gallery sign was read as {want}, so there is no answer.</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" aria-label="Gallery, most similar first">
        {result.candidates.map((c, i) => {
          const s = getRestroomSample(c.id);
          const isBest = c.id === result.bestMatchId;
          const skipped = c.prediction.gender === result.query.gender;
          return (
            <li
              key={c.id}
              className={cn(
                "grid content-start gap-2 rounded-lg border bg-surface p-2.5",
                isBest ? "border-2 border-accent shadow-md" : "border-border",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="tabular font-display text-lg font-bold text-subtle">#{i + 1}</span>
                {isBest && (
                  <Badge tone="accent">
                    <Trophy aria-hidden /> Best
                  </Badge>
                )}
                {c.id === partner?.id && !isBest && <Badge tone="outline">True partner</Badge>}
              </div>
              <SignImage src={s?.file} alt={s?.title ?? `Candidate ${c.id}`} className={cn(skipped && "opacity-60")} />
              <p className="truncate text-xs font-medium" title={s?.title}>
                {s?.title ?? c.id}
              </p>
              <GenderTag gender={c.prediction.gender} confidence={c.prediction.confidence} className="w-fit" />
              <div className="grid gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Similarity</span>
                  <span className="tabular font-mono font-semibold">{c.similarity.toFixed(2)}</span>
                </div>
                <div className="relative h-1.5 rounded-full bg-surface-3" aria-hidden>
                  <span className="absolute inset-y-0 left-0 rounded-full bg-inverse" style={{ width: `${c.similarity * 100}%` }} />
                  <span className="absolute -top-0.5 -bottom-0.5 w-px bg-fg" style={{ left: `${s3 * 100}%` }} />
                </div>
              </div>
              {skipped && <p className="text-xs text-subtle">Same gender as the query: not a candidate answer</p>}
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-muted">
        The thin line on each bar is the S3 similarity threshold ({s3.toFixed(2)}) from the restroom rules, for reference. Matching
        itself only ranks; it has no threshold.
      </p>

      <details className="rounded-lg border border-border bg-surface p-4 text-sm">
        <summary className="cursor-pointer font-medium">Raw JSON</summary>
        <pre className="mt-3 max-h-[24rem] overflow-auto rounded-md bg-surface-2 p-4 font-mono text-xs leading-relaxed">
          <code>{raw}</code>
        </pre>
      </details>
    </div>
  );
}
