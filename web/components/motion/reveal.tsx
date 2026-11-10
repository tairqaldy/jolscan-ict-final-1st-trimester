import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Staggered entry: wrap a section in <Stagger>, its children in <StaggerItem>.
 *
 * CSS only (globals.css: .stagger). Items start from visible content (slightly
 * faded and lower) and settle, so the first paint, screenshots, slow devices
 * and pages without JS never show an empty section. The delay steps come from
 * :nth-child, so items need no index. Off under prefers-reduced-motion.
 * Server components: no client JS.
 */
export function Stagger({
  children,
  className,
  as: Comp = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "ol";
  /** Kept for API compatibility; entry is CSS-driven and plays on first paint. */
  inView?: boolean;
}) {
  return <Comp className={cn("stagger", className)}>{children}</Comp>;
}

export function StaggerItem({
  children,
  className,
  as: Comp = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  return <Comp className={className}>{children}</Comp>;
}
