"use client";

import { RotateCcw } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SliderField } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { formatScore, formatSla } from "@/lib/format";
import { MOCK_MODEL_NAME } from "@/lib/mock/analyses";
import { SAMPLES } from "@/lib/mock/samples";
import { buildAnalysis, DEFAULT_RULES, deriveDetections, RULE_TITLES, rescore, type RuleId, type RulesConfig } from "@/lib/rules";
import { rulesStore } from "@/lib/store/settings";
import { DetectionOverlay } from "./detection-overlay";

/** The six sample photos as analyses, scored with the defaults, for the live preview. */
const PREVIEWS = SAMPLES.map((s) =>
  buildAnalysis(
    {
      provider: "mock",
      model: MOCK_MODEL_NAME,
      imageWidth: s.imageWidth,
      imageHeight: s.imageHeight,
      latencyMs: s.mockLatencyMs,
      detections: s.detections,
    },
    s.meta,
    { id: `preview-${s.id}`, createdAt: "2026-01-01T00:00:00.000Z", photo: { sampleId: s.id, imageUrl: s.file } },
  ),
);

const DESCRIPTIONS: Record<RuleId, string> = {
  r1: "Detections at or above the threshold are counted. Between the review floor and the threshold they are not counted but flag the photo for a human look. Off: every detection counts.",
  r2: "Each counted detection adds points by size. Size is the box area as a share of the photo. Off: every detection is worth 1 point.",
  r3: "A detection whose centre is in the middle half of the photo width and the lower half (the driving path) has its points multiplied.",
  r4: "Several potholes together damage a segment faster. Adds a bonus once enough detections are counted.",
  r5: "Higher speed means higher risk. Multiplies the whole photo score by road class. Photos without a class count as residential.",
  r6: "Adds a fixed bonus after the road-class multiplier when the photo is in a school zone.",
};

