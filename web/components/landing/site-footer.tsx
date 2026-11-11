import Link from "next/link";
import { Logo } from "@/components/app/logo";
import { BRAND, MODULES } from "@/lib/brand";
import { DATA_CREDITS } from "@/lib/credits";
import { COURSE } from "@/lib/team";

const linkClass = "link-underline text-muted hover:text-fg";

export function SiteFooter() {
  return (
    <footer className="mt-[var(--section-gap)] border-t border-border bg-surface">
      <div className="lane-stripe opacity-60" aria-hidden />
      <div className="container-page public-container grid gap-8 py-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted">
            {COURSE.code} group project, {COURSE.school}. A prototype, not a city or campus service: anything with a demo or mock
            badge is invented for the demo.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <li><Link href="/app" className={linkClass}>App home</Link></li>
            <li><Link href={MODULES.roads.href} className={linkClass}>{MODULES.roads.name}</Link></li>
            <li><Link href={MODULES.restrooms.href} className={linkClass}>{MODULES.restrooms.name}</Link></li>
            <li><Link href="/app/model" className={linkClass}>Model</Link></li>
            <li><Link href="/about" className={linkClass}>About</Link></li>
            <li><Link href="/design" className={linkClass}>Design system</Link></li>
          </ul>
        </nav>
        <div className="grid content-start gap-2 text-sm">
          <p className="font-semibold">Data credits</p>
          <p className="text-muted">
            Potholes:{" "}
            <a href={DATA_CREDITS.pothole.url} className="text-accent-ink underline underline-offset-2">
              {DATA_CREDITS.pothole.name}
            </a>
            , by {DATA_CREDITS.pothole.author}. {DATA_CREDITS.pothole.licence}.
          </p>
          <p className="text-muted">
            Restrooms:{" "}
            <a href={DATA_CREDITS.restroom.url} className="text-accent-ink underline underline-offset-2">
              {DATA_CREDITS.restroom.name}
            </a>
            , {DATA_CREDITS.restroom.licence}. The drawn sample icons are original; the real sample signs are IOAI images.
          </p>
        </div>
      </div>
      <div className="container-page public-container border-t border-border py-4 text-xs text-subtle">
        {BRAND.name} · {COURSE.code} group project · {COURSE.school} · {DATA_CREDITS.map.name}
      </div>
    </footer>
  );
}
