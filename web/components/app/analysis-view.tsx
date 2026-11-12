"use client";

import { Brain, Clock, MapPin, Route, School, Timer, UserRoundSearch, type LucideIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Badge, ReviewBadge, SeverityBadge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { Card, CardBody } from "@/components/ui/card";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rowDelay, stage, useStagedReveal } from "@/components/motion/stage";
import { cn } from "@/lib/cn";
import { formatDateTime, formatPct, formatScore, formatSla } from "@/lib/format";
import { reveal as revealAt } from "@/lib/motion";
import { deriveDetections, rescore } from "@/lib/rules";
import { SEVERITY_CLASSES } from "@/lib/severity";
import { rulesStore } from "@/lib/store/settings";
import type { StoredAnalysis } from "@/lib/types";
import { ResultProvenanceBadge } from "./demo-badge";
import { DetectionOverlay } from "./detection-overlay";
import { isSeededDemo, SEEDED_MODEL_LABEL } from "@/lib/mock/seeded";
import { PROVIDER_META } from "./provider-badge";

/**
 * Full result view, shared by /app/roads/analyze and /app/roads/reports/[id]:
 * photo + boxes, priority, rule hits, detections table, raw JSON.
 * Hovering a box highlights its row and vice versa.
 * reveal (Analyze, right after a run): the priority card, then the score, then
 * the rule rows rise in, within 600 ms (G-75). Reports open without it.
 */
