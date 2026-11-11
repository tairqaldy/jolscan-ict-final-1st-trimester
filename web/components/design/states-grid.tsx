"use client";

import { ImageUp, LoaderCircle, ScanSearch } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, INPUT_HOVER } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SliderField } from "@/components/ui/slider";
import { FORCED_FOCUS, INTERACTION_STATES } from "@/components/ui/states";
import { Switch } from "@/components/ui/switch";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VARIANTS = ["primary", "secondary", "ghost", "danger"] as const;

/** One state: a mono caption over the control. */
function Cell({ state, children }: { state: string; children: ReactNode }) {
  return (
    <li className="grid content-start gap-2">
      <span className="font-mono text-xs text-muted">{state}</span>
      {children}
    </li>
  );
}

function Row({ title, note, children }: { title: string; note?: string; children?: ReactNode }) {
  return (
    <div className="grid gap-3 border-t border-border pt-4">
      <h4 className="text-base font-semibold">{title}</h4>
      {note && <p className="text-sm text-muted">{note}</p>}
      {children}
    </div>
  );
}

/**
 * G-6: every state of every primitive, side by side. Hover, focus and pressed
 * are drawn with each component's `forceState`, which uses the same classes as
 * the real pseudo-class (lib/ui-states.test.ts). Rendered once per theme.
 */
