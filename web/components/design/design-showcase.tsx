"use client";

import { Download, ImageUp, Monitor, Moon, ScanSearch, Sun } from "lucide-react";
import { useState } from "react";
import { DemoBadge } from "@/components/app/demo-badge";
import { DetectionOverlay } from "@/components/app/detection-overlay";
import { BlankSigns, ClearQueue, EmptyRoad, EmptySearch } from "@/components/illustrations";
import { SeverityBars } from "@/components/app/severity-bars";
import { CountUp } from "@/components/motion/count-up";
import { Badge, ReviewBadge, SeverityBadge, SeverityDot } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { SelectableTile } from "@/components/ui/selectable-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { SliderField } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { SAMPLES, getSample } from "@/lib/mock/samples";
import { deriveDetections } from "@/lib/rules";
import { SEVERITIES, VERDICTS } from "@/lib/types";
import { GenderTag, ThresholdBar, VerdictBadge } from "@/components/restrooms/signage-bits";
import { VerdictBars } from "@/components/restrooms/verdict-bars";

/**
 * Token groups shown as swatches. Names match app/tokens.css.
 * `use` and `never` are the usage rules shown under each group (G-20). They
 * follow the comments in tokens.css and how the code uses the tokens today;
 * a new group needs both lines.
 */
const COLOR_GROUPS: { title: string; tokens: string[]; use: string; never: string }[] = [
  {
    title: "Surfaces",
    tokens: ["bg", "surface", "surface-2", "surface-3", "inverse"],
    use: "bg for the page; surface for cards, popovers and map popups; surface-2 for hover rows and inset panels; surface-3 for tracks, skeletons and photo frames; inverse with inverse-fg for tooltips and number chips.",
    never: "to show a status. A surface says where something sits, not how serious it is.",
  },
  {
    title: "Lines and text",
    tokens: ["border", "border-strong", "fg", "muted", "subtle"],
    use: "fg for headings and body text; muted for secondary text; subtle for hints, sources and timestamps; border for card edges and dividers; border-strong for inputs, switches and dashed empty states.",
    never: "subtle for text a user needs to act on (it has the lowest contrast); border colours for text.",
  },
  {
    title: "Accent and state",
    tokens: ["accent", "accent-ink", "accent-soft", "focus", "danger", "success"],
    use: "accent as a fill (primary button, checked switch, active mark) with accent-fg text; accent-ink for links and amber text; accent-soft for selected or highlighted rows and tiles; focus for the keyboard focus ring; danger for errors and destructive buttons; success for a passed check.",
    never: "accent as a text colour (3.46:1 on white, use accent-ink); focus for anything but focus; danger for a severity (use sev-critical).",
  },
  {
    title: "Severity (solid)",
    tokens: SEVERITIES.map((s) => `sev-${s}`),
    use: "marks: bars, legend dots, map markers, KPI stripes and selected chip borders, always next to the severity word or icon.",
    never: "for text (use the ink), or for series that are not severity, such as providers or model runs.",
  },
  {
    title: "Severity (ink on soft)",
    tokens: SEVERITIES.map((s) => `sev-${s}-ink`),
    use: "severity text and badge labels: ink on its own soft fill (sev-high-ink on sev-high-soft) or on surface.",
    never: "the ink of one level on the soft fill of another; a soft fill as a mark (too pale to see on a chart or map).",
  },
  {
    title: "Charts and boxes",
    tokens: ["chart-1", "chart-2", "chart-3", "chart-4", "box", "box-review"],
    use: "chart-1 to chart-4 for series that are not severity (providers, model runs); box and box-review only for detection boxes drawn on photos, the same in both themes.",
    never: "severity colours for providers or runs; box colours on app surfaces, they are tuned for photos.",
  },
  {
    title: "Roads: needs review",
    tokens: ["review", "review-ink", "review-soft", "box-review"],
    use: "a road detection that needs a human look: review-ink on review-soft for the review badge with the eye icon and the word, review for the 'To review' KPI stripe, box-review for the dashed box on photos.",
    never: "for focus or low severity (the reason it is not blue), or for the restroom verdict 'review' (use verdict-review).",
  },
  {
    title: "Restrooms: verdicts (solid)",
    tokens: ["verdict-clear", "verdict-review", "verdict-confusing"],
    use: "the restroom verdict (clear, review, confusing) in badges and bars, with its icon and word. By default they reuse sev-clear, sev-medium and sev-critical.",
    never: "for road severity (use sev-*), or without the verdict word.",
  },
  {
    title: "Restrooms: predicted gender",
    tokens: ["gender-male", "gender-male-soft", "gender-female", "gender-female-soft"],
    use: "a sign's predicted gender in tags and bars, always with the Mars or Venus icon and the word.",
    never: "pink and blue stereotypes, colour alone, or any other meaning in the app.",
  },
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
  { cls: "text-xs text-subtle", label: "xs subtle", sample: "Invented numbers carry a demo badge." },
  { cls: "font-mono text-sm", label: "mono", sample: "score = 15 · clip-vitb32-ft6 · 41 ms" },
];

