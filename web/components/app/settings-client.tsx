"use client";

import { Download, LoaderCircle, Monitor, Moon, PlugZap, RotateCcw, Sun, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { SliderField } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { BRAND } from "@/lib/brand";
import { historyStore, useAnalyses } from "@/lib/store/history";
import { restroomHistoryStore, useRestroomChecks } from "@/lib/store/restroom-history";
import { rulesStore, settingsStore, signageRulesStore } from "@/lib/store/settings";
import { themeStore, type ThemePreference } from "@/lib/store/theme";
import { PROVIDERS, type Provider } from "@/lib/types";
import type { HealthResult } from "@/lib/providers/types";
import { PROVIDER_META } from "./provider-badge";

type Check = { state: "idle" } | { state: "checking" } | { state: "done"; result: HealthResult };

export function SettingsClient() {
  const settings = settingsStore.useStore();
  const rules = rulesStore.useStore();
  const theme = themeStore.useStore();
  const history = historyStore.useStore();
  const analyses = useAnalyses();
  const signChecks = useRestroomChecks();
  const restroomHistory = restroomHistoryStore.useStore();
  const [checks, setChecks] = useState<Record<Provider, Check>>({
    mock: { state: "idle" },
    local: { state: "idle" },
    cloud: { state: "idle" },
  });
  const [resetDone, setResetDone] = useState(false);

  const check = async (p: Provider) => {
    setChecks((c) => ({ ...c, [p]: { state: "checking" } }));
    try {
      const res = await fetch(`/api/health?provider=${p}`, { cache: "no-store" });
      const result = (await res.json()) as HealthResult;
      setChecks((c) => ({ ...c, [p]: { state: "done", result } }));
    } catch {
      setChecks((c) => ({
        ...c,
        [p]: { state: "done", result: { ok: false, provider: p, status: "network", latencyMs: 0, message: "Could not reach the app server." } },
      }));
    }
  };

  const exportJson = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedFrom: `${BRAND.name} prototype`,
            note: "Items with source 'demo' are invented demo data.",
            roads: { analyses },
            restrooms: { checks: signChecks },
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${BRAND.storagePrefix}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    historyStore.reset();
    restroomHistoryStore.reset();
    rulesStore.reset();
    signageRulesStore.reset();
    settingsStore.reset();
    setResetDone(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div>
            <CardTitle>Model provider</CardTitle>
            <CardDescription>Where images are sent, for both modules. The rules are applied the same way whichever provider answers.</CardDescription>
          </div>
        </CardHeader>
        <CardBody>
          <fieldset>
            <legend className="sr-only">Model provider</legend>
            <div className="grid gap-3 md:grid-cols-3">
              {PROVIDERS.map((p) => {
                const meta = PROVIDER_META[p];
                const Icon = meta.icon;
                const selected = settings.provider === p;
                const c = checks[p];
                const blocked = p === "cloud" && settings.keepPhotosLocal;
                return (
                  <div
                    key={p}
                    className={cn(
                      "grid content-between gap-4 rounded-lg border-2 p-4 transition-colors",
                      selected ? "border-accent bg-accent-soft" : "border-border",
                    )}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="radio"
                        name="provider"
                        value={p}
                        checked={selected}
                        onChange={() => settingsStore.set((s) => ({ ...s, provider: p }))}
                        className="mt-1 size-4 accent-[var(--accent)]"
                      />
                      <span>
                        <span className="flex items-center gap-2 font-display text-lg font-semibold">
                          <Icon className="size-4.5" aria-hidden /> {meta.label}
                        </span>
                        <span className="mt-1 block text-sm text-muted">{meta.description}</span>
                        {blocked && <span className="mt-1 block text-sm text-accent-ink">Blocked by the privacy option below.</span>}
                      </span>
                    </label>
                    <div className="grid gap-2">
                      <Button variant="secondary" size="sm" onClick={() => void check(p)} disabled={c.state === "checking"}>
                        {c.state === "checking" ? <LoaderCircle className="animate-spin" aria-hidden /> : <PlugZap aria-hidden />}
                        Check connection
                      </Button>
                      <div aria-live="polite" className="text-sm">
                        {c.state === "done" &&
                          (c.result.ok ? (
                            <p className="text-sev-clear-ink">
                              Connected · {c.result.model ?? "model"} on {c.result.device ?? "?"} ({c.result.latencyMs} ms)
                            </p>
                          ) : (
                            <p className="text-sev-critical-ink">{c.result.message ?? `Not available (${c.result.status}).`}</p>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Roads: detection threshold</CardTitle>
            <CardDescription>Same value as rule R1 on the Rules page.</CardDescription>
          </div>
        </CardHeader>
        <CardBody>
          <SliderField
            label="Confidence threshold"
            value={rules.r1.threshold}
            min={0.25}
            max={0.95}
            step={0.01}
            onChange={(v) => rulesStore.set((r) => ({ ...r, r1: { ...r.r1, threshold: v, reviewFloor: Math.min(r.r1.reviewFloor, v) } }))}
          />
          <p className="mt-3 text-sm text-muted">
            Boxes at or above this value are counted. Between {rules.r1.reviewFloor.toFixed(2)} and this value they go to
            the review queue.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Road photos can show people, number plates and where they were taken. Restroom images must show signs only, never people.</CardDescription>
          </div>
        </CardHeader>
        <CardBody className="grid gap-5">
          <Switch
            label="Keep photos on this device only"
            description="Blocks the cloud provider. History thumbnails are stored only in this browser."
            checked={settings.keepPhotosLocal}
            onCheckedChange={(v) => settingsStore.set((s) => ({ ...s, keepPhotosLocal: v, provider: v && s.provider === "cloud" ? "mock" : s.provider }))}
          />
          <Switch
            label="Strip GPS from photo metadata"
            description="Uploads are re-drawn in the browser before sending, which removes all EXIF data including GPS."
            checked={settings.stripGps}
            onCheckedChange={(v) => settingsStore.set((s) => ({ ...s, stripGps: v }))}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Appearance and language</CardTitle>
          </div>
        </CardHeader>
        <CardBody className="grid gap-5">
          <Segmented<ThemePreference>
            label="Theme"
            value={theme}
            onChange={(v) => themeStore.set(v)}
            options={[
              { value: "system", label: "System", icon: Monitor },
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
            ]}
          />
          <Select
            label="Language"
            value="en"
            onValueChange={() => {}}
            options={[
              { value: "en", label: "English" },
              { value: "ru", label: "Русский", disabled: true, hint: "coming soon" },
              { value: "kk", label: "Қазақша", disabled: true, hint: "coming soon" },
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Data</CardTitle>
            <CardDescription>
              {history.length} road {history.length === 1 ? "analysis" : "analyses"} and {restroomHistory.length} sign{" "}
              {restroomHistory.length === 1 ? "check" : "checks"} made in this browser, plus the demo sets.
            </CardDescription>
          </div>
        </CardHeader>
        <CardBody className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportJson}>
              <Download aria-hidden /> Export everything as JSON
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost">
                  <RotateCcw aria-hidden /> Reset demo data
                </Button>
              </DialogTrigger>
              <DialogContent
                title="Reset demo data?"
                description="This clears road analyses and sign checks made in this browser, your rule changes in both modules and your settings. The seeded demo sets stay. Theme is kept."
              >
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="danger" onClick={resetAll}>
                      <Trash2 aria-hidden /> Reset
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {resetDone && (
            <Callout tone="success" title="Reset done">
              Local history, rules and settings of both modules are back to their defaults.
            </Callout>
          )}
          <p className="text-xs text-muted">
            Everything here lives in this browser&apos;s localStorage. There is no account and no database in the prototype.
          </p>
          <Badge tone="outline" className="w-fit">
            Provider URLs and keys are read on the server only
          </Badge>
        </CardBody>
      </Card>
    </div>
  );
}
