import { Logo } from "@/components/app/logo";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { ButtonLink } from "@/components/ui/button";

const LINKS = [
  { href: "/#modules", label: "Modules" },
  { href: "/#how", label: "How it works" },
  { href: "/#rules", label: "Rules" },
  { href: "/#results", label: "Results" },
  { href: "/#team", label: "Team" },
  { href: "/about", label: "About" },
];

/** Header for the public pages (landing, about, design). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-fg">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink href="/app" size="sm">
            Open the app
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
