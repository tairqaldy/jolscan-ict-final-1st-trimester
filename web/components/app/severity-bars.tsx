"use client";

import { SEVERITY_CLASSES, SEVERITY_META } from "@/lib/severity";
import type { Severity } from "@/lib/types";
import { DistributionBars } from "./distribution-bars";

/** Severity distribution as labelled horizontal bars (icon, word and count on every row). */
export function SeverityBars({ counts }: { counts: { severity: Severity; count: number }[] }) {
  return (
    <DistributionBars
      unit="photos"
      items={counts.map(({ severity, count }) => ({
        key: severity,
        label: SEVERITY_META[severity].label,
        icon: SEVERITY_META[severity].icon,
        count,
        solidClass: SEVERITY_CLASSES[severity].solid,
        textClass: SEVERITY_CLASSES[severity].text,
      }))}
    />
  );
}