export function AnalysisView({ analysis, title, reveal = false }: { analysis: StoredAnalysis; title?: string; reveal?: boolean }) {
  const rules = rulesStore.useStore();
  const staged = useStagedReveal(reveal);
  const cardStage = stage(staged, revealAt.card);
  const scoreStage = stage(staged, revealAt.key);
  const totalStage = stage(staged, rowDelay(analysis.ruleHits.length));
  const [activeId, setActiveId] = useState<string | null>(null);
  const derived = useMemo(() => deriveDetections(analysis.detections, rules), [analysis.detections, rules]);
  const current = useMemo(() => rescore(analysis, rules), [analysis, rules]);
  const rulesChanged = current.score !== analysis.score || current.severity !== analysis.severity;
  const sev = SEVERITY_CLASSES[analysis.severity];
  const totalPoints = analysis.ruleHits.reduce((s, h) => s + h.points, 0);

  // Raw JSON shows the contract fields (+ photo), never the bulky data: URL.
  const raw = useMemo(() => {
    const { photo, ...rest } = analysis as StoredAnalysis & { source?: string };
    delete (rest as { source?: string }).source;
    return JSON.stringify(
      { ...rest, photo: { ...photo, imageUrl: photo.imageUrl?.startsWith("data:") ? "data:… (thumbnail kept in this browser)" : photo.imageUrl } },
      null,
      2,
    );
  }, [analysis]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-3">
          <DetectionOverlay
            imageUrl={analysis.photo.imageUrl}
            imageWidth={analysis.imageWidth}
            imageHeight={analysis.imageHeight}
            detections={analysis.detections}
            derived={derived}
            activeId={activeId}
            onActiveChange={setActiveId}
            replayKey={analysis.id}
            alt={title ?? analysis.location?.label ?? "Analysed road photo"}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block h-2.5 w-4 rounded-sm border-2 border-box" /> counted
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block h-2.5 w-4 rounded-sm border-2 border-dashed border-box-review" /> needs review
            </span>
            {/* Phones have no hover. */}
            <span className="pointer-coarse:hidden">Hover a box or a row to match them.</span>
          </div>
        </div>

        <Card className={cn("border-t-4 lg:self-start", sev.border, cardStage.className)} style={cardStage.style}>
          <CardBody className="grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow text-muted">Repair priority</p>
                <div className="mt-2">
                  <SeverityBadge severity={analysis.severity} size="lg" />
                </div>
              </div>
              <div className={cn("text-right", scoreStage.className)} style={scoreStage.style}>
                <p className="eyebrow text-muted">Score</p>
                <p className="tabular font-display text-5xl leading-none font-bold">{formatScore(analysis.score)}</p>
              </div>
            </div>

            <dl className="grid gap-3 text-sm">
              <Row label="Recommended action">
                <span className="font-semibold">{analysis.recommendedAction}</span>
              </Row>
              <Row label="Target time">{formatSla(analysis.slaHours)}</Row>
            </dl>

            {analysis.needsReview && (
              <Callout tone="warning" icon={UserRoundSearch} title="Needs a human look">
                Some detections are below the confidence threshold. They are not counted, but a person should check the
                photo. It is in the review queue on the Roads overview.
              </Callout>
            )}
            {rulesChanged && (
              <Callout tone="info" title="Your rules have changed since this analysis">
                With the current rule settings this photo would score {formatScore(current.score)} ({current.severity}).
              </Callout>
            )}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 text-sm">
              <div className="col-span-2">
                <dt className="sr-only">Source of this result</dt>
                <dd>
                  <ResultProvenanceBadge result={analysis} />
                </dd>
              </div>
              <Meta icon={PROVIDER_META[analysis.provider].icon} label="Provider">
                {PROVIDER_META[analysis.provider].label}
              </Meta>
              <Meta icon={Brain} label="Model">
                <span className="font-mono text-xs">{isSeededDemo(analysis.id) ? SEEDED_MODEL_LABEL : analysis.model}</span>
              </Meta>
              <Meta icon={Timer} label="Model latency">
                <span className="tabular">{analysis.latencyMs} ms</span>
              </Meta>
              <Meta icon={Clock} label="Analysed">
                {formatDateTime(analysis.createdAt)}
              </Meta>
              <Meta icon={Route} label="Road class">
                {analysis.photo.roadClass ? <span className="capitalize">{analysis.photo.roadClass}</span> : "Not set (residential)"}
              </Meta>
              <Meta icon={School} label="School zone">
                {analysis.photo.schoolZone ? "Yes" : "No"}
              </Meta>
              {analysis.location && (
                <Meta icon={MapPin} label="Location" wide>
                  {analysis.location.label}{" "}
                  <span className="tabular text-subtle">
                    ({analysis.location.lat.toFixed(4)}, {analysis.location.lng.toFixed(4)})
                  </span>
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
              <TabsTrigger value="rules">Why this priority</TabsTrigger>
              <TabsTrigger value="detections">Detections ({analysis.detections.length})</TabsTrigger>
              <TabsTrigger value="json">Raw JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="rules">
              {analysis.ruleHits.length === 0 ? (
                <p className="text-sm text-muted">No rule fired: there were no detections to score.</p>
              ) : (
                <Table caption="Rule hits and points">
                  <THead>
                    <tr>
                      <TH>Rule</TH>
                      <TH className="hidden sm:table-cell">What happened</TH>
                      <TH className="text-right">Points</TH>
                    </tr>
                  </THead>
                  <tbody>
                    {analysis.ruleHits.map((h, i) => (
                      <TR key={h.ruleId} {...stage(staged, rowDelay(i))}>
                        <TD>
                          <span className="font-mono text-xs text-muted">{h.ruleId}</span>{" "}
                          <span className="font-medium">{h.title}</span>
                          {/* On a phone the explanation goes under the rule instead of a third column. */}
                          <p className="mt-1 text-muted sm:hidden">{h.detail}</p>
                        </TD>
                        <TD className="hidden text-muted sm:table-cell">{h.detail}</TD>
                        <TD className="tabular text-right font-mono">{h.points > 0 ? `+${formatScore(h.points)}` : formatScore(h.points)}</TD>
                      </TR>
                    ))}
                    <TR className={cn("bg-surface-2", totalStage.className)} style={totalStage.style}>
                      <TD className="font-semibold">Score</TD>
                      <TD className="hidden sm:table-cell" />
                      <TD className="tabular text-right font-mono font-semibold">{formatScore(Math.round(totalPoints * 100) / 100)}</TD>
                    </TR>
                  </tbody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="detections">
              {analysis.detections.length === 0 ? (
                <p className="text-sm text-muted">The model found no potholes in this photo.</p>
              ) : (
                <Table caption="Detections">
                  <THead>
                    <tr>
                      <TH>#</TH>
                      <TH>Confidence</TH>
                      <TH className="hidden sm:table-cell">Size</TH>
                      <TH className="hidden sm:table-cell">Area</TH>
                      <TH className="hidden sm:table-cell">Lane</TH>
                      <TH className="hidden sm:table-cell">Status</TH>
                      <TH className="text-right">Points</TH>
                    </tr>
                  </THead>
                  <tbody>
                    {analysis.detections.map((d, i) => {
                      const info = derived[i];
                      const active = activeId === d.id;
                      const status = info.counted ? (
                        <Badge>Counted</Badge>
                      ) : info.review ? (
                        <ReviewBadge />
                      ) : (
                        <Badge tone="outline">Ignored</Badge>
                      );
                      return (
                        <TR
                          key={d.id}
                          tabIndex={0}
                          onMouseEnter={() => setActiveId(d.id)}
                          onMouseLeave={() => setActiveId(null)}
                          onFocus={() => setActiveId(d.id)}
                          onBlur={() => setActiveId(null)}
                          className={cn("transition-colors", active && "bg-accent-soft")}
                          aria-label={`Detection ${i + 1}`}
                        >
                          <TD className="font-mono">{i + 1}</TD>
                          <TD className="tabular font-mono">
                            {formatPct(d.confidence)}
                            {/* On a phone size, area, lane and status go under the confidence instead of four more columns. */}
                            <span className="mt-0.5 block font-sans text-xs text-muted sm:hidden">
                              <span className="capitalize">{info.size}</span>, {info.areaPct.toFixed(2)}%, {info.inLane ? "in lane" : "off lane"}
                            </span>
                            <span className="mt-1 block font-sans sm:hidden">{status}</span>
                          </TD>
                          <TD className="hidden capitalize sm:table-cell">{info.size}</TD>
                          <TD className="tabular hidden font-mono sm:table-cell">{info.areaPct.toFixed(2)}%</TD>
                          <TD className="hidden whitespace-nowrap sm:table-cell">{info.inLane ? "In lane" : "Off lane"}</TD>
                          <TD className="hidden sm:table-cell">{status}</TD>
                          <TD className="tabular text-right font-mono">{formatScore(info.points)}</TD>
                        </TR>
                      );
                    })}
                  </tbody>
                </Table>
              )}
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

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Meta({ icon: Icon, label, children, wide }: { icon: LucideIcon; label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn("grid content-start gap-0.5", wide && "col-span-2")}>
      <dt className="inline-flex items-center gap-1.5 text-xs text-muted">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
