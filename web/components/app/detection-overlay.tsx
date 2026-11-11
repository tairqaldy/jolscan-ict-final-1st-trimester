"use client";

import { ImageOff } from "lucide-react";
import { motion, useReducedMotionConfig } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";
import { useHydrated } from "@/lib/store/local-store";
import type { DerivedDetection } from "@/lib/rules";
import type { Detection } from "@/lib/types";

/** Smallest box tag text on screen, in CSS pixels (G-28). */
export const MIN_TAG_PX = 11;

/**
 * Width of the dark halo under each box, as a multiple of the box stroke
 * (G-48; was 2.4). On a 343 px phone photo it leaves a dark rim of about
 * 1.6 px on each side of the stroke, so a box stays outlined where it
 * crosses a white or yellow road marking. The halo colour is --box-halo.
 */
export const HALO_SCALE = 4;

/**
 * Box tag font size in viewBox units. `scale` is screen pixels per viewBox
 * unit. Until the figure has been measured (server render and first client
 * render) it is null and the tag keeps the fixed size from before G-28, so the
 * server and client HTML match. Once measured, the tag never shows below
 * MIN_TAG_PX on screen; wide screens keep the old size.
 */
export function tagFontSize(viewBoxWidth: number, scale: number | null): number {
  const base = Math.max(12, viewBoxWidth / 50);
  if (!scale || scale <= 0) return base;
  return Math.max(base, MIN_TAG_PX / scale);
}

/**
 * Top-left corner of a box tag (viewBox units). The tag sits above the box, or
 * below its top edge when there is no room, and is pushed back inside the photo
 * so it never runs past the right or bottom edge.
 */
export function placeTag(
  box: { x: number; y: number; h: number },
  tag: { w: number; h: number },
  frame: { w: number; h: number },
): { x: number; y: number } {
  const above = box.y - tag.h;
  return insidePhoto(box.x, above < 0 ? box.y + box.h : above, tag, frame);
}

/** Moves a tag's top-left corner so the whole tag stays inside the photo. */
function insidePhoto(x: number, y: number, tag: { w: number; h: number }, frame: { w: number; h: number }) {
  return {
    x: Math.max(0, Math.min(x, frame.w - tag.w)),
    y: Math.max(0, Math.min(y, frame.h - tag.h)),
  };
}

/** Area two tags share, counting `gap` of space around each as shared too (viewBox units squared). */
function sharedArea(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  gap: number,
): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + gap;
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + gap;
  return w > 0 && h > 0 ? w * h : 0;
}

/**
 * Top-left corners of all box tags, placed in box order so a later tag never
 * covers an earlier one. Each tag first takes the placeTag spot. If that is
 * within `gap` of an earlier tag, it tries below the box (so a small box stays
 * visible), then inside the box at its top, then inside the box at its bottom,
 * and takes the first free spot (or, if none is free, the one that covers the
 * least). Every spot stays inside the photo.
 */
