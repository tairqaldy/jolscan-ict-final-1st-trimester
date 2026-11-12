"use client";

import { ArrowRight, CircleCheck, ImageUp, LoaderCircle, RotateCcw, ScanSearch } from "lucide-react";
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { EmptyRoad } from "@/components/illustrations";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { SelectableTile } from "@/components/ui/selectable-tile";
import { Switch } from "@/components/ui/switch";
import { makeThumbnail, readImageSize, reencodeWithoutMetadata } from "@/lib/image";
import { SAMPLES, getSample, type Sample } from "@/lib/mock/samples";
import { timing } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { addToHistory } from "@/lib/store/history";
import { useHydrated } from "@/lib/store/local-store";
import { rulesStore, settingsStore } from "@/lib/store/settings";
import { ROAD_CLASSES, type RoadClass, type StoredAnalysis } from "@/lib/types";
import type { ApiError } from "@/lib/upload";
import { AnalysisView } from "./analysis-view";
import { PROVIDER_META } from "./provider-badge";

type Source =
  | { kind: "sample"; sample: Sample }
  | { kind: "file"; file: File; previewUrl: string; width: number; height: number };

type Status =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; error: ApiError["error"] }
  | { state: "done"; analysis: StoredAnalysis };

export function AnalyzeClient() {
  const params = useSearchParams();
  const settings = settingsStore.useStore();
  const reduce = useReducedMotionConfig();
  const initialSample = getSample(params.get("sample"));
  const [source, setSource] = useState<Source | null>(initialSample ? { kind: "sample", sample: initialSample } : null);
  const [roadClass, setRoadClass] = useState<RoadClass | "unknown">(initialSample?.meta.roadClass ?? "unknown");
  const [schoolZone, setSchoolZone] = useState(initialSample?.meta.schoolZone ?? false);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [fileError, setFileError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Free the preview URL when the source changes.
  const previewUrl = source?.kind === "file" ? source.previewUrl : null;
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const pickSample = (sample: Sample) => {
    setSource({ kind: "sample", sample });
    setRoadClass(sample.meta.roadClass);
    setSchoolZone(sample.meta.schoolZone);
    setStatus({ state: "idle" });
    setFileError(null);
  };

  // The Dropzone has already checked type and size with validateImageFile.
  const pickFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      const { width, height } = await readImageSize(url);
      setSource({ kind: "file", file, previewUrl: url, width, height });
      setRoadClass("unknown");
      setSchoolZone(false);
      setStatus({ state: "idle" });
      setFileError(null);
    } catch {
      URL.revokeObjectURL(url);
      setFileError("This file could not be opened as an image.");
    }
  };

  const analyze = async (provider = settings.provider) => {
    if (!source) return;
    if (provider === "cloud" && settings.keepPhotosLocal) {
      setStatus({
        state: "error",
        error: {
          code: "privacy",
          message: "Cloud is blocked because “Keep photos on this device only” is on.",
          hint: "Use the mock or local provider, or turn the option off in Settings.",
        },
      });
      return;
    }
    setStatus({ state: "loading" });
    const form = new FormData();
    form.set("provider", provider);
    form.set("rules", JSON.stringify(rulesStore.get()));
    if (roadClass !== "unknown") form.set("roadClass", roadClass);
    form.set("schoolZone", String(schoolZone));

    let thumbnail: string | undefined;
    if (source.kind === "sample") {
      form.set("sampleId", source.sample.id);
    } else {
      const file = settings.stripGps ? await reencodeWithoutMetadata(source.file) : source.file;
      form.set("file", file, file.name);
      form.set("imageWidth", String(source.width));
      form.set("imageHeight", String(source.height));
      thumbnail = await makeThumbnail(source.file);
    }

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body || body.error) {
        setStatus({
          state: "error",
          error: body?.error ?? { code: `http_${res.status}`, message: `The server answered with HTTP ${res.status}.` },
        });
        return;
      }
      const analysis = body as StoredAnalysis;
      if (thumbnail) analysis.photo.imageUrl = thumbnail;
      addToHistory(analysis);
      setStatus({ state: "done", analysis });
      // Focus the result and line its top up with the top of the screen, so the photo and
      // the priority are in view. A plain focus() centres the whole result, rules table included.
      requestAnimationFrame(() => {
        resultRef.current?.focus({ preventScroll: true });
        resultRef.current?.scrollIntoView({ block: "start" });
      });
    } catch {
      setStatus({
        state: "error",
        error: { code: "network", message: "Could not reach the app server.", hint: "Check that the app is still running." },
      });
    }
  };

  const reset = () => {
    setSource(null);
    setStatus({ state: "idle" });
    setFileError(null);
  };

  const previewImage = source?.kind === "sample" ? source.sample.file : source?.previewUrl;
  const providerMeta = PROVIDER_META[settings.provider];
  const hydrated = useHydrated();
  // The sample photos are SVG drawings with fixed boxes: only the mock provider can read them (a real model refuses them).
  const realModel = hydrated && settings.provider !== "mock";
  const drawingPicked = realModel && source?.kind === "sample";

  // G-75: a live region that stays mounted while the view switches to the result,
  // so screen readers announce the save (a region that mounts with its text is often skipped).
  const withSavedStatus = (view: ReactNode) => (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {status.state === "done" ? "Analysis saved to this browser." : ""}
      </p>
      {view}
    </>
  );

  if (status.state === "done") {
    return withSavedStatus(
      // scroll-mt keeps a gap above the result; below lg the html scroll-padding in globals.css clears the sticky top bar.
      // key: the result gets its own element instead of reusing the form's grid, so nothing shifts as it appears (G-75).
      <div key="result" ref={resultRef} tabIndex={-1} className="grid scroll-mt-4 gap-5 outline-none lg:scroll-mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            <CircleCheck className="saved-tick mr-1.5 inline size-4 align-middle text-accent-ink" aria-hidden />
            Analysis saved to this browser.{" "}
            <Link href={`/app/roads/reports/${status.analysis.id}`} className="font-medium text-accent-ink underline underline-offset-2">
              Open as report
            </Link>
          </p>
          <Button variant="secondary" onClick={reset}>
            <RotateCcw aria-hidden /> Analyze another photo
          </Button>
        </div>
        <AnalysisView
          analysis={status.analysis}
          title={source?.kind === "sample" ? source.sample.title : source?.file.name}
          reveal
        />
      </div>,
    );
  }

  return withSavedStatus(
    <div key="form" className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      {/* Left: photo */}
      <div className="grid content-start gap-4">
        {previewImage ? (
          <figure
            className="relative overflow-hidden rounded-lg border border-border bg-surface-3"
            style={{
              aspectRatio:
                source?.kind === "file" ? `${source.width} / ${source.height}` : `${source?.sample.imageWidth} / ${source?.sample.imageHeight}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="Selected road photo" className="absolute inset-0 size-full object-cover" />
            <AnimatePresence>
              {status.state === "loading" && (
                <motion.div
                  className="absolute inset-0 bg-inverse/25"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {!reduce && (
                    // The scan line sits at the top of a photo-sized layer that moves by
                    // transform (100 % of its own height = the photo), not by `top`, so the
                    // sweep looks the same and causes no layout work (motion grill).
                    <motion.div
                      className="absolute inset-0"
                      initial={{ y: "0%" }}
                      animate={{ y: ["0%", "100%", "0%"] }}
                      transition={{ duration: timing.scanSweep, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="h-1 bg-accent shadow-lg" />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </figure>
        ) : (
          <EmptyState icon={ImageUp} illustration={<EmptyRoad />} title="No photo selected">
            Drop a road photo below or pick one of the sample photos. Results appear here.
          </EmptyState>
        )}

        <Dropzone
          title="Drop a photo here, or click to choose"
          onFile={pickFile}
          onReject={setFileError}
          invalid={fileError !== null}
        />
        {fileError && (
          <Callout tone="danger" title="That file cannot be used">
            {fileError}
          </Callout>
        )}

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Or use a sample photo</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SAMPLES.map((s) => {
              const selected = source?.kind === "sample" && source.sample.id === s.id;
              return (
                <SelectableTile
                  key={s.id}
                  selected={selected}
                  disabled={realModel && !selected}
                  onClick={() => pickSample(s)}
                  className="group overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.file} alt="" className="aspect-video w-full object-cover" loading="lazy" />
                  <span className="block px-2 py-1.5 text-xs leading-snug font-medium">{s.title}</span>
                </SelectableTile>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">
            {realModel
              ? `Samples are drawings that only the Mock provider can read. With ${providerMeta.label}, drop a real road photo above.`
              : "Samples are drawings, not real photos; the Mock provider returns fixed boxes for them."}
          </p>
        </fieldset>
      </div>

      {/* Right: metadata and run */}
      <div className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Photo details</CardTitle>
              <CardDescription>Optional. The rules use them to weigh risk.</CardDescription>
            </div>
          </CardHeader>
          <CardBody className="grid gap-5">
            <Select
              label="Road class"
              value={roadClass}
              onValueChange={(v) => setRoadClass(v as RoadClass | "unknown")}
              options={[
                { value: "unknown", label: "Not set (scored as residential)" },
                ...ROAD_CLASSES.map((r) => ({ value: r, label: r[0].toUpperCase() + r.slice(1) })),
              ]}
            />
            <Switch
              label="School zone"
              description="Adds the R6 bonus after the road-class multiplier."
              checked={schoolZone}
              onCheckedChange={setSchoolZone}
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="grid gap-4">
            <div className={cn("flex items-start gap-3 text-sm", !hydrated && "invisible")}>
              <providerMeta.icon className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
              <p>
                <span className="font-medium">{providerMeta.label} provider.</span>{" "}
                <span className="text-muted">{providerMeta.description}</span>{" "}
                <Link href="/app/settings" className="text-accent-ink underline underline-offset-2">
                  Change
                </Link>
              </p>
            </div>
            <Button size="lg" disabled={!source || drawingPicked || status.state === "loading"} onClick={() => void analyze()}>
              {status.state === "loading" ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden /> Analysing…
                </>
              ) : (
                <>
                  <ScanSearch aria-hidden /> Analyze photo
                </>
              )}
            </Button>
            <p className="sr-only" aria-live="polite">
              {status.state === "loading" ? `Running the ${providerMeta.label} model` : ""}
            </p>
            {!source && <p className="text-center text-xs text-muted">Choose a photo first.</p>}
            {drawingPicked && (
              <p className="text-center text-xs text-muted">
                This sample is a drawing, which only Mock can read. Drop a real photo, or switch to Mock in{" "}
                <Link href="/app/settings" className="text-accent-ink underline underline-offset-2">
                  Settings
                </Link>
                .
              </p>
            )}
          </CardBody>
        </Card>

        {status.state === "error" && (
          <Callout
            tone="danger"
            title={status.error.message}
            action={
              <>
                <Button size="sm" variant="secondary" onClick={() => void analyze()}>
                  <RotateCcw aria-hidden /> Try again
                </Button>
                {settings.provider !== "mock" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      settingsStore.set((s) => ({ ...s, provider: "mock" }));
                      void analyze("mock");
                    }}
                  >
                    Switch the app to Mock <ArrowRight aria-hidden />
                  </Button>
                )}
              </>
            }
          >
            {status.error.hint && <p>{status.error.hint}</p>}
            <p className="mt-1 font-mono text-xs">code: {status.error.code}</p>
          </Callout>
        )}

        <ButtonLink href="/app/roads/rules" variant="ghost" className="justify-start">
          How is the priority calculated? <ArrowRight aria-hidden />
        </ButtonLink>
      </div>
    </div>,
  );
}
