"use client";

import { ImageUp, LoaderCircle } from "lucide-react";
import { useState, type DragEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from "@/lib/upload";

/** The six looks of the drop zone (G-50). Shown side by side on /design. */
export const DROPZONE_STATES = ["idle", "drag-over", "invalid", "filled", "disabled", "busy"] as const;
export type DropzoneState = (typeof DROPZONE_STATES)[number];

/** Which look wins when several flags are on: busy and disabled block input, drag-over is live feedback. */
export function dropzoneState(flags: {
  dragging?: boolean;
  invalid?: boolean;
  filled?: boolean;
  disabled?: boolean;
  busy?: boolean;
}): DropzoneState {
  if (flags.busy) return "busy";
  if (flags.disabled) return "disabled";
  if (flags.dragging) return "drag-over";
  if (flags.invalid) return "invalid";
  if (flags.filled) return "filled";
  return "idle";
}

/**
 * Checks one chosen or dropped file with `validateImageFile` (lib/upload.ts) and
 * hands it on: a bad file goes to `onReject` with the message, a good one to
 * `onFile`. Returns the promise when `onFile` is async, so the zone can show busy.
 */
export function takeFile(
  file: File | undefined,
  onFile: (file: File) => void | Promise<void>,
  onReject: (message: string) => void,
): Promise<void> | undefined {
  if (!file) return undefined;
  const problem = validateImageFile(file);
  if (problem) {
    onReject(problem);
    return undefined;
  }
  const result = onFile(file);
  return result instanceof Promise ? result : undefined;
}

const BOX: Record<DropzoneState, string> = {
  idle: "border-border-strong bg-surface hover:bg-surface-2",
  "drag-over": "border-accent bg-accent-soft",
  invalid: "border-danger bg-surface hover:bg-surface-2",
  filled: "border-border-strong bg-surface hover:bg-surface-2",
  disabled: "border-border bg-surface-2 opacity-60",
  busy: "border-border-strong bg-surface-2",
};

/** Ring around a filled zone (the preview has its own border). */
const RING: Partial<Record<DropzoneState, string>> = {
  "drag-over": "ring-2 ring-accent",
  invalid: "ring-2 ring-danger",
};

/**
 * One upload drop zone for every image upload (G-50): roads Analyze and the
 * restroom sign slots. Click, Enter on the focused input, or drop a file.
 * The zone only checks type and size; what happens with a good file is the
 * caller's `onFile`, and the caller shows the `onReject` message.
 */
export function Dropzone({
  title,
  hint = "JPEG, PNG or WebP, up to 10 MB",
  onFile,
  onReject,
  preview,
  invalid,
  disabled,
  busy,
  inputLabel,
  shape = "banner",
  forceState,
  className,
}: {
  /** First line of the prompt, e.g. "Drop a photo here, or click to choose". */
  title: string;
  hint?: string;
  /** Called with a file that passed `validateImageFile`. May be async: the zone shows busy until it settles. */
  onFile: (file: File) => void | Promise<void>;
  /** Called with the `validateImageFile` message for a wrong type, an empty file or one over 10 MB. */
  onReject: (message: string) => void;
  /** Filled: shown inside the zone instead of the prompt (the sign slots). */
  preview?: ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  busy?: boolean;
  /** Accessible name of the file input when the prompt text is not enough. */
  inputLabel?: string;
  /** banner: wide, below a separate preview (Analyze). tile: 5:6 card with the preview inside (sign slots). */
  shape?: "banner" | "tile";
  /** Show one state regardless of input. Only for the /design page. */
  forceState?: DropzoneState;
  className?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const isBusy = busy || pending;
  const state = forceState ?? dropzoneState({ dragging, invalid, filled: !!preview, disabled, busy: isBusy });
  const blocked = state === "disabled" || state === "busy";

  const take = (file: File | undefined) => {
    if (blocked) return;
    const running = takeFile(file, onFile, onReject);
    if (running) {
      setPending(true);
      const done = () => setPending(false);
      running.then(done, done);
    }
  };

  const onDrop = (e: DragEvent) => {
    // Always prevent the default, or the browser opens the dropped file in the tab.
    e.preventDefault();
    setDragging(false);
    take(e.dataTransfer.files?.[0]);
  };

  const Icon = state === "busy" ? LoaderCircle : ImageUp;

  return (
    <label
      data-state={state}
      aria-busy={state === "busy" || undefined}
      onDragOver={(e) => {
        e.preventDefault();
        if (!blocked) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "relative block transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
        shape === "tile" ? "rounded-md" : "rounded-lg",
        state === "disabled" ? "cursor-not-allowed" : state === "busy" ? "cursor-progress" : "cursor-pointer",
        preview != null && RING[state],
        className,
      )}
    >
      {preview != null ? (
        <>
          {preview}
          {state === "busy" && (
            <span className="absolute inset-0 grid place-items-center rounded-md bg-surface/60">
              <LoaderCircle className="size-6 animate-spin text-muted" aria-hidden />
            </span>
          )}
        </>
      ) : (
        <span
          className={cn(
            "grid place-items-center border-2 border-dashed text-center transition-colors",
            shape === "tile" ? "aspect-[5/6] rounded-md px-3" : "rounded-lg px-6 py-8",
            BOX[state],
          )}
        >
          <span className="grid justify-items-center gap-2">
            <Icon className={cn("size-6", state === "invalid" ? "text-danger" : "text-muted", state === "busy" && "animate-spin")} aria-hidden />
            <span className={cn("font-medium", shape === "tile" && "text-sm")}>{title}</span>
            <span className={cn("text-muted", shape === "tile" ? "text-xs" : "text-sm")}>{hint}</span>
          </span>
        </span>
      )}
      <input
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        disabled={state === "disabled"}
        aria-label={inputLabel}
        aria-invalid={state === "invalid" || undefined}
        onChange={(e) => {
          take(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </label>
  );
}
