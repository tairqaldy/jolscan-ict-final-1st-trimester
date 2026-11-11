"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Logo } from "@/components/app/logo";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { ButtonLink } from "@/components/ui/button";

const LINKS = [
  { href: "/#modules", label: "Tools" },
  { href: "/#how", label: "How it works" },
  { href: "/#rules", label: "Rules" },
  { href: "/#results", label: "Results" },
  { href: "/#team", label: "Team" },
  { href: "/about", label: "About" },
];

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
function currentHash() { return window.location.hash; }
function serverHash() { return ""; }

/** Public-page navigation keeps ordinary links and the active section visible. */
export function SiteHeader() {
  const path = usePathname();
  const hash = useSyncExternalStore(subscribeToHash, currentHash, serverHash);
  const current = (href: string) => href === "/about" ? path === "/about" : path === "/" && href === `/${hash}`;
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg">
      <div className="container-page public-container flex h-16 items-center gap-4 lg:gap-8">
        <Logo />
        <nav aria-label="Main" className="mx-auto hidden min-w-0 md:block">
          <ul className="jelly-nav flex items-center gap-2 lg:gap-4">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} aria-current={current(l.href) ? "location" : undefined} className="jelly-nav__link mx-auto w-fit whitespace-nowrap text-sm font-medium text-muted">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
          <ThemeToggle />
          <ButtonLink href="/app" size="sm">Open the app</ButtonLink>
          <details className="public-menu relative md:hidden">
            <summary className="public-menu__toggle">Menu</summary>
            <nav aria-label="Mobile navigation" className="public-menu__panel">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} aria-current={current(l.href) ? "location" : undefined} className="public-menu__link" onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>{l.label}</a>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
