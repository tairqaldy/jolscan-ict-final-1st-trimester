import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ModuleId } from "@/lib/brand";
import { IS_DEMO_DATA } from "@/lib/mock/experiments";
import { RESTROOM_IS_DEMO } from "@/lib/mock/restroom-experiments";

/** True while the module's results file is a placeholder (its `isMock` flag). */
export function isDemo(module: ModuleId | "any"): boolean {
  if (module === "roads") return IS_DEMO_DATA;
  if (module === "restrooms") return RESTROOM_IS_DEMO;
  return IS_DEMO_DATA || RESTROOM_IS_DEMO;
}

/**
 * "Demo data" marker (requirement U8: demo numbers are never shown as real).
 * The badge follows the data on screen:
 *
 * - Results-file places leave `show` out: Pothole runs and Sign runs on
 *   /app/model, the results cards on the landing page and the two run charts.
 *   There the badge follows the `isMock` flag of the module's results file
 *   (data/experiments.json for roads, data/restroom-experiments.json for
 *   restrooms) through `isDemo(module)`.
 * - Every other place passes `show` itself: `show` where the seeded demo
 *   histories are on screen (they are always merged in, so the badge stays
 *   after the results files turn real), `show={provider === "mock"}` on a
 *   single result, `show={!row.isReal}` on a placeholder row.
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
  return (
    <Badge tone="accent" className={className} title="Invented for the demo, not a measured result">
      <FlaskConical aria-hidden />
      {label}
    </Badge>
  );
}
