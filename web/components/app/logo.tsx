import Link from "next/link";
import { cn } from "@/lib/cn";

/** Wordmark: an amber road-sign square with a lane dash, then "JolScan". */
export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 rounded-sm", className)} aria-label="JolScan home">
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect x="1" y="1" width="30" height="30" rx="6" className="fill-accent" />
        <path d="M16 5v5M16 14v5M16 23v4" className="stroke-accent-fg" strokeWidth="3" strokeLinecap="round" />
        <rect x="6.5" y="17" width="7" height="5" rx="2.5" className="fill-accent-fg" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">
        Jol<span className="text-accent-ink">Scan</span>
      </span>
    </Link>
  );
}
