"use client";

import { LayoutGrid, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Dropzone } from "@/components/ui/dropzone";
import { Segmented } from "@/components/ui/segmented";
import { SelectableTile } from "@/components/ui/selectable-tile";
import { cn } from "@/lib/cn";
import { useHydrated } from "@/lib/store/local-store";
import { settingsStore } from "@/lib/store/settings";
import {
  RESTROOM_IOAI_CATALOGUE,
  RESTROOM_IOAI_CREDIT,
  RESTROOM_IOAI_GROUPS,
  RESTROOM_SAMPLES,
  type IoaiGroupId,
  type RestroomSample,
} from "@/lib/mock/restroom-samples";
import { SignImage } from "./signage-bits";

export type SlotValue = { kind: "sample"; sample: RestroomSample } | { kind: "file"; file: File; previewUrl: string };

type PickerGroup = "bundled" | IoaiGroupId;

/** Grid of sample signs, one click picks one: the bundled samples or, with `withIoai`, every IOAI sign. */
export function SamplePicker({
  selectedId,
  onPick,
  exclude,
  columns = "grid-cols-3 sm:grid-cols-4",
  withIoai = false,
}: {
  selectedId?: string;
  onPick: (sample: RestroomSample) => void;
  exclude?: string;
  columns?: string;
  withIoai?: boolean;
}) {
  const [group, setGroup] = useState<PickerGroup>(() => {
    const picked = RESTROOM_IOAI_CATALOGUE.find((s) => s.id === selectedId);
    return picked ? picked.group : "bundled";
  });
  // The bundled drawings (SVG) are for the mock provider only; a real model refuses them.
  const realModel = useHydrated() && settingsStore.useStore().provider !== "mock";
  const list: RestroomSample[] =
    group === "bundled" ? RESTROOM_SAMPLES : RESTROOM_IOAI_CATALOGUE.filter((s) => s.group === group);
  return (
    <div className="grid gap-3">
      {withIoai && (
        <div className="grid gap-1.5">
          <Segmented
            label="Signs"
            hideLabel
            value={group}
            onChange={setGroup}
            options={[
              { value: "bundled", label: `Samples (${RESTROOM_SAMPLES.length})` },
              ...RESTROOM_IOAI_GROUPS.map((g) => ({ value: g.id as PickerGroup, label: `${g.label} (${g.count})` })),
            ]}
          />
          {group === "bundled" && realModel && (
            <p className="text-xs text-muted">These samples are drawings that only the Mock provider can read. Pick a real IOAI sign above.</p>
          )}
          {group !== "bundled" && (
            <p className="text-xs text-muted">
              Real IOAI door signs. With the mock provider their gender, confidence and similarity are real zero-shot CLIP
              outputs; validation and test genders were labelled by eye. {RESTROOM_IOAI_CREDIT}
            </p>
          )}
        </div>
      )}
      <ul className={cn("grid gap-2", columns)}>
        {list.filter((s) => s.id !== exclude).map((s) => {
          const selected = s.id === selectedId;
          return (
            <li key={s.id}>
              <SelectableTile
                selected={selected}
                disabled={realModel && !selected && s.file.endsWith(".svg")}
                onClick={() => onPick(s)}
                className="grid w-full gap-1 p-1.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.file} alt="" className="aspect-[5/6] w-full object-contain" loading="lazy" />
                <span className="text-xs leading-snug font-medium">{s.title}</span>
              </SelectableTile>
            </li>
          );
        })}
      </ul>
    </div>
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
      {/* Two lines, not one cut line: the end of a name ("..., women") says which door it is. */}
      <p className="min-h-5 text-sm font-medium line-clamp-2" title={title}>
        {title ?? <span className="text-muted">No sign chosen</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              disabled={disabled}
              aria-label={`${label}: choose a sample`}
              className="h-auto! min-h-8 py-1 whitespace-normal!"
            >
              <LayoutGrid aria-hidden /> <span className="sm:hidden">Sample</span>
              <span className="max-sm:hidden">Choose a sample</span>
            </Button>
          </DialogTrigger>
          <DialogContent title={`${label}: choose a sample sign`} description="The bundled samples, or any IOAI door sign from the validation, test or training set." className="max-w-3xl">
            <div className="max-h-[60vh] overflow-y-auto p-1">
              <SamplePicker
                withIoai
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