export function StatesGrid() {
  const [on, setOn] = useState(true);
  const [value, setValue] = useState(0.4);
  const [seg, setSeg] = useState<"system" | "light" | "dark">("system");
  const [select, setSelect] = useState("arterial");

  const roadClasses = [
    { value: "residential", label: "Residential" },
    { value: "arterial", label: "Arterial" },
    { value: "highway", label: "Highway" },
  ];

  return (
    <section className="grid gap-4">
      <h3 className="text-xl font-bold">States</h3>
      <p className="text-sm text-muted">
        Default, hover, keyboard focus, pressed, disabled and, where it applies, loading, selected or error. Hover, focus and
        pressed are drawn here; the live controls above react to the pointer and the Tab key. Reduce motion makes every
        change instant.
      </p>

      <Row title="Button" note="Press scales to 98 %, the focus ring eases in. Below 640 px every size is 48 px tall.">
        {VARIANTS.map((variant) => (
          <ul key={variant} className="flex flex-wrap items-end gap-3">
            {INTERACTION_STATES.map((state) => (
              <Cell key={state} state={state}>
                <Button variant={variant} forceState={state === "default" ? undefined : state} tabIndex={-1}>
                  {variant}
                </Button>
              </Cell>
            ))}
            <Cell state="disabled">
              <Button variant={variant} disabled>
                {variant}
              </Button>
            </Cell>
            {variant === "primary" && (
              <Cell state="loading">
                <Button disabled aria-busy>
                  <LoaderCircle className="animate-spin" aria-hidden /> Analysing…
                </Button>
              </Cell>
            )}
          </ul>
        ))}
      </Row>

      <Row title="Switch" note="The thumb slides; a press stretches it towards where it will go.">
        <ul className="grid gap-4 sm:grid-cols-2">
          <Cell state="off / on (live)">
            <Switch label="Example switch" checked={on} onCheckedChange={setOn} />
          </Cell>
          <Cell state="hover">
            <Switch label="Example switch" checked onCheckedChange={() => {}} forceState="hover" />
          </Cell>
          <Cell state="focus">
            <Switch label="Example switch" checked={false} onCheckedChange={() => {}} forceState="focus" />
          </Cell>
          <Cell state="pressed">
            <Switch label="Example switch" checked={false} onCheckedChange={() => {}} forceState="pressed" />
          </Cell>
          <Cell state="disabled, off">
            <Switch label="Example switch" checked={false} onCheckedChange={() => {}} disabled />
          </Cell>
          <Cell state="disabled, on">
            <Switch label="Example switch" checked onCheckedChange={() => {}} disabled />
          </Cell>
        </ul>
      </Row>

      <Row title="Slider" note="The thumb lifts on hover and grows while it is held.">
        <ul className="grid gap-4 sm:grid-cols-2">
          {INTERACTION_STATES.map((state) => (
            <Cell key={state} state={state === "default" ? "default (live)" : state}>
              <SliderField
                label="Confidence threshold"
                value={state === "default" ? value : 0.4}
                min={0.25}
                max={0.95}
                step={0.01}
                onChange={state === "default" ? setValue : () => {}}
                forceState={state === "default" ? undefined : state}
              />
            </Cell>
          ))}
          <Cell state="disabled">
            <SliderField label="Confidence threshold" value={0.4} min={0.25} max={0.95} step={0.01} onChange={() => {}} disabled />
          </Cell>
        </ul>
      </Row>

      <Row title="Tabs" note="The underline grows from the centre: grey on hover, amber when selected.">
        <Tabs defaultValue="selected">
          <TabsList aria-label="Tab states">
            <TabsTrigger value="selected">Selected</TabsTrigger>
            <TabsTrigger value="default">Default</TabsTrigger>
            <TabsTrigger value="hover" forceState="hover">
              Hover
            </TabsTrigger>
            <TabsTrigger value="focus" forceState="focus">
              Focus
            </TabsTrigger>
            <TabsTrigger value="disabled" disabled>
              Disabled
            </TabsTrigger>
          </TabsList>
          {["selected", "default", "hover", "focus", "disabled"].map((v) => (
            <TabsContent key={v} value={v} className="text-sm text-muted">
              Panel of the {v} tab.
            </TabsContent>
          ))}
        </Tabs>
      </Row>

      <Row title="Text field and select" note="Hover darkens the border; an error turns it red and adds a message.">
        <ul className="grid gap-4 sm:grid-cols-2">
          <Cell state="default">
            <Field label="Street" placeholder="Kabanbay Batyr Ave" />
          </Cell>
          <Cell state="hover">
            <Field label="Street" placeholder="Kabanbay Batyr Ave" inputClassName={INPUT_HOVER} />
          </Cell>
          <Cell state="focus">
            <Field label="Street" placeholder="Kabanbay Batyr Ave" inputClassName={FORCED_FOCUS} />
          </Cell>
          <Cell state="disabled">
            <Field label="Street" placeholder="Kabanbay Batyr Ave" disabled />
          </Cell>
          <Cell state="error">
            <Field label="Street" defaultValue="" placeholder="Kabanbay Batyr Ave" error="Enter a street name." />
          </Cell>
          <Cell state="select, default (live: open it)">
            <Select label="Road class" value={select} onValueChange={setSelect} options={roadClasses} />
          </Cell>
          <Cell state="select, hover">
            <Select label="Road class" value="arterial" onValueChange={() => {}} options={roadClasses} forceState="hover" />
          </Cell>
          <Cell state="select, focus">
            <Select label="Road class" value="arterial" onValueChange={() => {}} options={roadClasses} forceState="focus" />
          </Cell>
        </ul>
      </Row>

      <Row title="Segmented control" note="Selected: raised white segment. A disabled option is faded and has no hover.">
        <Segmented
          label="Theme"
          value={seg}
          onChange={setSeg}
          options={[
            { value: "system", label: "System" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark", disabled: true },
          ]}
        />
      </Row>

      <Row title="Table row" note="Plain rows have no hover, so they do not look clickable. A clickable row turns grey on hover.">
        <Card>
          <Table caption="Table row states">
            <THead>
              <tr>
                <TH>State</TH>
                <TH className="text-right">Points</TH>
              </tr>
            </THead>
            <tbody>
              <TR>
                <TD>Default</TD>
                <TD className="text-right font-mono">+7</TD>
              </TR>
              <TR className="bg-surface-2">
                <TD>Hover (clickable row)</TD>
                <TD className="text-right font-mono">+6</TD>
              </TR>
              <TR data-state="selected">
                <TD>Selected</TD>
                <TD className="text-right font-mono">+4</TD>
              </TR>
            </tbody>
          </Table>
        </Card>
      </Row>

      <Row title="Card, badge, empty state" note="Not interactive, so no hover or focus: a card that does not open anything must not look as if it does.">
        <ul className="grid gap-4 sm:grid-cols-2">
          <Cell state="card">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Card title</CardTitle>
                  <CardDescription>Card description.</CardDescription>
                </div>
              </CardHeader>
              <CardBody className="text-sm text-muted">Body text.</CardBody>
            </Card>
          </Cell>
          <Cell state="card, loading">
            <Card aria-busy>
              <CardHeader>
                <Skeleton className="h-5 w-2/3" />
              </CardHeader>
              <CardBody className="grid gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardBody>
            </Card>
          </Cell>
          <Cell state="badge tones">
            <div className="flex flex-wrap gap-2">
              <Badge>Neutral</Badge>
              <Badge tone="accent">Accent</Badge>
              <Badge tone="outline">Outline</Badge>
              <Badge tone="inverse">Inverse</Badge>
            </div>
          </Cell>
          <Cell state="empty, with action">
            <EmptyState icon={ImageUp} title="No photo yet" action={<Button size="sm"><ScanSearch aria-hidden /> Choose a photo</Button>}>
              Drop a road photo to see its detections.
            </EmptyState>
          </Cell>
        </ul>
      </Row>

      <Row
        title="Dialog and toast"
        note="Dialog: the overlay fades in, the panel grows from 96 % in 200 ms and leaves in 120 ms; on phones the menu sheet slides up. Open the dialog below to see it. Toast: not used. Feedback stays next to the control that caused it (Callout, role=status), so it does not disappear before it is read."
      />
    </section>
  );
}
