import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/cn";

/**
 * Wordmark: an accent square with a viewfinder (inspection) around a pothole,
 * then the product name from lib/brand.ts. Chosen from three directions in G-53
 * because its corners stay legible at 16 px. The same mark is app/icon.svg and
 * public/brand/*.svg; a rename only touches brand.ts and the wordmark SVG.
 */
export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 rounded-sm", className)} aria-label={`${BRAND.name} home`}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect x="1" y="1" width="30" height="30" rx="7" className="fill-accent" />
        <path
          d="M8 13.5V8h5.5M18.5 8H24v5.5M24 18.5V24h-5.5M13.5 24H8v-5.5"
          className="stroke-accent-fg"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse cx="16" cy="16.5" rx="3.6" ry="2.4" className="fill-accent-fg" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">{BRAND.name}</span>
    </Link>
  );
}
