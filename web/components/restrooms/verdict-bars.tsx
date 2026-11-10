"use client";

import { DistributionBars } from "@/components/app/distribution-bars";
import { VERDICT_CLASSES, VERDICT_META } from "@/lib/signage-ui";
import { VERDICTS, type SignageVerdict } from "@/lib/types";

/** Verdict distribution as labelled horizontal bars (icon, word and count on every row). */
export function VerdictBars({ verdicts }: { verdicts: SignageVerdict[] }) {
  return (
    <DistributionBars
      unit="pairs"
      items={VERDICTS.map((v) => ({
        key: v,
        label: VERDICT_META[v].label,
        icon: VERDICT_META[v].icon,
        count: verdicts.filter((x) => x === v).length,
        solidClass: VERDICT_CLASSES[v].solid,
        textClass: VERDICT_CLASSES[v].text,
      }))}
    />
  );
}
