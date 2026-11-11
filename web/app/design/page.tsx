import type { Metadata } from "next";
import { TokenReference, ThemedShowcase } from "@/components/design/design-showcase";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export const metadata: Metadata = { title: "Design system" };

/**
 * Living design-system page. Every value comes from app/tokens.css; every
 * primitive from components/ui. The three panels force light, dark and high
 * contrast (G-31) with a nested data-theme attribute. (Dialogs and tooltips render in a portal, so
 * they follow the page theme rather than the panel.)
 */
export default function DesignPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page public-container pt-12">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent-ink uppercase">Design system</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Asphalt, markings and signs</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Qarau&apos;s shared colours, typography and controls, shown in each theme. To refine the system, edit{" "}
          <code className="font-mono text-base">app/tokens.css</code> (and the fonts in{" "}
          <code className="font-mono text-base">app/layout.tsx</code>); components use tokens only.
        </p>

        <div className="mt-12">
          <TokenReference />
        </div>

        <h2 className="mt-14 text-2xl font-bold">Components in each theme</h2>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {(["light", "dark", "contrast"] as const).map((t) => (
            <div key={t} data-theme={t} className="rounded-xl border border-border bg-bg p-4 text-fg sm:p-6">
              <p className="mb-6 inline-flex rounded-sm bg-inverse px-2 py-0.5 font-mono text-xs text-inverse-fg">data-theme=&quot;{t}&quot;</p>
              <ThemedShowcase />
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
