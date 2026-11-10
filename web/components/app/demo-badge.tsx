import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IS_DEMO_DATA } from "@/lib/mock/experiments";

/**
 * "Demo data" marker. Driven by the single flag `isMock` in
 * data/experiments.json: set it to false once real results are in.
 */
export function DemoBadge({ className, label = "Demo data" }: { className?: string; label?: string }) {
  if (!IS_DEMO_DATA) return null;
  return (
    <Badge tone="accent" className={className} title="Numbers are invented placeholders until real results replace them">
      <FlaskConical aria-hidden />
      {label}
    </Badge>
  );
}
