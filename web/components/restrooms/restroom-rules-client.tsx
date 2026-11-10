"use client";

import { RotateCcw } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SliderField } from "@/components/ui/slider";
import { cn } from "@/lib/cn";
import { RESTROOM_PRESETS, RESTROOM_SAMPLES, getRestroomSample, mockSimilarity } from "@/lib/mock/restroom-samples";
import { DEFAULT_SIGNAGE, SIGNAGE_RULE_TITLES, VERDICT_ACTIONS, evaluateSignage, type SignageRuleId } from "@/lib/signage";
import { signageRulesStore } from "@/lib/store/settings";
import { GenderTag, SignImage, VerdictBadge } from "./signage-bits";

const DESCRIPTIONS: Record<SignageRuleId, string> = {
  S1: "The model's confidence in the gender it predicts must be at least this for both signs. Below it, the model, and likely a visitor, cannot tell the gender at a glance.",
  S2: "The two signs must be read as different genders. If both read as the same gender, visitors cannot tell which door is which. No threshold: it compares the two predictions.",
  S3: "The two designs must look like one set: similarity at least this. Unrelated designs, for example after one sign was replaced, may not be read as a pair.",
};

export function RestroomRulesClient() {
  const rules = signageRulesStore.useStore();
  const [aId, setAId] = useState(RESTROOM_PRESETS[1].a);
  const [bId, setBId] = useState(RESTROOM_PRESETS[1].b);
  const a = getRestroomSample(aId)!;
  const b = getRestroomSample(bId)!;
  const input = useMemo(() => ({ a: a.mock, b: b.mock, similarity: mockSimilarity(a.id, b.id) }), [a, b]);
  const defaults = useMemo(() => evaluateSignage(input), [input]);
  const current = useMemo(() => evaluateSignage(input, rules), [input, rules]);
  const changed = JSON.stringify(rules) !== JSON.stringify(DEFAULT_SIGNAGE);
  const preset = RESTROOM_PRESETS.find((p) => p.a === aId && p.b === bId);
  const signOptions = RESTROOM_SAMPLES.map((s) => ({ value: s.id, label: s.title }));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="grid content-start gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {changed ? "You have changed the defaults. Changes are saved in this browser and used for every new comparison." : "Showing the team defaults from RULES.md, part 2."}
          </p>
          <Button variant="secondary" size="sm" onClick={() => signageRulesStore.reset()} disabled={!changed}>
            <RotateCcw aria-hidden /> Reset to defaults
          </Button>
        </div>

        <RuleCard id="S1" passed={current.ruleHits[0].passed}>
          <SliderField
            label="Minimum confidence, both signs"
            value={rules.s1.minConfidence}
            min={0.5}
            max={0.99}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => signageRulesStore.set((r) => ({ ...r, s1: { minConfidence: v } }))}
          />
        </RuleCard>
        <RuleCard id="S2" passed={current.ruleHits[1].passed}>
          <p className="text-sm text-muted">Fixed. Fails only when both predicted genders are the same.</p>
        </RuleCard>
        <RuleCard id="S3" passed={current.ruleHits[2].passed}>
          <SliderField
            label="Minimum similarity"
            value={rules.s3.minSimilarity}
            min={0.3}
            max={0.99}
            step={0.01}
            onChange={(v) => signageRulesStore.set((r) => ({ ...r, s3: { minSimilarity: v } }))}
          />
        </RuleCard>

        <Card>
          <CardBody>
            <h2 className="font-display text-lg font-semibold">Verdict (fixed)</h2>
            <ul className="mt-2 grid gap-2 text-sm">
              <li className="flex flex-wrap items-center gap-2">
                <VerdictBadge verdict="clear" /> <span className="text-muted">S1, S2 and S3 pass. {VERDICT_ACTIONS.clear}.</span>
              </li>
              <li className="flex flex-wrap items-center gap-2">
                <VerdictBadge verdict="review" /> <span className="text-muted">S2 passes, S1 or S3 fails. {VERDICT_ACTIONS.review}.</span>
              </li>
              <li className="flex flex-wrap items-center gap-2">
                <VerdictBadge verdict="confusing" /> <span className="text-muted">S2 fails. {VERDICT_ACTIONS.confusing}.</span>
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Live preview</CardTitle>
              <CardDescription>Judges a sample pair as you change the thresholds. Mock predictions from the sample manifest.</CardDescription>
            </div>
          </CardHeader>
          <CardBody className="grid gap-4">
            <Select
              label="Example pair"
              value={preset?.id ?? "custom"}
              onValueChange={(id) => {
                const p = RESTROOM_PRESETS.find((x) => x.id === id);
                if (p) {
                  setAId(p.a);
                  setBId(p.b);
                }
              }}
              options={[
                ...RESTROOM_PRESETS.map((p) => ({ value: p.id, label: p.title })),
                { value: "custom", label: "Your own pair (pick below)", disabled: true },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="grid content-start gap-2">
                <Select label="Door A" value={aId} onValueChange={setAId} options={signOptions} triggerClassName="min-w-0 w-full" />
                <SignImage src={a.file} alt={a.title} />
                <GenderTag gender={a.mock.gender} confidence={a.mock.confidence} className="w-fit" />
              </div>
              <div className="grid content-start gap-2">
                <Select label="Door B" value={bId} onValueChange={setBId} options={signOptions} triggerClassName="min-w-0 w-full" />
                <SignImage src={b.file} alt={b.title} />
                <GenderTag gender={b.mock.gender} confidence={b.mock.confidence} className="w-fit" />
              </div>
            </div>
            <p className="tabular text-sm">
              <span className="text-muted">Similarity</span> <span className="font-mono font-semibold">{input.similarity.toFixed(2)}</span>
            </p>
            <div className="grid grid-cols-2 gap-3" aria-live="polite">
              <VerdictBox label="Team defaults" verdict={<VerdictBadge verdict={defaults.verdict} />} />
              <VerdictBox label="Your rules" verdict={<VerdictBadge verdict={current.verdict} />} highlight={current.verdict !== defaults.verdict} />
            </div>
            <p className="text-sm">
              <span className="text-muted">Action:</span> <span className="font-medium">{current.recommendedAction}</span>
            </p>
            <ul className="grid gap-1.5 text-sm">
              {current.ruleHits.map((h) => (
                <li key={h.ruleId} className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2 border-b border-border pb-1.5 last:border-0">
                  <span className="font-mono text-xs text-muted">{h.ruleId}</span>
                  <span className="text-muted">{h.detail}</span>
                  {h.passed ? <Badge tone="outline">Pass</Badge> : <Badge tone="accent">Fail</Badge>}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function RuleCard({ id, passed, children }: { id: SignageRuleId; passed: boolean; children: ReactNode }) {
  return (
    <Card>
      <CardBody className="grid gap-5">
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-inverse font-mono text-sm font-medium text-inverse-fg">
            {id}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold">{SIGNAGE_RULE_TITLES[id]}</h2>
              <span className="text-xs text-muted">
                Preview pair: {passed ? <Badge tone="outline">passes</Badge> : <Badge tone="accent">fails</Badge>}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted">{DESCRIPTIONS[id]}</p>
          </div>
        </div>
        {children}
      </CardBody>
    </Card>
  );
}

function VerdictBox({ label, verdict, highlight }: { label: string; verdict: ReactNode; highlight?: boolean }) {
  return (
    <div className={cn("grid gap-2 rounded-md border p-3", highlight ? "border-accent bg-accent-soft" : "border-border")}>
      <span className="text-xs text-muted">{label}</span>
      {verdict}
    </div>
  );
}
