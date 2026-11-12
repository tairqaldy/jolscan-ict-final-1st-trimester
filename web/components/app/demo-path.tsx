"use client";

import { EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { demoPathFor } from "@/lib/demo-path";
import { demoPathHiddenStore } from "@/lib/store/demo-path";
import { settingsStore } from "@/lib/store/settings";
import { LINK_ROW } from "./link-row";
import { ProviderBadge } from "./provider-badge";

/**
 * The demo script as numbered links (W-30). Recognition over recall: the
 * presenter clicks the next step instead of remembering sample ids.
 */
export function DemoPath() {
  const hidden = demoPathHiddenStore.useStore();
  const { provider } = settingsStore.useStore();
  const steps = demoPathFor(provider);

  if (hidden) {
    return (
      <p>
        <button
          type="button"
          onClick={() => demoPathHiddenStore.set(false)}
          className="text-sm font-medium text-accent-ink underline underline-offset-2"
        >
          Show the demo path
        </button>
      </p>
    );
  }

  return (
    <Card aria-labelledby="demo-path-h">
      <CardHeader>
        <div className="min-w-0 max-w-2xl">
          <CardTitle id="demo-path-h">Demo path</CardTitle>
          <CardDescription>
            One click per step. A link only picks the input; you press Analyze or Compare. The steps follow the provider:
            on Local or Cloud the road step takes a real photo instead of the drawn samples.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            Provider: <ProviderBadge />
          </span>
          <Button variant="ghost" size="sm" onClick={() => demoPathHiddenStore.set(true)}>
            <EyeOff aria-hidden /> Hide<span className="sr-only"> the demo path</span>
          </Button>
        </div>
      </CardHeader>
      <CardBody className="pt-4">
        <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.href}>
              <Link
                href={step.href}
                className={cn("flex h-full min-h-12 flex-col justify-center rounded-md border border-border px-3 py-2.5 sm:justify-start", LINK_ROW)}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="tabular grid size-5 shrink-0 place-items-center rounded-sm bg-inverse text-xs text-inverse-fg">
                    {i + 1}
                  </span>
                  {step.title}
                </span>
                {/* The notes are for the presenter on a laptop; on a phone the card stays one screen tall. */}
                <span className="mt-1 hidden text-xs text-muted sm:block">{step.note}</span>
              </Link>
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  );
}
