"use client";

import { ArrowLeftRight, CircleCheck, GitCompareArrows, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BlankSigns } from "@/components/illustrations";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/input";
import { SelectableTile } from "@/components/ui/selectable-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { RESTROOM_PRESETS, getRestroomSample } from "@/lib/mock/restroom-samples";
import { VERDICT_META } from "@/lib/signage-ui";
import { addRestroomCheck } from "@/lib/store/restroom-history";
import { settingsStore, signageRulesStore } from "@/lib/store/settings";
import type { Provider, StoredSignageCheck } from "@/lib/types";
import type { ApiError } from "@/lib/upload";
import { CompareResultView } from "./compare-result";
import { ProviderErrorCallout, ProviderLine } from "./provider-error";
import { SignSlot, type SlotValue } from "./sign-slot";
import { appendSign, cloudBlocked, postRestroom, useRevokePreviews } from "./use-sign-upload";

type Status =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; error: ApiError["error"] }
  | { state: "done"; check: StoredSignageCheck };

const fromSample = (id: string | null): SlotValue | null => {
  const s = getRestroomSample(id);
  return s ? { kind: "sample", sample: s } : null;
};

export function CompareClient() {
  const params = useSearchParams();
  const settings = settingsStore.useStore();
  const [a, setA] = useState<SlotValue | null>(() => fromSample(params.get("a")));
  const [b, setB] = useState<SlotValue | null>(() => fromSample(params.get("b")));
  const [place, setPlace] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const resultRef = useRef<HTMLDivElement>(null);
  useRevokePreviews([a, b]);

  const activePreset = RESTROOM_PRESETS.find(
    (p) => a?.kind === "sample" && b?.kind === "sample" && a.sample.id === p.a && b.sample.id === p.b,
  );

  const setSlot = (which: "a" | "b") => (v: SlotValue | null) => {
    (which === "a" ? setA : setB)(v);
    setStatus({ state: "idle" });
  };

  const run = async (provider: Provider = settings.provider) => {
    if (!a || !b) return;
    if (provider === "cloud" && settings.keepPhotosLocal) {
      setStatus({ state: "error", error: cloudBlocked });
      return;
    }
    setStatus({ state: "loading" });
    const form = new FormData();
    form.set("mode", "compare");
    form.set("provider", provider);
    form.set("rules", JSON.stringify(signageRulesStore.get()));
    if (place.trim()) form.set("place", place.trim());
    const [infoA, infoB] = await Promise.all([
      appendSign(form, a, "a", "sampleA", settings),
      appendSign(form, b, "b", "sampleB", settings),
    ]);
    const res = await postRestroom<StoredSignageCheck>(form);
    if (!res.ok) {
      setStatus({ state: "error", error: res.error });
      return;
    }
    // Keep the thumbnails (uploads) in this browser's copy only.
    const check = { ...res.body, inputs: { a: { ...res.body.inputs.a, imageUrl: infoA.imageUrl }, b: { ...res.body.inputs.b, imageUrl: infoB.imageUrl } } };
    addRestroomCheck(check);
    setStatus({ state: "done", check });
    // Focus the result and line its top up with the top of the screen, so both signs and
    // the verdict are in view. A plain focus() centres the whole result, rules table included.
    requestAnimationFrame(() => {
      resultRef.current?.focus({ preventScroll: true });
      resultRef.current?.scrollIntoView({ block: "start" });
    });
  };

  const swap = () => {
    setA(b);
    setB(a);
    setStatus({ state: "idle" });
  };

  return (
    <div className="grid gap-8">
      <section aria-labelledby="presets-h" className="grid gap-3">
        <h2 id="presets-h" className="text-sm font-medium">
          Try an example pair
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {RESTROOM_PRESETS.map((p) => {
            const pa = getRestroomSample(p.a)!;
            const pb = getRestroomSample(p.b)!;
            const on = activePreset?.id === p.id;
            return (
              <li key={p.id}>
                <SelectableTile
                  selected={on}
                  onClick={() => {
                    setA({ kind: "sample", sample: pa });
                    setB({ kind: "sample", sample: pb });
                    setStatus({ state: "idle" });
                  }}
                  title={p.ref}
                  className="flex h-full w-full items-center gap-3 p-2.5 pr-9 lg:flex-col lg:items-start lg:gap-2 lg:pr-2.5"
                >
                  <span className="flex shrink-0 gap-1" aria-hidden>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pa.file} alt="" className="h-12 w-10 object-contain" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pb.file} alt="" className="h-12 w-10 object-contain" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm leading-snug font-semibold">{p.title}</span>
                    <span className="block text-xs leading-snug text-muted">{p.note}</span>
                  </span>
                </SelectableTile>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>The two door signs</CardTitle>
              <CardDescription>Usually the two doors of one restroom. Icons only: never upload photos with people in them.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={swap} disabled={!a && !b}>
              <ArrowLeftRight aria-hidden /> Swap
            </Button>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-4 sm:gap-6">
            <SignSlot label="Door A" value={a} onChange={setSlot("a")} disabled={status.state === "loading"} />
            <SignSlot label="Door B" value={b} onChange={setSlot("b")} disabled={status.state === "loading"} />
          </CardBody>
        </Card>

        <div className="grid content-start gap-4">
          <Card>
            <CardBody className="grid gap-4">
              <Field
                label="Where is this restroom? (optional)"
                placeholder="e.g. Library, floor 2"
                value={place}
                maxLength={80}
                onChange={(e) => setPlace(e.target.value)}
              />
              <ProviderLine provider={settings.provider} />
              <Button size="lg" disabled={!a || !b || status.state === "loading"} onClick={() => void run()}>
                {status.state === "loading" ? (
                  <>
                    <LoaderCircle className="animate-spin" aria-hidden /> Comparing…
                  </>
                ) : (
                  <>
                    <GitCompareArrows aria-hidden /> Compare signs
                  </>
                )}
              </Button>
              <p className="sr-only" aria-live="polite">
                {status.state === "loading"
                  ? "Comparing the two signs"
                  : status.state === "done"
                    ? `Verdict: ${VERDICT_META[status.check.verdict].label}. Saved to this browser.`
                    : ""}
              </p>
              {(!a || !b) && <p className="text-center text-xs text-muted">Choose two signs first.</p>}
            </CardBody>
          </Card>
          {status.state === "error" && (
            <ProviderErrorCallout error={status.error} provider={settings.provider} onRetry={(p) => void run(p)} />
          )}
          <ButtonLink href="/app/restrooms/rules" variant="ghost" className="justify-start">
            How is the verdict decided?
          </ButtonLink>
        </div>
      </div>

      <section aria-labelledby="result-h" className="grid gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="result-h" className="text-2xl font-bold">
            Result
          </h2>
          {status.state === "done" ? (
            <p className="text-sm text-muted">
              <CircleCheck className="saved-tick mr-1.5 inline size-4 align-middle text-accent-ink" aria-hidden />
              Saved to this browser.{" "}
              <Link href={`/app/restrooms/checks/${status.check.id}`} className="font-medium text-accent-ink underline underline-offset-2">
                Open as a page
              </Link>
            </p>
          ) : (
            // Holds the line's place, so on a phone (where it wraps under the
            // heading) the result does not jump down when it appears (motion grill).
            <p className="invisible text-sm" aria-hidden>
              <span className="mr-1.5 inline-block size-4 align-middle" />
              Saved to this browser. Open as a page
            </p>
          )}
        </div>
        {/* scroll-mt keeps a gap above the result; below lg the html scroll-padding in globals.css clears the sticky top bar. */}
        <div ref={resultRef} tabIndex={-1} className="scroll-mt-4 outline-none">
          {status.state === "done" ? (
            <CompareResultView check={status.check} reveal />
          ) : status.state === "loading" ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" aria-hidden>
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          ) : (
            <EmptyState icon={GitCompareArrows} illustration={<BlankSigns />} title="No comparison yet">
              Pick an example pair above, or choose two signs, then press Compare signs. The verdict, both predictions and
              the rule checks appear here.
            </EmptyState>
          )}
        </div>
      </section>
    </div>
  );
}
