"use client";

import { Download, ImageUp, Monitor, Moon, ScanSearch, Sun } from "lucide-react";
import { useState } from "react";
import { DemoBadge } from "@/components/app/demo-badge";
import { DetectionOverlay } from "@/components/app/detection-overlay";
import { SeverityBars } from "@/components/app/severity-bars";
import { CountUp } from "@/components/motion/count-up";
import { Badge, SeverityBadge, SeverityDot } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SliderField } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { getSample } from "@/lib/mock/samples";
import { deriveDetections } from "@/lib/rules";
import { SEVERITIES, VERDICTS } from "@/lib/types";
import { GenderTag, ThresholdBar, VerdictBadge } from "@/components/restrooms/signage-bits";
import { VerdictBars } from "@/components/restrooms/verdict-bars";

/** Token groups shown as swatches. Names match app/tokens.css. */
const COLOR_GROUPS: { title: string; tokens: string[] }[] = [
  { title: "Surfaces", tokens: ["bg", "surface", "surface-2", "surface-3", "inverse"] },
  { title: "Lines and text", tokens: ["border", "border-strong", "fg", "muted", "subtle"] },
  { title: "Accent and state", tokens: ["accent", "accent-ink", "accent-soft", "focus", "danger", "success"] },
  { title: "Severity (solid)", tokens: SEVERITIES.map((s) => `sev-${s}`) },
  { title: "Severity (ink on soft)", tokens: SEVERITIES.map((s) => `sev-${s}-ink`) },
  { title: "Charts and boxes", tokens: ["chart-1", "chart-2", "chart-3", "chart-4", "box", "box-review"] },
  { title: "Restrooms: verdicts (solid)", tokens: ["verdict-clear", "verdict-review", "verdict-confusing"] },
  { title: "Restrooms: predicted gender", tokens: ["gender-male", "gender-male-soft", "gender-female", "gender-female-soft"] },
];

const TYPE_SCALE = [
  { cls: "text-5xl font-display font-bold", label: "5xl display", sample: "Repair priority" },
  { cls: "text-4xl font-display font-bold", label: "4xl display", sample: "Road condition" },
  { cls: "text-3xl font-display font-bold", label: "3xl display", sample: "Severity distribution" },
  { cls: "text-2xl font-display font-semibold", label: "2xl display", sample: "Rule hits" },
  { cls: "text-xl font-semibold", label: "xl body", sample: "Recommended action" },
  { cls: "text-lg", label: "lg body", sample: "Qarau inspects public infrastructure from a photo." },
  { cls: "text-base", label: "base body", sample: "Detections below the threshold go to the review queue." },
  { cls: "text-sm text-muted", label: "sm muted", sample: "Model time per photo on the laptop CPU." },
  { cls: "text-xs text-subtle", label: "xs subtle", sample: "Placeholder numbers until training finishes." },
  { cls: "font-mono text-sm", label: "mono", sample: "score = 15 · clip-vitb32-ft6 · 41 ms" },
];

const sample = getSample("s01")!;

