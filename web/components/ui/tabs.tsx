"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import type { InteractionState } from "./states";

export const Tabs = RadixTabs.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn("flex gap-1 overflow-x-auto border-b border-border", className)}
      {...props}
    />
  );
}

/*
 * G-6 states. The underline is a ::after bar that grows from the centre:
 * a grey preview on hover, amber when the tab is selected (the old tab's bar
 * shrinks as the new one grows, --duration-base). Focus: the ring eases in.
 * Disabled: 50 % and a not-allowed cursor. Reduce motion shows the end state.
 * The focus ring sits inside the tab: the list scrolls sideways, which would
 * clip a ring drawn outside.
 */
export const TABS_HOVER = "text-fg! after:scale-x-100!";
export const TABS_FOCUS = "outline-2 -outline-offset-2 outline-focus";

export function TabsTrigger({
  className,
  forceState,
  ...props
}: ComponentProps<typeof RadixTabs.Trigger> & {
  /** Draws a hover or focus look without the pointer. Only for /design. */
  forceState?: InteractionState;
}) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "relative -mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium whitespace-nowrap text-muted transition-colors duration-[var(--duration-fast)] ease-standard focus-ring-in focus-visible:-outline-offset-2 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:scale-x-0 after:bg-subtle after:transition-[scale,background-color] after:duration-[var(--duration-base)] after:ease-standard enabled:hover:text-fg enabled:hover:after:scale-x-100 disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:text-fg data-[state=active]:after:scale-x-100 data-[state=active]:after:bg-accent",
        forceState === "hover" && TABS_HOVER,
        forceState === "focus" && TABS_FOCUS,
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof RadixTabs.Content>) {
  return <RadixTabs.Content className={cn("pt-4", className)} {...props} />;
}
