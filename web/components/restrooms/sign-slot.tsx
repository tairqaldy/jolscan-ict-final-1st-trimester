"use client";

import { ImageUp, LayoutGrid, X } from "lucide-react";
import { useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { RESTROOM_SAMPLES, type RestroomSample } from "@/lib/mock/restroom-samples";
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from "@/lib/upload";
import { SignImage } from "./signage-bits";

export type SlotValue = { kind: "sample"; sample: RestroomSample } | { kind: "file"; file: File; previewUrl: string };

/** Grid of the bundled sample signs; one click picks one. */
export function SamplePicker({
  selectedId,
  onPick,
  exclude,
  columns = "grid-cols-3 sm:grid-cols-4",
}: {
  selectedId?: string;
  onPick: (sample: RestroomSample) => void;
  exclude?: string;
  columns?: string;
}) {
  return (
    <ul className={cn("grid gap-2", columns)}>
      {RESTROOM_SAMPLES.filter((s) => s.id !== exclude).map((s) => {
        const selected = s.id === selectedId;
        return (
          <li key={s.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onPick(s)}
              className={cn(
                "grid w-full gap-1 rounded-md border-2 bg-surface p-1.5 text-left transition-colors",
                selected ? "border-accent" : "border-border hover:border-border-strong",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.file} alt="" className="aspect-[5/6] w-full object-contain" loading="lazy" />
              <span className="text-xs leading-snug font-medium">{s.title}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * One sign input: preview, drop or click to upload, or pick a sample in a
 * dialog. Used twice on Compare (door A, door B) and once on Match (query).
 */
export function SignSlot({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: SlotValue | null;
  onChange: (value: SlotValue | null) => void;
  disabled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    onChange({ kind: "file", file, previewUrl: URL.createObjectURL(file) });
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const src = value?.kind === "sample" ? value.sample.file : value?.previewUrl;
  const title = value?.kind === "sample" ? value.sample.title : value?.file.name;

  return (
    <div className="grid content-start gap-3">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">{label}</p>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative block cursor-pointer rounded-md transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
          dragging && "ring-2 ring-accent",
        )}
      >
        {src ? (
          <SignImage src={src} alt={`${label}: ${title}`} />
        ) : (
          <span
            className={cn(
              "grid aspect-[5/6] place-items-center rounded-md border-2 border-dashed px-3 text-center",
              dragging ? "border-accent bg-accent-soft" : "border-border-strong bg-surface hover:bg-surface-2",
            )}
          >
            <span className="grid justify-items-center gap-2">
              <ImageUp className="size-6 text-muted" aria-hidden />
              <span className="text-sm font-medium">Drop a sign image, or click to choose</span>
              <span className="text-xs text-muted">JPEG, PNG or WebP, up to 10 MB</span>
            </span>
          </span>
        )}
        <input
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="sr-only"
          disabled={disabled}
          aria-label={`${label}: upload a sign image`}
          onChange={(e) => {
            pickFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      <p className="min-h-5 truncate text-sm font-medium" title={title}>
        {title ?? <span className="text-muted">No sign chosen</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" disabled={disabled}>
              <LayoutGrid aria-hidden /> Choose a sample
            </Button>
          </DialogTrigger>
          <DialogContent title={`${label}: choose a sample sign`} description="Six sets of original drawings and six sets of real IOAI signs." className="max-w-2xl">
            <div className="max-h-[60vh] overflow-y-auto p-0.5">
              <SamplePicker
                selectedId={value?.kind === "sample" ? value.sample.id : undefined}
                onPick={(s) => {
                  setError(null);
                  onChange({ kind: "sample", sample: s });
                  setPickerOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)} disabled={disabled}>
            <X aria-hidden /> Remove
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