export function TokenReference() {
  return (
    <div className="grid gap-10">
      <section aria-labelledby="t-type" className="grid gap-4">
        <h2 id="t-type" className="text-2xl font-bold">Type scale</h2>
        <p className="text-sm text-muted">
          Display: Barlow Condensed (headings). Body: Barlow, a typeface drawn after highway signage. Mono: JetBrains Mono.
        </p>
        <ul className="grid gap-3">
          {TYPE_SCALE.map((t) => (
            <li key={t.label} className="grid gap-1 border-b border-border pb-3 sm:grid-cols-[9rem_1fr] sm:items-baseline">
              <span className="font-mono text-xs text-subtle">{t.label}</span>
              <span className={t.cls}>{t.sample}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="t-space" className="grid gap-4">
        <h2 id="t-space" className="text-2xl font-bold">Spacing, radii, shadows, motion</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold">Spacing (--spacing × n)</h3>
            {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
              <div key={n} className="flex items-center gap-3 text-xs">
                <span className="w-10 font-mono text-subtle">{n}</span>
                <span className="h-3 rounded-xs bg-accent" style={{ width: `calc(var(--spacing) * ${n})` }} />
                <span className="font-mono text-muted">{n * 4}px</span>
              </div>
            ))}
          </div>
          <div className="grid content-start gap-4">
            <h3 className="text-lg font-semibold">Radii and shadows</h3>
            <div className="flex flex-wrap gap-3">
              {["xs", "sm", "md", "lg", "xl"].map((r) => (
                <div key={r} className="grid size-16 place-items-center border border-border-strong bg-surface-2 font-mono text-xs" style={{ borderRadius: `var(--radius-${r})` }}>
                  {r}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {["xs", "sm", "md", "lg"].map((s) => (
                <div key={s} className="grid size-16 place-items-center rounded-md bg-surface font-mono text-xs" style={{ boxShadow: `var(--shadow-${s})` }}>
                  {s}
                </div>
              ))}
            </div>
            <h3 className="text-lg font-semibold">Motion</h3>
            <p className="text-sm text-muted">
              <span className="font-mono">--duration-fast 120ms · base 200ms · slow 420ms · draw 700ms</span>. Easing{" "}
              <span className="font-mono">--ease-standard</span>, <span className="font-mono">--ease-emphasized</span>. All
              animation stops under prefers-reduced-motion.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Everything that depends on the theme. Rendered once per theme on /design. */
export function ThemedShowcase() {
  const [on, setOn] = useState(true);
  const [value, setValue] = useState(0.4);
  const [seg, setSeg] = useState<"system" | "light" | "dark">("system");
  const [select, setSelect] = useState("arterial");

  return (
    <div className="grid gap-8">
      <section className="grid gap-4">
        <h3 className="text-xl font-bold">Colour tokens</h3>
        {COLOR_GROUPS.map((g) => (
          <div key={g.title} className="grid gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">{g.title}</p>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {g.tokens.map((t) => (
                <li key={t} className="grid gap-1">
                  <span className="h-10 rounded-sm border border-border" style={{ background: `var(--${t})` }} />
                  <span className="truncate font-mono text-[0.68rem] text-muted">--{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="grid gap-4">
        <h3 className="text-xl font-bold">Severity</h3>
        <div className="flex flex-wrap gap-2">
          {SEVERITIES.map((s) => (
            <SeverityBadge key={s} severity={s} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <SeverityBadge severity="critical" size="lg" />
          <span className="inline-flex items-center gap-1.5 text-sm">
            <SeverityDot severity="high" /> legend dot
          </span>
        </div>
        <SeverityBars counts={SEVERITIES.map((s, i) => ({ severity: s, count: [6, 9, 12, 7, 4][i] }))} />
      </section>

      <section className="grid gap-4">
        <h3 className="text-xl font-bold">Restroom verdicts and genders</h3>
        <div className="flex flex-wrap gap-2">
          {VERDICTS.map((v) => (
            <VerdictBadge key={v} verdict={v} />
          ))}
          <VerdictBadge verdict="confusing" size="lg" />
        </div>
        <div className="flex flex-wrap gap-2">
          <GenderTag gender="male" confidence={0.97} />
          <GenderTag gender="female" confidence={0.62} />
        </div>
        <ThresholdBar value={0.15} threshold={0.2} label="Gap in P(male) between the doors" valueText="0.15" thresholdLabel="S1 0.20" />
        <VerdictBars verdicts={["clear", "clear", "clear", "review", "review", "confusing"]} />
      </section>

      <section className="grid gap-4">
        <h3 className="text-xl font-bold">Buttons and badges</h3>
        <div className="flex flex-wrap gap-2">
          <Button>
            <ScanSearch aria-hidden /> Primary
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <ButtonLink href="/app" variant="secondary">
            Link button
          </ButtonLink>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="outline">Outline</Badge>
          <Badge tone="inverse">Inverse</Badge>
          <DemoBadge show />
        </div>
      </section>

      <section className="grid gap-4">
        <h3 className="text-xl font-bold">Form controls</h3>
        <Switch label="Switch" description="Radix Switch with label and description." checked={on} onCheckedChange={setOn} />
        <SliderField label="Slider with number input" value={value} min={0.25} max={0.95} step={0.01} onChange={setValue} />
        <Segmented
          label="Segmented"
          value={seg}
          onChange={setSeg}
          options={[
            { value: "system", label: "System", icon: Monitor },
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Select"
            value={select}
            onValueChange={setSelect}
            options={[
              { value: "residential", label: "Residential" },
              { value: "arterial", label: "Arterial" },
              { value: "highway", label: "Highway" },
            ]}
          />
          <Field label="Text field" placeholder="Kabanbay Batyr Ave" hint="With a hint below." />
        </div>
      </section>

      <section className="grid gap-4">
        <h3 className="text-xl font-bold">Feedback</h3>
        <Callout title="Info callout">Neutral information.</Callout>
        <Callout tone="warning" title="Needs a human look">Some detections are below the threshold.</Callout>
        <Callout tone="danger" title="The local model service is not running">Start it or switch to mock.</Callout>
        <Callout tone="success" title="Connected">yolo26n-e7 on cpu.</Callout>
        <EmptyState icon={ImageUp} title="Empty state">Shown when there is nothing yet.</EmptyState>
        <div className="grid gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </section>

      <section className="grid gap-4">
        <h3 className="text-xl font-bold">Card, table, tabs, tooltip, dialog</h3>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Card description.</CardDescription>
            </div>
            <Tooltip content="Tooltips work on hover and keyboard focus">
              <Button variant="ghost" size="sm">
                Hover me
              </Button>
            </Tooltip>
          </CardHeader>
          <CardBody>
            <p className="font-display text-4xl font-bold">
              <CountUp value={40} />
            </p>
            <p className="text-sm text-muted">KPI with count-up</p>
          </CardBody>
        </Card>
        <Card>
          <Table caption="Example table">
            <THead>
              <tr>
                <TH>Rule</TH>
                <TH className="text-right">Points</TH>
              </tr>
            </THead>
            <tbody>
              <TR>
                <TD>R2 Size points</TD>
                <TD className="text-right font-mono">+7</TD>
              </TR>
              <TR>
                <TD>R5 Road class</TD>
                <TD className="text-right font-mono">+6</TD>
              </TR>
            </tbody>
          </Table>
        </Card>
        <Tabs defaultValue="a">
          <TabsList aria-label="Example tabs">
            <TabsTrigger value="a">First</TabsTrigger>
            <TabsTrigger value="b">Second</TabsTrigger>
          </TabsList>
          <TabsContent value="a" className="text-sm text-muted">First panel.</TabsContent>
          <TabsContent value="b" className="text-sm text-muted">Second panel.</TabsContent>
        </Tabs>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-fit">
              <Download aria-hidden /> Open dialog
            </Button>
          </DialogTrigger>
          <DialogContent title="Dialog title" description="Focus is trapped; Escape closes it.">
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </section>

      <section className="grid gap-4">
        <h3 className="text-xl font-bold">Detection overlay</h3>
        <DetectionOverlay
          imageUrl={sample.file}
          imageWidth={sample.imageWidth}
          imageHeight={sample.imageHeight}
          detections={sample.detections}
          derived={deriveDetections(sample.detections)}
          drawIn={false}
          alt="Sample with boxes"
        />
      </section>
    </div>
  );
}
