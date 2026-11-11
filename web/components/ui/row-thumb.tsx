"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Small picture at the start of a table row, so a row is recognised by its
 * photo instead of remembered by its name (G-68).
 *
 * Always 36 px high. `photo` is 16:9 (64 x 36, cropped to fill), `sign` is
 * 5:6 (30 x 36, the whole sign shown). The box has a fixed size before the
 * image loads, so rows never jump. With no `src`, or if it fails to load, a
 * neutral box is shown instead.
 *
 * Plain <img>: the sources are local SVG samples and small data: URLs kept in
 * this browser; next/image adds nothing here (see signage-bits.tsx).
 */
export function RowThumb({
  src,
  alt,
  ratio = "photo",
  className,
}: {
  src?: string;
  /** Describes the picture (sample title or file name), not "thumbnail". */
  alt: string;
  ratio?: "photo" | "sign";
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const box = cn("h-9 shrink-0 rounded-sm bg-surface-2", ratio === "photo" ? "w-16" : "w-7.5", className);

  if (!src || failedSrc === src) {
    return (
      <span role="img" aria-label="No photo stored" className={cn(box, "grid place-items-center text-subtle")}>
        <ImageOff className="size-3.5" aria-hidden />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={ratio === "photo" ? 64 : 30}
      height={36}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailedSrc(src)}
      className={cn(box, ratio === "photo" ? "object-cover" : "object-contain")}
    />
  );
}
