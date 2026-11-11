"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Pause and Play for an auto-playing landing demo (WCAG 2.2.2). A real
 * <button>: the word and the accessible name say what a press does next, the
 * focus ring is the global :focus-visible one. 44 px tall on phones.
 * Put it in a wrapper with the .demo-loop-control class: globals.css hides
 * that wrapper when motion is reduced, because the demos do not loop then.
 */
export function DemoPauseButton({
  paused,
  onToggle,
  name,
  className,
}: {
  paused: boolean;
  onToggle: () => void;
  /** What is paused, for the accessible name, e.g. "roads demo". */
  name: string;
  className?: string;
}) {
  const action = paused ? "Play" : "Pause";
  const Icon = paused ? Play : Pause;
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onToggle}
      aria-label={`${action} ${name}`}
      className={cn("min-h-11 sm:min-h-0", className)}
    >
      <Icon aria-hidden />
      {action}
    </Button>
  );
}
