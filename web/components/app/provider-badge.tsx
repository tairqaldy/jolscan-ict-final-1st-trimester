"use client";

import { Cloud, Laptop, Package } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { settingsStore } from "@/lib/store/settings";
import type { Provider } from "@/lib/types";

export const PROVIDER_META: Record<Provider, { label: string; icon: typeof Cloud; description: string }> = {
  mock: { label: "Mock", icon: Package, description: "Canned detections for the bundled samples. Works offline." },
  local: { label: "Local", icon: Laptop, description: "FastAPI service on this laptop running our YOLO weights. Photos stay on the device." },
  cloud: { label: "Cloud", icon: Cloud, description: "Hosted model service (Hugging Face Space or Roboflow). Needs internet; photos leave the device." },
};

/** Shows which model provider analyses will use. Links to Settings. */
export function ProviderBadge({ className }: { className?: string }) {
  const { provider } = settingsStore.useStore();
  const meta = PROVIDER_META[provider];
  const Icon = meta.icon;
  return (
    <Link
      href="/app/settings"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-border-strong px-2 py-0.5 text-xs font-medium text-muted hover:text-fg",
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
