import { CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "warning" | "danger" | "success";

const tones: Record<Tone, { box: string; icon: typeof Info }> = {
  info: { box: "border-border-strong bg-surface-2", icon: Info },
  warning: { box: "border-accent bg-accent-soft", icon: TriangleAlert },
  danger: { box: "border-danger bg-danger-soft", icon: TriangleAlert },
  success: { box: "border-success bg-sev-clear-soft", icon: CircleCheck },
};

/**
 * Inline message box. Uses role="alert" only for danger so screen readers announce errors.
 * `icon` replaces the tone's icon when the message has a concept of its own (G-24).
 */
export function Callout({
  tone = "info",
  icon,
  title,
  children,
  action,
  className,
}: {
  tone?: Tone;
  icon?: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const { box, icon: toneIcon } = tones[tone];
  const Icon = icon ?? toneIcon;
  return (
    <div role={tone === "danger" ? "alert" : undefined} className={cn("flex gap-3 rounded-md border-l-4 p-4", box, className)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {children && <div className="mt-1 text-sm text-muted">{children}</div>}
        {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  );
}
