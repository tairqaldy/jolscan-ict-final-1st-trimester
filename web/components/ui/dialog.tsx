"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

/** Modal dialog (Radix): focus trap, Escape to close, labelled by its title. */
export function DialogContent({
  title,
  description,
  children,
  className,
  side = "center",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** "bottom" renders as a sheet, used by the mobile navigation. */
  side?: "center" | "bottom";
}) {
  return (
    <RadixDialog.Portal>
      {/* G-6: overlay fades, the dialog scales up from 96 % and the sheet slides up (globals.css .dialog-*). */}
      <RadixDialog.Overlay className="dialog-overlay fixed inset-0 z-50 bg-inverse/50" />
      <RadixDialog.Content
        className={cn(
          "fixed z-50 border border-border bg-surface p-5 text-fg shadow-lg",
          side === "center" ? "dialog-panel" : "dialog-sheet",
          side === "center"
            ? "top-1/2 left-1/2 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg"
            : "inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-lg pb-[max(1.25rem,env(safe-area-inset-bottom))]",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <RadixDialog.Title className="font-display text-xl font-semibold">{title}</RadixDialog.Title>
            {description ? (
              <RadixDialog.Description className="mt-1 text-sm text-muted">{description}</RadixDialog.Description>
            ) : (
              <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
            )}
          </div>
          <RadixDialog.Close
            className="-m-1 rounded-sm p-1 text-muted transition-colors duration-[var(--duration-fast)] ease-standard focus-ring-in hover:bg-surface-2 hover:text-fg"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </RadixDialog.Close>
        </div>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
