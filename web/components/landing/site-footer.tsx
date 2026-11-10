import Link from "next/link";
import { Logo } from "@/components/app/logo";
import { COURSE } from "@/lib/team";

export function SiteFooter() {
  return (
    <footer className="mt-[var(--section-gap)] border-t border-border bg-surface">
      <div className="lane-stripe opacity-60" aria-hidden />
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted">
            A course project for {COURSE.code} at {COURSE.school}. A prototype, not a production service: numbers marked
            “Demo data” are placeholders.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <li><Link href="/app" className="text-muted hover:text-fg">Dashboard</Link></li>
            <li><Link href="/app/analyze" className="text-muted hover:text-fg">Analyze</Link></li>
            <li><Link href="/app/rules" className="text-muted hover:text-fg">Rules</Link></li>
            <li><Link href="/app/model" className="text-muted hover:text-fg">Model</Link></li>
            <li><Link href="/about" className="text-muted hover:text-fg">About</Link></li>
            <li><Link href="/design" className="text-muted hover:text-fg">Design system</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container-page border-t border-border py-4 text-xs text-subtle">
        {COURSE.code} course project · {COURSE.school} · Map data © OpenStreetMap contributors
      </div>
    </footer>
  );
}
