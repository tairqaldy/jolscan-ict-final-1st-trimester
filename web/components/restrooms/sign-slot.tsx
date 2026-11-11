"use client";

import { LayoutGrid, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Dropzone } from "@/components/ui/dropzone";
import { SelectableTile } from "@/components/ui/selectable-tile";
import { cn } from "@/lib/cn";
import { RESTROOM_SAMPLES, type RestroomSample } from "@/lib/mock/restroom-samples";
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
            <SelectableTile selected={selected} onClick={() => onPick(s)} className="grid w-full gap-1 p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.file} alt="" className="aspect-[5/6] w-full object-contain" loading="lazy" />
              <span className="text-xs leading-snug font-medium">{s.title}</span>
            </SelectableTile>
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
  const [pickerOpen, setPickerOpen] = useState(false);

  // The Dropzone has already checked type and size with validateImageFile.
  const pickFile = (file: File) => {
    setError(null);
    onChange({ kind: "file", file, previewUrl: URL.createObjectURL(file) });
  };

  const src = value?.kind === "sample" ? value.sample.file : value?.previewUrl;
  const title = value?.kind === "sample" ? value.sample.title : value?.file.name;

  return (
    <div className="grid content-start gap-3">
      <p className="eyebrow text-muted">{label}</p>
      <Dropzone
        shape="tile"
        title="Drop a sign image, or click to choose"
        inputLabel={`${label}: upload a sign image`}
        preview={src ? <SignImage src={src} alt={`${label}: ${title}`} /> : undefined}
        onFile={pickFile}
        onReject={setError}
        invalid={error !== null}
        disabled={disabled}
      />
      <p className="min-h-5 truncate text-sm font-medium" title={title}>
        {title ?? <span className="text-muted">No sign chosen</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" disabled={disabled} className="h-auto! min-h-8 py-1 whitespace-normal!">
              <LayoutGrid aria-hidden /> Choose a sample
            </Button>
          </DialogTrigger>
          <DialogContent title={`${label}: choose a sample sign`} description="Six sets of original drawings and six sets of real IOAI signs." className="max-w-2xl">
            <div className="max-h-[60vh] overflow-y-auto p-1">
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
