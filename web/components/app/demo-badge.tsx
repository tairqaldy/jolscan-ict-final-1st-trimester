import { Cloud, FlaskConical, Laptop, Package, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { ModuleId } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { IS_DEMO_DATA } from "@/lib/mock/experiments";
import { RESTROOM_IS_DEMO } from "@/lib/mock/restroom-experiments";
import { resultProvenance } from "@/lib/mock/seeded";
import type { Provider } from "@/lib/types";

/** True while the module's results file is a placeholder (its `isMock` flag). */
export function isDemo(module: ModuleId | "any"): boolean {
  if (module === "roads") return IS_DEMO_DATA;
  if (module === "restrooms") return RESTROOM_IS_DEMO;
  return IS_DEMO_DATA || RESTROOM_IS_DEMO;
}

/**
 * Icons of the provenance badges. Mock, Local and Cloud are the same icons as
 * PROVIDER_META in provider-badge.tsx (lib/demo-badges.test.ts checks this).
 * They are listed here because provider-badge.tsx is a client module and this
 * badge also renders in server components.
 */
export const PROVENANCE_ICONS: Record<"demo" | Provider, LucideIcon> = {
  demo: FlaskConical,
  mock: Package,
  local: Laptop,
  cloud: Cloud,
};

/**
 * G-29: one badge set for where a number comes from. Same shape, size and icon
 * slot; the colour, icon and word differ, so the three never rely on colour alone (U3).
 * Amber means "not made by our model": filled for invented demo data, outlined
 * for the mock provider's canned answers. Slate (--chart-1, the measured-data
 * colour of the charts) means our model made it.
 */
const KIND_CLASSES = {
  demo: "border-transparent bg-accent-soft text-accent-ink",
  mock: "border-accent/60 bg-transparent text-accent-ink",
  model: "border-(--chart-1)/40 bg-(--chart-1)/10 text-(--chart-1)",
} as const;

type ProvenanceProps = { className?: string; label?: ReactNode; title?: string } & (
  | { kind: "demo" }
  | { kind: "mock" }
  | { kind: "model"; provider: "local" | "cloud"; model: string }
);

/**
 * Provenance badge (G-29, requirement U8):
 * - `demo`: "Demo data", seeded examples and placeholder numbers;
 * - `mock`: "Mock result", made by the mock provider (canned answers, no model);
 * - `model`: "Model result: <name>", made by our model through Local or Cloud.
 */
export function ProvenanceBadge(props: ProvenanceProps) {
  const { kind, className } = props;
  const Icon = PROVENANCE_ICONS[kind === "model" ? props.provider : kind];
  const label =
    props.label ??
    (kind === "demo" ? (
      "Demo data"
    ) : kind === "mock" ? (
      "Mock result"
    ) : (
      <>
        Model result: <span className="min-w-0 truncate font-mono">{props.model}</span>
      </>
    ));
  const title =
    props.title ??
    (kind === "demo"
      ? "Invented for the demo, not a measured result"
      : kind === "mock"
        ? "Canned answer from the mock provider. No model ran."
        : `Made by our model ${props.model} (${props.provider === "local" ? "Local" : "Cloud"} provider)`);
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-sm border px-2 py-px text-xs font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
        KIND_CLASSES[kind],
        className,
      )}
      title={title}
    >
      <Icon aria-hidden />
      {label}
    </span>
  );
}

/**
 * The one provenance badge of a single result (road analysis, compare check,
 * match). Which kind it shows is decided by `resultProvenance` (lib/mock/seeded.ts):
 * an invented seeded record never shows a model name.
 */
export function ResultProvenanceBadge({
  result,
  className,
}: {
  result: { id?: string; provider: Provider; model: string };
  className?: string;
}) {
  const p = resultProvenance(result);
  if (p.kind === "demo") return <ProvenanceBadge kind="demo" label="Invented demo record" className={className} />;
  if (p.kind === "mock") return <ProvenanceBadge kind="mock" className={className} />;
  return <ProvenanceBadge kind="model" provider={p.provider} model={p.model} className={className} />;
}

/**
 * "Demo data" marker (requirement U8: demo numbers are never shown as real).
 * A thin wrapper around `<ProvenanceBadge kind="demo">`. The badge follows the data on screen:
 *
 * - Results-file places leave `show` out: Pothole runs and Sign runs on
 *   /app/model, the results cards on the landing page and the two run charts.
 *   There the badge follows the `isMock` flag of the module's results file
 *   (data/experiments.json for roads, data/restroom-experiments.json for
 *   restrooms) through `isDemo(module)`.
 * - Every other place passes `show` itself: `show` where the seeded demo
 *   histories are on screen (they are always merged in, so the badge stays
 *   after the results files turn real), `show={!row.isReal}` on a placeholder row.
 *   A single result uses `ResultProvenanceBadge` instead.
 */
export function DemoBadge({
  className,
  label = "Demo data",
  module = "roads",
  show,
}: {
  className?: string;
  label?: string;
  module?: ModuleId | "any";
  show?: boolean;
}) {
  if (!(show ?? isDemo(module))) return null;
  return <ProvenanceBadge kind="demo" label={label} className={className} />;
}
