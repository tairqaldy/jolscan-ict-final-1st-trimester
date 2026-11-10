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
 * "Demo data" marker. Driven by the `isMock` flag of the module's results
 * file: data/experiments.json for roads, data/restroom-experiments.json for
 * restrooms. Set it to false once real results are in. `show` overrides the
 * flag for a single item (e.g. a placeholder row in a table of real rows).
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
    <Badge tone="accent" className={className} title="Numbers are invented placeholders until real results replace them">
      <FlaskConical aria-hidden />
      {label}
    </Badge>
  );
}
