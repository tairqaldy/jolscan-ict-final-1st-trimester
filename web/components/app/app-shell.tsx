"use client";

import { Ellipsis, Info } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MODULE_IDS, MODULES, type ModuleId } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { lastModuleStore } from "@/lib/store/module";
import { COURSE } from "@/lib/team";
import { DemoBadge } from "./demo-badge";
import { Logo } from "./logo";
import { HOME_ITEM, MODULE_ICONS, MODULE_NAV, PLATFORM_NAV, isActive, moduleFromPath, type NavItem } from "./nav";
import { ProviderBadge } from "./provider-badge";
import { ThemeToggle } from "./theme-toggle";

/**
 * App frame: sidebar on desktop (lg+), top bar + module tabs + bottom tab bar
 * on mobile. The module switcher (Roads / Restrooms) sits at the top of both.
 * On shared pages the sidebar shows the module the user last worked in.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lastModule = lastModuleStore.useStore();
  const pathModule = moduleFromPath(pathname);
  const current: ModuleId = pathModule ?? lastModule;
  const [moreOpen, setMoreOpen] = useState(false);
  const navReady = useNavReady();

  useEffect(() => {
    if (pathModule && pathModule !== lastModuleStore.get()) lastModuleStore.set(pathModule);
  }, [pathModule]);

  const moduleItems = MODULE_NAV[current];
  const mobileItems = [HOME_ITEM, ...moduleItems.filter((i) => i.mobile)];
  const moreItems = [...moduleItems.filter((i) => !i.mobile), ...PLATFORM_NAV];
  const moreActive = moreItems.some((i) => isActive(pathname, i));

  return (
    <div className="app-frame min-h-dvh bg-bg" data-nav-ready={navReady ? "" : undefined}>
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
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <nav aria-label="App" className="relative grid gap-5">
            <RailIndicator watch={`${pathname} ${current}`} />
            <ul className="grid gap-0.5">
              <SideLink item={HOME_ITEM} pathname={pathname} label="Home: both modules" />
            </ul>

            <div className="grid gap-2">
              <ModuleSwitcher current={current} pathModule={pathModule} variant="sidebar" />
              <p className="px-3 text-xs text-subtle">{MODULES[current].task}</p>
              <ul className="grid gap-0.5">
                {moduleItems.map((item) => (
                  <SideLink key={item.href} item={item} pathname={pathname} />
                ))}
              </ul>
            </div>

            <div className="grid gap-1">
              <p className="px-3 eyebrow text-subtle">Both modules</p>
              <ul className="grid gap-0.5">
                {PLATFORM_NAV.map((item) => (
                  <SideLink key={item.href} item={item} pathname={pathname} />
                ))}
              </ul>
            </div>
          </nav>
        </div>
        <div className="grid gap-3 border-t border-border px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <ProviderBadge />
            <DemoBadge show label="Includes demo data" />
          </div>
          <div className="flex items-center justify-between">
            <Link href="/about" className="link-underline inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg">
              <Info className="size-3.5" aria-hidden /> About · {COURSE.code}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile top bar + module tabs */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface lg:hidden">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <Logo href="/" />
          <div className="flex items-center gap-1.5">
            <DemoBadge show label="Demo data" />
            <ProviderBadge />
            <ThemeToggle />
          </div>
        </div>
        <ModuleSwitcher current={current} pathModule={pathModule} variant="bar" />
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
          {mobileItems.map((item) => {
            const active = isActive(pathname, item);
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
                    const active = isActive(pathname, item);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-12 items-center gap-3 rounded-md px-3 py-3 font-medium",
                            active ? "bg-surface-2" : "hover:bg-surface-2",
                          )}
                        >
                          <Icon className="size-5" aria-hidden />
                          {item.label}
                          {MODULE_NAV[current].includes(item as NavItem) && (
                            <span className="ml-auto text-xs font-normal text-muted">{MODULES[current].name}</span>
                          )}
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

function SideLink({ item, pathname, label }: { item: NavItem; pathname: string; label?: string }) {
  const active = isActive(pathname, item);
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={label}
        data-rail-link=""
        className={cn(
          "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
        )}
      >
        {active && <span aria-hidden className="rail-static-bar absolute inset-y-1.5 left-0 w-1 rounded-full bg-accent" />}
        <Icon className="size-4.5" aria-hidden />
        {item.label}
      </Link>
    </li>
  );
}

