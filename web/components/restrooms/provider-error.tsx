"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { PROVIDER_META } from "@/components/app/provider-badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { cn } from "@/lib/cn";
import { useHydrated } from "@/lib/store/local-store";
import { settingsStore } from "@/lib/store/settings";
import type { Provider } from "@/lib/types";
import type { ApiError } from "@/lib/upload";

/** Plain-language error with one fix (U7): try again, or switch to mock and re-run. */
export function ProviderErrorCallout({
  error,
  provider,
  onRetry,
}: {
  error: ApiError["error"];
  provider: Provider;
  onRetry: (provider?: Provider) => void;
}) {
  return (
    <Callout
      tone="danger"
      title={error.message}
      action={
        <>
          <Button size="sm" variant="secondary" onClick={() => onRetry()}>
            <RotateCcw aria-hidden /> Try again
          </Button>
          {provider !== "mock" && (
            <Button
              size="sm"
              onClick={() => {
                settingsStore.set((s) => ({ ...s, provider: "mock" }));
                onRetry("mock");
              }}
            >
              Use the mock provider <ArrowRight aria-hidden />
            </Button>
          )}
        </>
      }
    >
      {error.hint && <p>{error.hint}</p>}
      <p className="mt-1 font-mono text-xs">code: {error.code}</p>
    </Callout>
  );
}

/** "Mock provider. Canned … Change" line shown above a run button. */
export function ProviderLine({ provider }: { provider: Provider }) {
  const meta = PROVIDER_META[provider];
  const hydrated = useHydrated();
  return (
    <div className={cn("flex items-start gap-3 text-sm", !hydrated && "invisible")}>
      <meta.icon className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
      <p>
        <span className="font-medium">{meta.label} provider.</span> <span className="text-muted">{meta.description}</span>{" "}
        <Link href="/app/settings" className="text-accent-ink underline underline-offset-2">
          Change
        </Link>
      </p>
    </div>
  );
}
