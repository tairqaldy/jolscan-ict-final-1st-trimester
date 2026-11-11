import Link from "next/link";
import type { ReactNode } from "react";
import { SignImage } from "@/components/restrooms/signage-bits";
import { MODULES, type ModuleId } from "@/lib/brand";
import { markText, type Mark } from "@/lib/landing-rule-hits";
import { LANE, type DerivedDetection } from "@/lib/rules";
import type { Detection } from "@/lib/types";

/*
 * One rule hit in the landing section "Rules you can read" (G-61). Three ways
 * to show it are tried here (A current code block, B sentence with the
 * setting highlighted, C sample photo plus sentence); one is kept.
 * Every value comes from the rules engines in web/app/page.tsx.
 */

export type RuleHitCardProps = {
  module: ModuleId;
  context: string;
  ruleId: string;
  title: string;
  detail: string;
  effect: string;
  outcome: ReactNode;
  href: string;
};

function CardShell({ module, context, outcome, href, children }: Pick<RuleHitCardProps, "module" | "context" | "outcome" | "href"> & { children: ReactNode }) {
  return (
    <article className="grid content-start gap-4 rounded-lg border border-border bg-surface p-6">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
        {MODULES[module].name} · {context}
      </p>
      {children}
      <p className="flex flex-wrap items-center gap-2 text-sm">{outcome}</p>
      <Link href={href} className="text-sm font-medium text-accent-ink underline underline-offset-2">
        Change the thresholds and watch the result move
      </Link>
    </article>
  );
}

/** A: the current dark monospace block. */
export function RuleHitCardA(props: RuleHitCardProps) {
  const { ruleId, title, detail, effect } = props;
  return (
    <CardShell {...props}>
      <div className="rounded-md bg-inverse p-4 font-mono text-sm leading-relaxed text-inverse-fg">
        <p>
          <span className="opacity-70">{ruleId}</span> {title}
        </p>
        <p className="mt-1 opacity-85">{detail}</p>
        <p className="mt-2 font-semibold">→ {effect}</p>
      </div>
    </CardShell>
  );
}

/** The engine's sentence with the rule setting and the measured value marked. */
function RuleSentence({ ruleId, title, detail, effect, marks }: Pick<RuleHitCardProps, "ruleId" | "title" | "detail" | "effect"> & { marks: Mark[] }) {
  return (
    <div className="grid gap-2">
      <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
        <span className="font-mono text-muted">{ruleId}</span>
        <span className="font-semibold">{title}</span>
      </p>
      <p className="text-lg leading-relaxed">
        {markText(detail, marks).map((part, i) =>
          part.kind === "setting" ? (
            <mark key={i} className="tabular rounded-sm bg-accent-soft px-1 font-mono font-semibold text-accent-ink">
              {part.text}
            </mark>
          ) : part.kind === "value" ? (
            <strong key={i} className="tabular font-mono font-semibold">
              {part.text}
            </strong>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
        {" "}
        <span className="tabular inline-block rounded-sm border border-border-strong px-1.5 font-mono text-base font-semibold whitespace-nowrap">
          → {effect}
        </span>
      </p>
    </div>
  );
}

/** B: the rule as a sentence, with the setting you can change highlighted. */
export function RuleHitCardB(props: RuleHitCardProps & { marks: Mark[] }) {
  return (
    <CardShell {...props}>
      <RuleSentence {...props} />
    </CardShell>
  );
}

/** C: the sample the rule looked at, then the same sentence. */
export function RuleHitCardC(props: RuleHitCardProps & { marks: Mark[]; figure: ReactNode }) {
  return (
    <CardShell {...props}>
      {props.figure}
      <RuleSentence {...props} />
    </CardShell>
  );
}

/**
 * The road sample with the driving lane drawn in. A detection counts as in the
 * lane when its box centre is inside the zone (LANE in web/lib/rules/config.ts),
 * so the centres are marked too.
 */
export function LaneFigure({
  src,
  alt,
  width,
  height,
  detections,
  derived,
  laneLabel,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  detections: Detection[];
  derived: DerivedDetection[];
  laneLabel: string;
}) {
  const W = width;
  const H = height;
  const stroke = Math.max(2, W / 320);
  return (
    <figure className="relative w-full overflow-hidden rounded-md border border-border bg-surface-3" style={{ aspectRatio: `${W} / ${H}` }}>
      {/* Plain <img>: a local SVG sample, next/image adds nothing here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="absolute inset-0 size-full object-cover" draggable={false} />
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
        <rect
          x={LANE.minCx * W}
          y={LANE.minCy * H}
          width={(LANE.maxCx - LANE.minCx) * W}
          height={(1 - LANE.minCy) * H}
          fill="var(--box)"
          fillOpacity={0.14}
          stroke="var(--box)"
          strokeWidth={stroke}
          strokeDasharray={`${stroke * 5} ${stroke * 3}`}
        />
        {detections.map((d) => {
          const info = derived.find((x) => x.id === d.id);
          const inLane = Boolean(info?.inLane && info.counted);
          const x = d.box.x * W;
          const y = d.box.y * H;
          const w = d.box.w * W;
          const h = d.box.h * H;
          return (
            <g key={d.id} opacity={inLane ? 1 : 0.6}>
              <rect x={x} y={y} width={w} height={h} rx={stroke} fill="none" stroke="var(--box-halo)" strokeWidth={stroke * 2.4} />
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={stroke}
                fill="none"
                stroke={inLane ? "var(--box)" : "var(--box-active)"}
                strokeWidth={stroke}
                strokeDasharray={inLane ? undefined : `${stroke * 4} ${stroke * 2.5}`}
              />
              <circle cx={x + w / 2} cy={y + h / 2} r={stroke * 2.2} fill={inLane ? "var(--box)" : "var(--box-active)"} stroke="var(--box-halo)" strokeWidth={stroke} />
            </g>
          );
        })}
      </svg>
      <figcaption
        className="absolute rounded-sm bg-box px-1.5 py-0.5 font-mono text-xs font-semibold text-[var(--box-ink)]"
        style={{ left: `${LANE.minCx * 100}%`, bottom: 0 }}
      >
        {laneLabel}
      </figcaption>
    </figure>
  );
}

/** The two door signs of the sample pair, with the P(male) the rules compared. */
export function SignPairFigure({ doors }: { doors: { label: string; src: string; alt: string; pMale: string }[] }) {
  return (
    <figure className="grid w-full max-w-xs grid-cols-2 gap-3">
      {doors.map((door) => (
        <div key={door.label} className="grid gap-1.5">
          <SignImage src={door.src} alt={door.alt} />
          <p className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
            <span className="font-medium">{door.label}</span>
            <span className="tabular font-mono text-muted">P(male) {door.pMale}</span>
          </p>
        </div>
      ))}
    </figure>
  );
}
