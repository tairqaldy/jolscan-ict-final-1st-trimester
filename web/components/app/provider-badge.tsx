"use client";

import { Cloud, Laptop, Package } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useHydrated } from "@/lib/store/local-store";
import { settingsStore } from "@/lib/store/settings";
import type { Provider } from "@/lib/types";

export const PROVIDER_META: Record<Provider, { label: string; icon: typeof Cloud; description: string }> = {
  mock: { label: "Mock", icon: Package, description: "Canned results for the bundled samples, no model. Works offline." },
  local: { label: "Local", icon: Laptop, description: "Our model service on this laptop (YOLO for roads, CLIP for restrooms). Images stay on the device." },
  cloud: { label: "Cloud", icon: Cloud, description: "The same model service, hosted (Hugging Face Space). Needs internet; images leave the device." },
};

/** Shows which model provider both modules will use. Links to Settings. */
export function ProviderBadge({ className }: { className?: string }) {
  const { provider } = settingsStore.useStore();
  // The server and the first client render only know the default (mock); keep the
  // badge's space but hide it until the saved provider is read.
  const hydrated = useHydrated();
  const meta = PROVIDER_META[provider];
  const Icon = meta.icon;
  return (
    <Link
      href="/app/settings"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-border-strong px-2 py-0.5 text-xs font-medium text-muted hover:text-fg",
        !hydrated && "invisible",
        className,
      )}
      title={meta.description}
    >
      <Icon className="size-3.5" aria-hidden />
      <span>
        <span className="sr-only">Model provider: </span>
        {meta.label}
      </span>
    </Link>
  );
}
