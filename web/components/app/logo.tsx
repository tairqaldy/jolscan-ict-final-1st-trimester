import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/cn";

/**
 * Wordmark: an accent square with a viewfinder mark (inspection), then the
 * product name from lib/brand.ts. The mark is generic on purpose so a rename
 * only touches brand.ts.
 */
export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 rounded-sm", className)} aria-label={`${BRAND.name} home`}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect x="1" y="1" width="30" height="30" rx="6" className="fill-accent" />
        <path
          d="M8 12V9a1 1 0 0 1 1-1h3M20 8h3a1 1 0 0 1 1 1v3M24 20v3a1 1 0 0 1-1 1h-3M12 24H9a1 1 0 0 1-1-1v-3"
          className="stroke-accent-fg"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="16" cy="16" r="3.2" className="fill-accent-fg" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">{BRAND.name}</span>
    </Link>
  );
}