/**
 * Roads / Restrooms. Two links styled as a segmented control (sidebar) or as
 * full-width tabs (mobile). Plain links: Tab reaches each, Enter switches.
 * `aria-current` marks the module whose pages are shown.
 */
function ModuleSwitcher({
  current,
  pathModule,
  variant,
}: {
  current: ModuleId;
  pathModule: ModuleId | null;
  variant: "sidebar" | "bar";
}) {
  const index = MODULE_IDS.indexOf(current);
  return (
    <nav aria-label="Modules" className="relative" style={{ "--module-index": index } as CSSProperties}>
      {/* G-74: one thumb that slides to the current module (globals.css .module-thumb). */}
      <span
        aria-hidden
        className={cn(
          "module-thumb",
          variant === "sidebar"
            ? "inset-y-[calc(0.25rem_+_1px)] left-[calc(0.25rem_+_1px)] w-[calc((100%_-_0.75rem_-_2px)/2)] rounded-md bg-surface shadow-sm [--module-gap:0.25rem]"
            : "bottom-0 left-0 h-0.5 w-1/2 bg-accent",
        )}
      />
      <ul className={cn("grid grid-cols-2", variant === "sidebar" ? "gap-1 rounded-lg border border-border-strong bg-surface-2 p-1" : "")}>
        {MODULE_IDS.map((id) => {
          const m = MODULES[id];
          const Icon = MODULE_ICONS[id];
          const on = id === current;
          return (
            <li key={id}>
              <Link
                href={m.href}
                aria-current={on ? (pathModule === id ? "page" : "true") : undefined}
                title={`${m.name}: ${m.task}`}
                className={cn(
                  "relative flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors",
                  variant === "sidebar"
                    ? cn("h-9 rounded-md", on ? "text-fg" : "text-muted hover:text-fg")
                    : cn("h-12 border-b-2 border-transparent", on ? "text-fg" : "text-muted hover:text-fg"),
                )}
              >
                <Icon className="size-4" aria-hidden />
                {m.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * G-74: true one frame after the shell has mounted. Until then the rail bar
 * and the module thumb have no transition, so the first paint (and a module
 * read from localStorage after hydration) puts them in place without moving.
 */
function useNavReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);
  return ready;
}

/**
 * G-74: one accent bar for the whole rail. It slides to the rail link marked
 * aria-current="page" (transform only; timing and Reduce motion in
 * globals.css .rail-indicator) instead of jumping from item to item. Placed
 * again when the rail changes size (module switch, text zoom). Until it is
 * placed, the active link shows its own static bar (no-JS fallback).
 * The rail is the bar's parent <nav>: a ref on the nav is not attached yet
 * when this child's layout effect runs on the first mount.
 */
function RailIndicator({ watch }: { watch: string }) {
  const barRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const bar = barRef.current;
    const rail = bar?.parentElement;
    if (!bar || !rail) return;
    const place = () => {
      const link = rail.querySelector<HTMLElement>('a[data-rail-link][aria-current="page"]');
      rail.dataset.railIndicator = "";
      if (!link) {
        bar.dataset.hidden = "";
        return;
      }
      const top = link.getBoundingClientRect().top - rail.getBoundingClientRect().top;
      // Same inset as the static bar (inset-y-1.5).
      bar.style.height = `calc(${link.offsetHeight}px - 0.75rem)`;
      bar.style.transform = `translateY(calc(${top}px + 0.375rem))`;
      delete bar.dataset.hidden;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [watch]);
  return <span ref={barRef} aria-hidden className="rail-indicator" />;
}
