import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Check, X } from "lucide-react";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { cn } from "@/lib/cn";
import {
  LAB_SETS,
  LAB_THEMES,
  columnTokens,
  contrastResults,
  getLabSet,
  variantOverrides,
  type LabSet,
  type LabTheme,
  type LabVariant,
} from "@/lib/design-lab";
import { LAB_FONT_VARIABLES } from "./fonts";
import { LabSpecimen } from "./lab-specimen";
import { TypeSpecimen } from "./type-specimen";
import "./lab.css";

export const metadata: Metadata = { title: "Design lab", robots: { index: false } };

/** Tailwind needs whole class names, so the column counts are spelled out. */
const GRID_COLS: Record<number, string> = { 1: "", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3" };

/**
 * Design lab (G-41): one set of token variants at a time, side by side, in the
 * light and the dark theme. A design tool, so it is not in the navigation and
 * not indexed; /design links to it. The sets live in lib/design-lab.ts.
 */
export default async function DesignLabPage({ searchParams }: PageProps<"/design/lab">) {
  const { set: setParam } = await searchParams;
  const set = getLabSet(typeof setParam === "string" ? setParam : undefined);

  return (
    <main id="main" className={cn(LAB_FONT_VARIABLES, "grid gap-10 px-4 py-10 sm:px-6 lg:px-10")}>
      <header className="grid max-w-3xl gap-3">
        <p className="eyebrow text-accent-ink">
          <Link href="/design" className="underline-offset-4 hover:underline">
            Design system
          </Link>{" "}
          / Lab
        </p>
        <h1 className="text-4xl font-bold">Design lab</h1>
        <p className="text-lg text-muted">
          Each column renders the same components and sets a few tokens inline. Column A sets nothing, so it is the live look;
          the others differ from it only in the tokens listed under their name. Nothing here changes{" "}
          <code className="font-mono text-base">app/tokens.css</code>.
        </p>
        <nav aria-label="Variant sets" className="flex flex-wrap gap-2">
          {LAB_SETS.map((s) => (
            <Link
              key={s.id}
              href={`/design/lab?set=${s.id}`}
              aria-current={s.id === set.id ? "page" : undefined}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium",
                s.id === set.id ? "border-accent bg-accent-soft text-fg" : "border-border-strong text-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              {s.title}
            </Link>
          ))}
        </nav>
      </header>

      <section aria-labelledby="set-title" className="grid gap-8">
        <div className="grid max-w-3xl gap-1">
          <h2 id="set-title" className="text-2xl font-bold">
            {set.title}
          </h2>
          <p className="font-mono text-xs text-subtle">
            {set.task} · /design/lab?set={set.id}
          </p>
          <p className="text-base text-muted">{set.question}</p>
        </div>

        {LAB_THEMES.map((theme) => (
          <div key={theme} className="grid gap-3">
            <h3 className="text-xl font-bold">{theme === "light" ? "Light theme" : "Dark theme"}</h3>
            <div className={cn("grid items-start gap-4", GRID_COLS[set.variants.length] ?? "lg:grid-cols-3")}>
              {set.variants.map((variant) => (
                <LabColumn key={variant.id} set={set} variant={variant} theme={theme} />
              ))}
            </div>
          </div>
        ))}

        <div className="grid max-w-3xl gap-1 rounded-lg border border-border bg-surface p-5">
          <h3 className="text-xl font-bold">Which one stays</h3>
          <p className="text-base text-muted">{set.outcome}</p>
        </div>
      </section>
    </main>
  );
}

function LabColumn({ set, variant, theme }: { set: LabSet; variant: LabVariant; theme: LabTheme }) {
  const overrides = variantOverrides(variant, theme);
  const names = Object.keys(overrides);

  return (
    <article
      data-theme={theme}
      data-lab-variant={variant.id}
      style={overrides as CSSProperties}
      aria-label={`${variant.name}, ${theme} theme`}
      className="grid min-w-0 gap-5 rounded-lg border border-border bg-bg p-(--card-pad) text-fg"
    >
      <div className="grid gap-1">
        <h4 className="text-lg font-bold">{variant.name}</h4>
        <p className="text-sm text-muted">{variant.note}</p>
        {names.length === 0 ? (
          <p className="font-mono text-xs text-subtle">No overrides: the live tokens.</p>
        ) : (
          <details className="font-mono text-xs text-subtle">
            <summary className="cursor-pointer">
              {names.length} {names.length === 1 ? "override" : "overrides"}
            </summary>
            <ul className="mt-1 grid gap-0.5">
              {names.map((n) => (
                <li key={n}>
                  {n}: {overrides[n]}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div data-lab-specimen>{set.specimen === "type" ? <TypeSpecimen /> : <LabSpecimen />}</div>

      {set.contrast && <ContrastTable set={set} variant={variant} theme={theme} />}
    </article>
  );
}

/** WCAG 2.x ratios of this column's colours, computed from the token values. */
function ContrastTable({ set, variant, theme }: { set: LabSet; variant: LabVariant; theme: LabTheme }) {
  const results = contrastResults(columnTokens(set, variant, theme));
  return (
    <div className="grid gap-2 rounded-lg border border-border bg-surface">
      <p className="px-5 pt-4 text-sm font-semibold">Contrast (WCAG 2.x, lowest on bg and surface)</p>
      <Table caption={`Contrast, ${variant.name}, ${theme} theme`}>
        <THead>
          <tr>
            <TH>Check</TH>
            <TH className="text-right">Ratio</TH>
            <TH className="text-right">Needs</TH>
          </tr>
        </THead>
        <tbody>
          {results.map((r) => (
            <TR key={r.label}>
              <TD className="py-2">
                {r.label}
                <span className="block font-mono text-xs text-subtle">
                  {r.fg} on {r.on.join(", ")}
                </span>
              </TD>
              <TD className="py-2 text-right font-mono">{r.ratio.toFixed(2)}</TD>
              <TD className="py-2 text-right">
                <span className={cn("inline-flex items-center gap-1 font-mono", r.pass ? "text-success" : "text-danger")}>
                  {r.pass ? <Check aria-hidden className="size-3.5" /> : <X aria-hidden className="size-3.5" />}
                  {r.min}
                  <span className="sr-only">{r.pass ? ", passes" : ", fails"}</span>
                </span>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
