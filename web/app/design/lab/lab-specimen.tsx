"use client";

import { Download, ScanSearch } from "lucide-react";
import { useState } from "react";
import { DemoBadge } from "@/components/app/demo-badge";
import { SeverityBars } from "@/components/app/severity-bars";
import { ReviewBadge, SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { SelectableTile } from "@/components/ui/selectable-tile";
import { Switch } from "@/components/ui/switch";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { SAMPLES } from "@/lib/mock/samples";
import { SEVERITIES } from "@/lib/types";

/**
 * The real components a lab column renders (G-41). Short on purpose, so three
 * columns fit side by side and a screenshot shows every variant at once. Only
 * the tokens change between columns; this markup is the same in each.
 */
export function LabSpecimen() {
  const [boxes, setBoxes] = useState(true);
  const [tile, setTile] = useState(SAMPLES[0].id);

  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <p className="eyebrow text-accent-ink">Roads</p>
        <p className="font-display text-2xl font-bold">Repair priority</p>
        <p className="text-sm text-muted">Detections below the threshold go to the review queue.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button>
          <ScanSearch aria-hidden /> Analyze photo
        </Button>
        <Button variant="secondary">
          <Download aria-hidden /> Export
        </Button>
        <Button variant="ghost">Reset</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SEVERITIES.map((s) => (
          <SeverityBadge key={s} severity={s} />
        ))}
        <ReviewBadge />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Potholes found</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </div>
          <DemoBadge show />
        </CardHeader>
        <CardBody className="grid gap-3">
          <p className="tabular font-display text-4xl font-bold">38</p>
          <SeverityBars counts={SEVERITIES.map((s, i) => ({ severity: s, count: [6, 9, 12, 7, 4][i] }))} />
        </CardBody>
      </Card>

      <div className="grid gap-4">
        <Field label="Street" placeholder="Kabanbay Batyr Ave" hint="Where the photo was taken." />
        <Switch label="Show boxes" description="Draw the detections on the photo." checked={boxes} onCheckedChange={setBoxes} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SAMPLES.slice(0, 2).map((s) => (
          <SelectableTile key={s.id} selected={tile === s.id} onClick={() => setTile(s.id)} className="p-3 pr-9 text-sm font-medium">
            {s.title}
          </SelectableTile>
        ))}
      </div>

      <Callout tone="warning" title="Needs a human look">
        Some detections are below the threshold.
      </Callout>

      <Card>
        <Table caption="Rule points">
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
    </div>
  );
}
