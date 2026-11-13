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
import experiments from "@/data/restroom-experiments.json";
import {
  IOAI_GALLERY_MAX,
  IOAI_LAYER_DISAGREE,
  IOAI_LAYER_METHODS,
  IOAI_MATCH_ACCURACY,
  IOAI_MATCH_METHODS,
  IOAI_TRAINED_ON,
  SERVED_METHOD,
  ioaiPicks,
  type IoaiMatchMethod,
} from "@/lib/mock/restroom-ioai-match";
import { RESTROOM_IOAI_CATALOGUE, RESTROOM_IOAI_GROUPS, RESTROOM_SAMPLES, getRestroomSample, truePartner, type RestroomSample } from "@/lib/mock/restroom-samples";
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

  const run = async (provider: Provider = settings.provider, q: SlotValue | null = query) => {
    if (!q) return;
    if (provider === "cloud" && settings.keepPhotosLocal) {
      setStatus({ state: "error", error: cloudBlocked });
      return;
    }
    setStatus({ state: "loading" });
    const form = new FormData();
    form.set("mode", "match");
    form.set("provider", provider);
    const info = await appendSign(form, q, "query", "sampleQuery", settings);
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
                One door sign. The model ranks the other signs and picks the closest one of the other gender: up to{" "}
                {IOAI_GALLERY_MAX} signs from the same IOAI set for an IOAI sign, the other bundled samples for a sample (on
                Local and Cloud only the {REAL_SAMPLE_COUNT} real ones, because a real model cannot read the drawings).
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

        <BestPairPanel status={status} />
      </div>

      {status.state === "done" && ioaiPicks(status.querySampleId) && (
        <ModelComparison
          querySampleId={status.querySampleId!}
          onTry={(sample) => {
            const v: SlotValue = { kind: "sample", sample };
            setQuery(v);
            window.scrollTo({ top: 0 });
            void run(settings.provider, v);
          }}
        />
      )}

      <section aria-labelledby="ranked-h" className="grid gap-4">
        <h2 id="ranked-h" className="text-2xl font-bold">
          Ranked gallery
        </h2>
        <div ref={resultRef} tabIndex={-1} className="outline-none">
          {status.state === "done" ? (
            <MatchResultView result={status.result} querySampleId={status.querySampleId} s3={rules.s3.minSimilarity} />
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

        <Callout title="This is the IOAI 2025 task">
          <p>
            “Restroom Icon Matching” from the International Olympiad in AI: given one sign, find the sign of the{" "}
            <strong className="text-fg">opposite gender</strong> from the <strong className="text-fg">same restroom</strong>.
            The gallery is ranked by similarity of the embeddings. With the <strong className="text-fg">local or cloud</strong>{" "}
            model service the answer comes from our two-step pipeline: SIFT and a pixel check find the original a cropped
            query was cut from, then colour and CLIP similarity pick the other door; the predicted genders are shown but not
            used. The <strong className="text-fg">mock</strong> provider keeps the simple rule: the most similar sign whose
            predicted gender is opposite to the query’s. Scored as top-1 accuracy: the share of queries whose answer is the
            true partner.
          </p>
          <p className="mt-2">
            Similarity is the cosine of two embeddings scaled to 0..1, <span className="font-mono">(cos + 1) / 2</span>. On
            the sample set, two signs of one design set score high and signs from different sets score lower.
          </p>
        </Callout>
    </div>
  );
}

function MatchResultView({
  result,
  querySampleId,
  s3,
}: {
  result: WebMatchResult;
  querySampleId?: string;
  s3: number;
}) {
  const querySample = getRestroomSample(querySampleId);
  const partner = querySample ? truePartner(querySample) : undefined;
  const genderRule = usesGenderRule(result, querySampleId);
  const raw = useMemo(() => JSON.stringify(result, null, 2), [result]);

  return (
    <div className="grid gap-6">
      <ResultProvenanceBadge result={result} className="justify-self-start" />

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" aria-label="Gallery, most similar first">
        {result.candidates.map((c, i) => {
          const s = getRestroomSample(c.id);
          const isBest = c.id === result.bestMatchId;
          // Only the mock rule filters by predicted gender; the model service's pipeline does not.
          const skipped = genderRule && c.prediction.gender === result.query.gender;
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

      <details className="rounded-lg border border-border bg-surface p-(--card-pad) text-sm">
        <summary className="cursor-pointer font-medium">Raw JSON</summary>
        <pre className="mt-3 max-h-[24rem] overflow-auto rounded-md bg-surface-2 p-4 font-mono text-xs leading-relaxed">
          <code>{raw}</code>
        </pre>
      </details>
    </div>
  );
}

/** The mock rule filters by predicted gender; the model service, and the mock for IOAI signs, use the pipeline. */
function usesGenderRule(result: WebMatchResult, querySampleId?: string) {
  return result.provider === "mock" && !ioaiPicks(querySampleId);
}

/** Right column: the best pair the model found, side by side, or what will appear there. */
function BestPairPanel({ status }: { status: Status }) {
  if (status.state === "loading") return <Skeleton className="min-h-80" />;
  if (status.state !== "done") {
    return (
      <Card className="grid">
        <CardBody className="grid place-items-center gap-3 text-center">
          <Trophy className="size-8 text-subtle" aria-hidden />
          <p className="text-lg font-semibold">The best pair appears here</p>
          <p className="max-w-sm text-sm text-muted">
            Choose a query sign and press Find the counterpart: the query and the door the model picks as its other half are
            shown side by side, with the similarity and whether it is the true partner.
          </p>
        </CardBody>
      </Card>
    );
  }
  const { result, queryUrl, querySampleId } = status;
  const querySample = getRestroomSample(querySampleId);
  const partner = querySample ? truePartner(querySample) : undefined;
  const best = result.candidates.find((c) => c.id === result.bestMatchId);
  const bestSample = getRestroomSample(best?.id);
  const correct = partner && best ? partner.id === best.id : null;
  const genderRule = usesGenderRule(result, querySampleId);
  return (
    <Card className="border-2 border-accent">
      <CardHeader>
        <div>
          <CardTitle className="inline-flex items-center gap-2">
            <Trophy className="size-5 text-accent-ink" aria-hidden /> Best pair
          </CardTitle>
          <CardDescription>
            {genderRule
              ? "Mock rule: the most similar sign whose predicted gender is opposite to the query's."
              : "Two-step pipeline: the most similar sign by colour and CLIP; predicted genders are not used."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardBody className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <figure className="grid content-start gap-2">
            <SignImage src={queryUrl} alt={querySample?.title ?? "Query sign"} />
            <figcaption className="grid gap-1 text-sm">
              <span className="eyebrow text-muted">Query</span>
              <span className="font-medium">{querySample?.title ?? result.queryInput.fileName ?? "Uploaded sign"}</span>
              <GenderTag gender={result.query.gender} confidence={result.query.confidence} className="w-fit" />
            </figcaption>
          </figure>
          <figure className="grid content-start gap-2">
            <SignImage src={bestSample?.file} alt={bestSample?.title ?? "Best match"} className={cn(best && "border-accent")} />
            <figcaption className="grid gap-1 text-sm">
              <span className="eyebrow text-accent-ink">Its other door</span>
              {best && bestSample ? (
                <>
                  <span className="font-medium">{bestSample.title}</span>
                  <GenderTag gender={best.prediction.gender} confidence={best.prediction.confidence} className="w-fit" />
                </>
              ) : (
                <span className="text-muted">No answer: no gallery sign qualified.</span>
              )}
            </figcaption>
          </figure>
        </div>
        {best && (
          <p className="tabular text-sm text-muted">
            Similarity <span className="font-mono font-semibold text-fg">{best.similarity.toFixed(2)}</span>, rank{" "}
            {result.candidates.indexOf(best) + 1} of {result.candidates.length} by similarity · {result.model}
          </p>
        )}
        {correct !== null && (
          <p className={cn("inline-flex items-center gap-1.5 text-sm font-medium", correct ? "text-verdict-clear-ink" : "text-verdict-confusing-ink")}>
            {correct ? <CircleCheck className="size-4" aria-hidden /> : <CircleX className="size-4" aria-hidden />}
            {correct ? "Correct: the other door of the same restroom" : `Wrong: the true partner is “${partner!.title}”`}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

type LayerSweepRow = { backbone: string; n_trained: number; pair_top1_heldout_vs_all164: number; gender_acc_heldout: number; best: boolean };
const CLIP_SWEEP = ((experiments as { layers?: LayerSweepRow[] }).layers ?? []).filter((r) => r.backbone === "clip");

/** For an IOAI sign: the sign each of our models picks from the same gallery, precomputed offline. */
function ModelComparison({ querySampleId, onTry }: { querySampleId: string; onTry: (sample: RestroomSample) => void }) {
  const picks = ioaiPicks(querySampleId)!;
  const query = getRestroomSample(querySampleId);
  const partner = query ? truePartner(query) : undefined;
  const group = RESTROOM_IOAI_CATALOGUE.find((s) => s.id === querySampleId)?.group ?? "val";
  const groupLabel = RESTROOM_IOAI_GROUPS.find((g) => g.id === group)?.label ?? group;
  const seen = group === IOAI_TRAINED_ON;
  const zero = CLIP_SWEEP.find((r) => r.n_trained === 0);
  const best = CLIP_SWEEP.find((r) => r.best);
  const all = CLIP_SWEEP.find((r) => r.n_trained === 12);
  const hard = [...(IOAI_LAYER_DISAGREE.val ?? []), ...(IOAI_LAYER_DISAGREE.test ?? []), ...(IOAI_LAYER_DISAGREE.train ?? []).slice(0, 4)]
    .map((id) => getRestroomSample(id))
    .filter((s): s is RestroomSample => !!s && s.id !== querySampleId);
  const card = (m: IoaiMatchMethod, compact = false) => {
    const pick = getRestroomSample(picks[m.id]);
    const right = pick && partner ? pick.id === partner.id : false;
    const acc = IOAI_MATCH_ACCURACY[m.id]?.[group];
    const served = m.id === SERVED_METHOD;
    return (
      <li key={m.id} className={cn("grid content-start gap-2 rounded-lg border bg-surface p-3", served ? "border-2 border-accent" : "border-border")}>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-sm font-semibold">{m.id}</span>
          {served && <Badge tone="accent">served</Badge>}
          {m.trained && <Badge tone="outline">fine-tuned by us</Badge>}
        </div>
        <p className="text-sm font-medium leading-snug">{m.label}</p>
        <SignImage src={pick?.file} alt={pick?.title ?? "No pick"} />
        {!compact && <p className="text-xs text-muted">{pick ? pick.title : "No answer"}</p>}
        <p className={cn("inline-flex items-center gap-1 text-sm font-medium", right ? "text-verdict-clear-ink" : "text-verdict-confusing-ink")}>
          {right ? <CircleCheck className="size-4" aria-hidden /> : <CircleX className="size-4" aria-hidden />}
          {right ? "true partner" : "wrong"}
        </p>
        {acc !== undefined && (
          <p className="tabular text-xs text-muted">
            {Math.round(acc * 100)}% right on this set{m.trained && seen ? " (seen in training)" : ""}
          </p>
        )}
        {!compact && <p className="text-xs text-subtle">{m.detail}</p>}
      </li>
    );
  };
  return (
    <section aria-labelledby="models-h" className="grid gap-6">
      <div className="grid gap-4">
        <div>
          <h2 id="models-h" className="text-2xl font-bold">
            What each of our models picks
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            The same query and the same gallery (its true partner and up to {IOAI_GALLERY_MAX - 1} other signs of the {groupLabel}{" "}
            set), answered by each model we built. Real outputs computed offline by <code>ml/restroom/export_match.py</code>.
            The share is how often the model finds the true partner over every sign of this set.
          </p>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            <span className="font-medium text-fg">Fine-tuned by us</span> means we trained the CLIP weights ourselves, on the 82
            IOAI training restrooms. The other models use CLIP as OpenAI released it, plus our own rules or colour scores.
            {seen
              ? " This query is a training sign, so the fine-tuned models have seen its answer: pick a validation or test sign to see how they do on new restrooms."
              : " This query comes from a restroom no model was trained on."}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{IOAI_MATCH_METHODS.map((m) => card(m))}</ul>
      </div>

      <div className="grid gap-4">
        <div>
          <h3 className="text-xl font-bold">Same CLIP, different number of trained layers</h3>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            CLIP ViT-B/32 has 12 transformer blocks. Each model below was fine-tuned with only its last N blocks unfrozen (the
            recipe of R4), on the same 82 training restrooms; 0 blocks is zero-shot CLIP. On whole signs with a gallery from one
            set the task is easy: once any block is trained, almost every partner is found. The number of layers matters in the
            harder IOAI setting, a cropped query against all 164 originals on restrooms held out of training
            {zero && best && all
              ? `: ${zero.pair_top1_heldout_vs_all164.toFixed(2)} with 0 blocks, ${best.pair_top1_heldout_vs_all164.toFixed(2)} with ${best.n_trained}, ${all.pair_top1_heldout_vs_all164.toFixed(2)} with all 12, while gender accuracy falls from ${zero.gender_acc_heldout.toFixed(2)} to ${all.gender_acc_heldout.toFixed(2)}`
              : ""}
            . That sweep is the chart on the Restroom overview.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{IOAI_LAYER_METHODS.map((m) => card(m, true))}</ul>
        {hard.length > 0 && (
          <div className="grid gap-2">
            <p className="text-sm font-medium">Signs where at least one of these models is wrong. Try one:</p>
            <ul className="flex flex-wrap gap-2">
              {hard.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onTry(s)}
                    className="grid w-24 gap-1 rounded-md border border-border bg-surface p-1.5 text-left hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.file} alt="" className="aspect-[5/6] w-full object-contain" loading="lazy" />
                    <span className="text-[11px] leading-tight">{s.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