/** "Which token do I use?" quick reference (G-20). `swatch` is the token drawn in the first column. */
const TOKEN_CHOICES: { need: string; token: string; example: string; swatch: string }[] = [
  { need: "Body text and headings", token: "fg", example: "text-fg", swatch: "fg" },
  { need: "Secondary text", token: "muted", example: "text-muted", swatch: "muted" },
  { need: "Hints, sources, timestamps", token: "subtle", example: "text-subtle", swatch: "subtle" },
  { need: "Status text", token: "*-ink", example: "text-sev-high-ink", swatch: "sev-high-ink" },
  { need: "Badge fill", token: "*-soft + *-ink", example: "bg-sev-high-soft text-sev-high-ink", swatch: "sev-high-soft" },
  { need: "Marks: bars, dots, map markers", token: "solid", example: "bg-sev-high", swatch: "sev-high" },
  { need: "Needs review (roads)", token: "review-soft + review-ink", example: "bg-review-soft text-review-ink", swatch: "review" },
  { need: "Focus ring", token: "focus", example: "outline-focus", swatch: "focus" },
  { need: "Primary button", token: "accent + accent-fg", example: "bg-accent text-accent-fg", swatch: "accent" },
  { need: "Link text", token: "accent-ink", example: "text-accent-ink", swatch: "accent-ink" },
  { need: "Chart series that is not severity", token: "chart-1 to chart-4", example: "var(--chart-1)", swatch: "chart-1" },
];

/** The four empty-state drawings (G-26) and the empty state each one is for. */
const ILLUSTRATIONS = [
  { name: "EmptyRoad", use: "No photo yet", Drawing: EmptyRoad },
  { name: "BlankSigns", use: "Nothing to compare or rank", Drawing: BlankSigns },
  { name: "EmptySearch", use: "No results, not found", Drawing: EmptySearch },
  { name: "ClearQueue", use: "Nothing to review", Drawing: ClearQueue },
];

const sample = getSample("s01")!;

export function TokenReference() {
  return (
    <div className="grid gap-10">
      <section aria-labelledby="t-type" className="grid gap-4">
        <h2 id="t-type" className="text-2xl font-bold">Type scale</h2>
        <p className="text-sm text-muted">
          Display and body: Overpass, drawn after highway-sign lettering, with Cyrillic and Kazakh letters. Mono: JetBrains Mono for figures and technical details.
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

      <section aria-labelledby="t-which" className="grid gap-4">
        <h2 id="t-which" className="text-2xl font-bold">Which colour token do I use?</h2>
        <p className="max-w-2xl text-sm text-muted">
          Pick the row for what you are drawing. The swatches in both themes below repeat each group with a &quot;use for&quot; and a &quot;never&quot; line.
        </p>
        <Table caption="Which colour token to use for each need">
          <THead>
            <tr>
              <TH>Need</TH>
              <TH>Token</TH>
              <TH>Example</TH>
            </tr>
          </THead>
          <tbody>
            {TOKEN_CHOICES.map((c) => (
              <TR key={c.need}>
                <TD>
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden className="size-3 shrink-0 rounded-xs border border-border" style={{ background: `var(--${c.swatch})` }} />
                    {c.need}
                  </span>
                </TD>
                <TD className="font-mono text-xs whitespace-nowrap">{c.token}</TD>
                <TD className="font-mono text-xs whitespace-nowrap text-muted">{c.example}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
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
  const [tile, setTile] = useState(SAMPLES[0].id);

  return (
    <div className="grid gap-8">
      <section className="grid gap-4">
        <h3 className="text-xl font-bold">Colour tokens</h3>
        {COLOR_GROUPS.map((g) => (
          <div key={g.title} className="grid gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">{g.title}</p>
            <dl className="grid gap-x-3 gap-y-0.5 text-xs text-muted sm:grid-cols-[4.5rem_1fr]">
              <dt className="font-semibold text-fg">Use for</dt>
              <dd>{g.use}</dd>
              <dt className="font-semibold text-fg">Never</dt>
              <dd>{g.never}</dd>
            </dl>
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
          <ReviewBadge />
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
        <h3 className="text-xl font-bold">Selectable tiles</h3>
        <p className="text-sm text-muted">
          Selected: amber border, tinted fill and a check mark, so it still reads in greyscale. Hover: darker border and grey fill.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SAMPLES.slice(0, 3).map((s) => (
            <SelectableTile key={s.id} selected={tile === s.id} onClick={() => setTile(s.id)} className="p-3 pr-9 text-sm font-medium">
              {s.title}
            </SelectableTile>
          ))}
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
          <p className="text-sm text-muted">
            Empty-state drawings: lines in currentColor, fills from surface and border tokens, one accent mark each.
          </p>
          <ul className="grid grid-cols-2 gap-3 text-muted">
            {ILLUSTRATIONS.map(({ name, use, Drawing }) => (
              <li key={name} className="grid justify-items-center gap-1 rounded-md border border-border bg-surface-2 p-3 text-center">
                <Drawing className="h-auto w-full max-w-30" />
                <span className="font-mono text-xs text-fg">{name}</span>
                <span className="text-xs">{use}</span>
              </li>
            ))}
          </ul>
        </div>
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