export function RulesClient() {
  const rules = rulesStore.useStore();
  const [previewId, setPreviewId] = useState(PREVIEWS[0].id);
  const preview = PREVIEWS.find((p) => p.id === previewId)!;
  const current = useMemo(() => rescore(preview, rules), [preview, rules]);
  const derived = useMemo(() => deriveDetections(preview.detections, rules), [preview, rules]);
  const changed = JSON.stringify(rules) !== JSON.stringify(DEFAULT_RULES);

  const update = <K extends RuleId>(id: K, patch: Partial<RulesConfig[K]>) =>
    rulesStore.set((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="grid content-start gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {changed ? "You have changed the defaults. Changes are saved in this browser." : "Showing the team defaults from RULES.md."}
          </p>
          <Button variant="secondary" size="sm" onClick={() => rulesStore.reset()} disabled={!changed}>
            <RotateCcw aria-hidden /> Reset to defaults
          </Button>
        </div>

        <RuleCard id="r1" enabled={rules.r1.enabled} onToggle={(v) => update("r1", { enabled: v })}>
          <SliderField label="Threshold τ" value={rules.r1.threshold} min={0.25} max={0.95} step={0.01} onChange={(v) => update("r1", { threshold: v, reviewFloor: Math.min(rules.r1.reviewFloor, v) })} disabled={!rules.r1.enabled} />
          <SliderField label="Review floor" value={rules.r1.reviewFloor} min={0.05} max={rules.r1.threshold} step={0.01} onChange={(v) => update("r1", { reviewFloor: v })} disabled={!rules.r1.enabled} />
        </RuleCard>

        <RuleCard id="r2" enabled={rules.r2.enabled} onToggle={(v) => update("r2", { enabled: v })}>
          <div className="grid gap-4 sm:grid-cols-3">
            <SliderField label="Small" value={rules.r2.small} min={0} max={10} step={0.5} unit="pts" onChange={(v) => update("r2", { small: v })} disabled={!rules.r2.enabled} />
            <SliderField label="Medium" value={rules.r2.medium} min={0} max={10} step={0.5} unit="pts" onChange={(v) => update("r2", { medium: v })} disabled={!rules.r2.enabled} />
            <SliderField label="Large" value={rules.r2.large} min={0} max={10} step={0.5} unit="pts" onChange={(v) => update("r2", { large: v })} disabled={!rules.r2.enabled} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SliderField label="Small below" value={rules.r2.smallBelowPct} min={0.1} max={rules.r2.largeFromPct} step={0.1} unit="% of photo" onChange={(v) => update("r2", { smallBelowPct: v })} disabled={!rules.r2.enabled} />
            <SliderField label="Small detections add at most" value={rules.r2.smallCap} min={0} max={10} step={0.5} unit="pts" onChange={(v) => update("r2", { smallCap: v })} disabled={!rules.r2.enabled} />
            <SliderField label="Large from" value={rules.r2.largeFromPct} min={rules.r2.smallBelowPct} max={10} step={0.1} unit="% of photo" onChange={(v) => update("r2", { largeFromPct: v })} disabled={!rules.r2.enabled} />
          </div>
        </RuleCard>

        <RuleCard id="r3" enabled={rules.r3.enabled} onToggle={(v) => update("r3", { enabled: v })}>
          <SliderField label="Lane multiplier" value={rules.r3.multiplier} min={1} max={3} step={0.05} unit="×" onChange={(v) => update("r3", { multiplier: v })} disabled={!rules.r3.enabled} />
        </RuleCard>

        <RuleCard id="r4" enabled={rules.r4.enabled} onToggle={(v) => update("r4", { enabled: v })}>
          <div className="grid gap-4 sm:grid-cols-2">
            <SliderField label="From this many medium or large detections" value={rules.r4.minCount} min={2} max={10} step={1} onChange={(v) => update("r4", { minCount: v })} disabled={!rules.r4.enabled} />
            <SliderField label="Bonus" value={rules.r4.bonus} min={0} max={10} step={0.5} unit="pts" onChange={(v) => update("r4", { bonus: v })} disabled={!rules.r4.enabled} />
          </div>
        </RuleCard>

        <RuleCard id="r5" enabled={rules.r5.enabled} onToggle={(v) => update("r5", { enabled: v })}>
          <div className="grid gap-4 sm:grid-cols-3">
            <SliderField label="Residential" value={rules.r5.residential} min={0.5} max={3} step={0.05} unit="×" onChange={(v) => update("r5", { residential: v })} disabled={!rules.r5.enabled} />
            <SliderField label="Arterial" value={rules.r5.arterial} min={0.5} max={3} step={0.05} unit="×" onChange={(v) => update("r5", { arterial: v })} disabled={!rules.r5.enabled} />
            <SliderField label="Highway" value={rules.r5.highway} min={0.5} max={3} step={0.05} unit="×" onChange={(v) => update("r5", { highway: v })} disabled={!rules.r5.enabled} />
          </div>
        </RuleCard>

        <RuleCard id="r6" enabled={rules.r6.enabled} onToggle={(v) => update("r6", { enabled: v })}>
          <SliderField label="Bonus" value={rules.r6.bonus} min={0} max={10} step={0.5} unit="pts" onChange={(v) => update("r6", { bonus: v })} disabled={!rules.r6.enabled} />
        </RuleCard>

        <Card>
          <CardBody>
            <h2 className="font-display text-lg font-semibold">Severity bands (fixed)</h2>
            <p className="mt-1 text-sm text-muted">0 clear · above 0 low · 2 medium (14 days) · 5 high (72 h) · 9 or more critical (24 h).</p>
          </CardBody>
        </Card>
      </div>

      {/* Live preview */}
      <div className="xl:sticky xl:top-6 xl:self-start">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Live preview</CardTitle>
              <CardDescription>Re-scores a sample photo as you change values.</CardDescription>
            </div>
          </CardHeader>
          <CardBody className="grid gap-4">
            <Select
              label="Sample"
              value={previewId}
              onValueChange={setPreviewId}
              options={PREVIEWS.map((p, i) => ({ value: p.id, label: SAMPLES[i].title }))}
            />
            <DetectionOverlay
              imageUrl={preview.photo.imageUrl}
              imageWidth={preview.imageWidth}
              imageHeight={preview.imageHeight}
              detections={preview.detections}
              derived={derived}
              drawIn={false}
              alt={SAMPLES.find((s) => s.id === preview.photo.sampleId)?.title ?? "Sample"}
            />
            <div className="grid grid-cols-2 gap-3" aria-live="polite">
              <ScoreBox label="Team defaults" score={preview.score} severity={<SeverityBadge severity={preview.severity} />} />
              <ScoreBox
                label="Your rules"
                score={current.score}
                severity={<SeverityBadge severity={current.severity} />}
                highlight={current.score !== preview.score}
              />
            </div>
            <p className="text-sm">
              <span className="text-muted">Action:</span> <span className="font-medium">{current.recommendedAction}</span>
              <span className="text-muted"> · {formatSla(current.slaHours)}</span>
            </p>
            <ul className="grid gap-1.5 text-sm">
              {current.ruleHits.length === 0 && <li className="text-muted">No rule fired.</li>}
              {current.ruleHits.map((h) => (
                <li key={h.ruleId} className="flex justify-between gap-3 border-b border-border pb-1.5 last:border-0">
                  <span>
                    <span className="font-mono text-xs text-muted">{h.ruleId}</span> {h.detail}
                  </span>
                  <span className="tabular shrink-0 font-mono">{h.points > 0 ? "+" : ""}{formatScore(h.points)}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted">
              Photo metadata: {preview.photo.roadClass}, {preview.photo.schoolZone ? "school zone" : "no school zone"}.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function RuleCard({ id, enabled, onToggle, children }: { id: RuleId; enabled: boolean; onToggle: (v: boolean) => void; children: ReactNode }) {
  return (
    <Card className={cn(!enabled && "bg-surface-2")}>
      <CardBody className="grid gap-5">
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-inverse font-mono text-sm font-medium text-inverse-fg">
            {id.toUpperCase()}
          </span>
          <Switch
            className="flex-1"
            label={<span className="font-display text-lg font-semibold">{RULE_TITLES[id]}</span>}
            description={DESCRIPTIONS[id]}
            checked={enabled}
            onCheckedChange={onToggle}
          />
        </div>
        {children}
      </CardBody>
    </Card>
  );
}

function ScoreBox({ label, score, severity, highlight }: { label: string; score: number; severity: ReactNode; highlight?: boolean }) {
  return (
    <div className={cn("grid gap-2 rounded-md border p-3", highlight ? "border-accent bg-accent-soft" : "border-border")}>
      <span className="text-xs text-muted">{label}</span>
      <span className="tabular font-display text-3xl leading-none font-bold">{formatScore(score)}</span>
      {severity}
    </div>
  );
}
