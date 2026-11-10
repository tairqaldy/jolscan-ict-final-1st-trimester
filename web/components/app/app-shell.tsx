"use client";

import { Ellipsis, Info } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { COURSE } from "@/lib/team";
import { DemoBadge } from "./demo-badge";
import { Logo } from "./logo";
import { APP_NAV, isActive } from "./nav";
import { ProviderBadge } from "./provider-badge";
import { ThemeToggle } from "./theme-toggle";

/**
 * App frame: sidebar on desktop (lg+), top bar + bottom tab bar on mobile.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreItems = APP_NAV.filter((i) => !i.mobile);
  const moreActive = moreItems.some((i) => isActive(pathname, i.href));

  return (
    <div className="min-h-dvh bg-bg">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-accent px-3 py-2 text-accent-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-width)] flex-col border-r border-border bg-surface lg:flex">
        <div className="px-5 pt-5 pb-4">
          <Logo href="/" />
        </div>
        <div className="lane-stripe mx-5 mb-4 opacity-70" aria-hidden />
        <nav aria-label="App" className="flex-1 overflow-y-auto px-3">
          <ul className="grid gap-0.5">
            {APP_NAV.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    {active && <span aria-hidden className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-accent" />}
                    <Icon className="size-4.5" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="grid gap-3 border-t border-border px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <ProviderBadge />
            <DemoBadge />
          </div>
          <div className="flex items-center justify-between">
            <Link href="/about" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg">
              <Info className="size-3.5" aria-hidden /> About · {COURSE.code}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-surface px-4 lg:hidden">
        <Logo href="/" />
        <div className="flex items-center gap-1.5">
          <DemoBadge label="Demo" />
          <ProviderBadge />
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="pb-24 lg:pb-0 lg:pl-[var(--sidebar-width)]">
        <div className="mx-auto w-full max-w-[var(--content-max)] px-[var(--gutter)] py-6 lg:py-10">{children}</div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="App"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {APP_NAV.filter((i) => i.mobile).map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium",
                    active ? "text-fg" : "text-muted",
                  )}
                >
                  <span className={cn("grid h-7 w-12 place-items-center rounded-full", active && "bg-accent text-accent-fg")}>
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
              <DialogTrigger
                className={cn(
                  "flex h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium",
                  moreActive ? "text-fg" : "text-muted",
                )}
              >
                <span className={cn("grid h-7 w-12 place-items-center rounded-full", moreActive && "bg-accent text-accent-fg")}>
                  <Ellipsis className="size-4.5" aria-hidden />
                </span>
                More
              </DialogTrigger>
              <DialogContent title="More" side="bottom">
                <ul className="grid gap-1">
                  {[...moreItems, { href: "/about", label: "About the project", icon: Info }].map((item) => {
                    const Icon = item.icon;
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-3 font-medium",
                            active ? "bg-surface-2" : "hover:bg-surface-2",
                          )}
                        >
                          <Icon className="size-5" aria-hidden />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </DialogContent>
            </Dialog>
          </li>
        </ul>
      </nav>
    </div>
  );
}
