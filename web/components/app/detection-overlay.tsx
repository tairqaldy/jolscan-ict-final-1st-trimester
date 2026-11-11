"use client";

import { ImageOff } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";
import { useHydrated } from "@/lib/store/local-store";
import type { DerivedDetection } from "@/lib/rules";
import type { Detection } from "@/lib/types";

/**
 * A photo with the detection boxes drawn over it as SVG.
 * Box coordinates are normalised (0..1), so the overlay uses a viewBox in the
 * image's pixel size and scales with the photo.
 *
 * Styles: counted = solid amber; review = dashed violet; ignored = faint dashed.
 * The style difference is backed by a label on each box, not colour alone.
 */
export function DetectionOverlay({
  imageUrl,
  imageWidth,
  imageHeight,
  detections,
  derived,
  activeId,
  onActiveChange,
  drawIn = true,
  replayKey,
  alt,
  className,
}: {
  imageUrl?: string;
  imageWidth: number;
  imageHeight: number;
  detections: Detection[];
  derived?: DerivedDetection[];
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
  /** Animate boxes drawing in (only when mounted after hydration). */
  drawIn?: boolean;
  /** Change to replay the draw-in animation. */
  replayKey?: string | number;
  alt: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  // Server-rendered boxes are drawn at once (visible without JS); only overlays
  // mounted later in the browser, or replayed, animate in.
  const hydrated = useHydrated();
  const [failed, setFailed] = useState(false);
  const W = imageWidth || 1280;
  const H = imageHeight || 720;
  const stroke = Math.max(2, W / 320);
  const font = Math.max(12, W / 50);
  const animate = drawIn && !reduce && hydrated;

  return (
    <figure
      className={cn("relative w-full overflow-hidden rounded-lg border border-border bg-surface-3", className)}
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      {imageUrl && !failed ? (
        // Plain <img>: sources are local SVG samples or small data: URLs, next/image adds nothing here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailed(true)}
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-4 text-center text-sm text-muted">
          <div className="grid justify-items-center gap-2">
            <ImageOff className="size-6" aria-hidden />
            <span>The photo is not stored on this device. Boxes are shown on a blank frame.</span>
          </div>
        </div>
      )}

      <svg
        key={replayKey}
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 size-full"
        aria-hidden
      >
        {detections.map((d, i) => {
          const info = derived?.find((x) => x.id === d.id);
          const review = info?.review ?? false;
          const ignored = info ? !info.counted && !info.review : false;
          const active = activeId === d.id;
          const x = d.box.x * W;
          const y = d.box.y * H;
          const w = d.box.w * W;
          const h = d.box.h * H;
          const colour = active ? "var(--box-active)" : review ? "var(--box-review)" : "var(--box)";
          const tag = `${i + 1} · ${Math.round(d.confidence * 100)}%${review ? " review" : ignored ? " ignored" : ""}`;
          const tagW = tag.length * font * 0.58 + font * 0.8;
          const tagY = y - font * 1.5 < 0 ? y + h : y - font * 1.5;
          const delay = animate ? 0.25 + i * 0.18 : 0;
          return (
            <g
              key={d.id}
              onMouseEnter={() => onActiveChange?.(d.id)}
              onMouseLeave={() => onActiveChange?.(null)}
              style={{ cursor: onActiveChange ? "pointer" : undefined, opacity: ignored ? 0.55 : 1 }}
            >
              {/* Dark under-stroke keeps boxes visible on light and dark photos. */}
              <rect x={x} y={y} width={w} height={h} fill="none" stroke="var(--box-halo)" strokeWidth={stroke * 2.4} rx={stroke} />
              <motion.rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={stroke}
                fill={active ? "var(--box-fill-active)" : "transparent"}
                stroke={colour}
                strokeWidth={active ? stroke * 1.6 : stroke}
                strokeDasharray={review || ignored ? `${stroke * 4} ${stroke * 2.5}` : undefined}
                initial={animate ? { pathLength: 0, opacity: 0 } : false}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: duration.draw, delay, ease: ease.emphasized }}
              />
              <motion.g
                initial={animate ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: duration.base, delay: delay + duration.draw * 0.7 }}
              >
                <rect x={x} y={tagY} width={tagW} height={font * 1.5} rx={stroke} fill={colour} />
                <text
                  x={x + font * 0.4}
                  y={tagY + font * 1.08}
                  fontSize={font}
                  fontFamily="var(--font-code), monospace"
                  fontWeight={500}
                  fill="var(--box-ink)"
                >
                  {tag}
                </text>
              </motion.g>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