export function placeTags(
  items: { box: { x: number; y: number; h: number }; tag: { w: number; h: number } }[],
  frame: { w: number; h: number },
  gap = 0,
): { x: number; y: number }[] {
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  return items.map(({ box, tag }) => {
    const spots = [
      placeTag(box, tag, frame),
      insidePhoto(box.x, box.y + box.h, tag, frame),
      insidePhoto(box.x, box.y, tag, frame),
      insidePhoto(box.x, box.y + box.h - tag.h, tag, frame),
    ];
    let best = spots[0];
    let bestCover = Infinity;
    for (const spot of spots) {
      const cover = placed.reduce((sum, other) => sum + sharedArea({ ...spot, ...tag }, other, gap), 0);
      if (cover < bestCover) {
        best = spot;
        bestCover = cover;
      }
      if (cover === 0) break;
    }
    placed.push({ ...best, ...tag });
    return best;
  });
}

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
  const reduce = useReducedMotionConfig();
  // Prefix for the mask ids of the dashed boxes; useId may contain characters that url(#…) dislikes.
  const maskPrefix = `overlay${useId().replace(/[^\w-]/g, "")}`;
  // Server-rendered boxes are drawn at once (visible without JS); only overlays
  // mounted later in the browser, or replayed, animate in.
  const hydrated = useHydrated();
  const [failed, setFailed] = useState(false);
  // Rendered size of the figure, read in an effect (never during render) so
  // the first render matches the server; null until measured.
  const figureRef = useRef<HTMLElement>(null);
  const [rendered, setRendered] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = figureRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setRendered({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const W = imageWidth || 1280;
  const H = imageHeight || 720;
  const stroke = Math.max(2, W / 320);
  // The SVG fits the viewBox inside the figure ("meet"), so the smaller ratio is the on-screen scale.
  const scale = rendered ? Math.min(rendered.w / W, rendered.h / H) : null;
  const font = tagFontSize(W, scale);
  const animate = drawIn && !reduce && hydrated;
  // Tag text and size per box, then every tag's spot at once so later tags step around earlier ones.
  const tags = detections.map((d, i) => {
    const info = derived?.find((x) => x.id === d.id);
    const review = info?.review ?? false;
    const ignored = info ? !info.counted && !info.review : false;
    const text = `${i + 1} · ${Math.round(d.confidence * 100)}%${review ? " review" : ignored ? " ignored" : ""}`;
    return { text, w: text.length * font * 0.58 + font * 0.8, h: font * 1.5 };
  });
  const tagSpots = placeTags(
    detections.map((d, i) => ({ box: { x: d.box.x * W, y: d.box.y * H, h: d.box.h * H }, tag: tags[i] })),
    { w: W, h: H },
    stroke,
  );

  return (
    <figure
      ref={figureRef}
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
          const { text: tag, w: tagW, h: tagH } = tags[i];
          const { x: tagX, y: tagY } = tagSpots[i];
          const delay = animate ? 0.25 + i * 0.18 : 0;
          const fill = active ? "var(--box-fill-active)" : "transparent";
          const strokeWidth = active ? stroke * 1.6 : stroke;
          const dash = review || ignored ? `${stroke * 4} ${stroke * 2.5}` : undefined;
          const draw = { duration: duration.draw, delay, ease: ease.emphasized };
          const maskId = `${maskPrefix}-draw-${i}`;
          return (
            <g
              key={d.id}
              onMouseEnter={() => onActiveChange?.(d.id)}
              onMouseLeave={() => onActiveChange?.(null)}
              style={{ cursor: onActiveChange ? "pointer" : undefined, opacity: ignored ? 0.55 : 1 }}
            >
              {/* Dark under-stroke keeps boxes visible on light and dark photos. */}
              <rect x={x} y={y} width={w} height={h} fill="none" stroke="var(--box-halo)" strokeWidth={stroke * HALO_SCALE} rx={stroke} />
              {dash ? (
                <>
                  {/* Review and ignored boxes are dashed. motion's pathLength writes its own
                      stroke-dasharray (one solid dash), so the box is a plain dashed rect and the
                      draw-in runs on a mask that uncovers it along its outline. With reduced
                      motion the mask is full from the start. */}
                  <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
                    <motion.rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx={stroke}
                      fill="none"
                      stroke="white"
                      strokeWidth={stroke * 2}
                      initial={animate ? { pathLength: 0, opacity: 0 } : false}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={draw}
                    />
                  </mask>
                  <rect x={x} y={y} width={w} height={h} rx={stroke} fill={fill} />
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={stroke}
                    fill="none"
                    stroke={colour}
                    strokeWidth={strokeWidth}
                    strokeDasharray={dash}
                    mask={`url(#${maskId})`}
                  />
                </>
              ) : (
                <motion.rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={stroke}
                  fill={fill}
                  stroke={colour}
                  strokeWidth={strokeWidth}
                  initial={animate ? { pathLength: 0, opacity: 0 } : false}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={draw}
                />
              )}
              <motion.g
                initial={animate ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: duration.base, delay: delay + duration.draw * 0.7 }}
              >
                <rect x={tagX} y={tagY} width={tagW} height={tagH} rx={stroke} fill={colour} />
                <text
                  x={tagX + font * 0.4}
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
