import {
  ArrowRight,
  BookOpenText,
  Brain,
  Camera,
  Cloud,
  Cpu,
  GitCompareArrows,
  Laptop,
  ListChecks,
  Lock,
  ScanSearch,
  ServerCog,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { DemoBadge } from "@/components/app/demo-badge";
import { MODULE_ICONS } from "@/components/app/nav";
import { HeroDemo } from "@/components/landing/hero-demo";
import { PairDemo } from "@/components/landing/pair-demo";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { TeamGrid } from "@/components/landing/team-grid";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { VerdictBadge } from "@/components/restrooms/signage-bits";
import { SeverityBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BRAND, MODULES, type ModuleId } from "@/lib/brand";
import { COURSE } from "@/lib/team";
import { formatSla } from "@/lib/format";
import { BASELINE, CHAMPION, EXPERIMENTS, IS_DEMO_DATA } from "@/lib/mock/experiments";
import { RESTROOM_CHAMPION, RESTROOM_EXPERIMENTS, RESTROOM_IS_DEMO } from "@/lib/mock/restroom-experiments";
import { RESTROOM_PRESETS, getRestroomSample, mockSimilarity } from "@/lib/mock/restroom-samples";
import { getSample } from "@/lib/mock/samples";
import { scoreDetections } from "@/lib/rules";
import { evaluateSignage } from "@/lib/signage";

/* One real rule hit from each engine, computed at build time from the bundled samples. */
const roadSample = getSample("s01")!;
const roadResult = scoreDetections(roadSample.detections, roadSample.meta);
const roadHit = roadResult.ruleHits.find((h) => h.ruleId === "R3")!;

const faint = RESTROOM_PRESETS.find((p) => p.id === "faint")!;
const faintA = getRestroomSample(faint.a)!;
const faintB = getRestroomSample(faint.b)!;
const signResult = evaluateSignage({ a: faintA.mock, b: faintB.mock, similarity: mockSimilarity(faintA.id, faintB.id) });
const signHit = signResult.ruleHits.find((h) => !h.passed)!;

const STEPS = [
  {
    icon: Camera,
    title: "Photo",
    text: "A dashcam frame of a road, or a phone photo of a door sign. Files are checked in the browser and GPS metadata is stripped before upload.",
  },
  {
    icon: Brain,
    title: "Model",
    text: "Roads: a YOLO detector returns a box and a confidence for every pothole. Restrooms: CLIP turns each sign into an embedding, which gives its gender and how alike two signs are.",
  },
  {
    icon: SlidersHorizontal,
    title: "Rules",
    text: "Short, editable rules turn model output into a decision. The same rules score the result whether the model ran on this laptop or in the cloud.",
  },
  {
    icon: ListChecks,
    title: "Action",
    text: "A repair priority with a target time, or a signage verdict with what to do next. Uncertain cases go to a review queue instead of being hidden.",
  },
];

const COURSE_TOPICS = [
  {
    title: "CNN and YOLO detection",
    text: "Detection answers what and where. A one-stage YOLO detector, fine-tuned from COCO weights, draws a box around each pothole.",
    source: "Lec8 p11, p40",
  },
  {
    title: "CLIP and Vision Transformers",
    text: "CLIP’s ViT image encoder turns a sign into an embedding. Zero-shot text prompts read the gender with no training at all.",
    source: "Lec8 p46–47, p56",
  },
  {
    title: "Transfer learning",
    text: "Both models start pretrained. We fine-tune only the last layers, one change per run against a fixed baseline.",
    source: "Lec8 p38, A2 p1",
  },
  {
    title: "MLOps",
    text: "MLflow tracks every run, a FastAPI service serves both models locally or in the cloud, and the analytics page watches for drift.",
    source: "Lec9 p31–53",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section className="container-page pt-12 pb-14 lg:pt-20 lg:pb-20">
          <Stagger className="grid max-w-4xl gap-6">
            <StaggerItem>
              <p className="text-xs font-semibold tracking-[0.18em] text-accent-ink uppercase">
                {BRAND.name} ({BRAND.nativeName}) · {BRAND.meaning}
              </p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="text-4xl leading-[1.02] font-bold sm:text-5xl lg:text-[4.5rem]">
                Inspect roads and buildings from a photo.
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="max-w-2xl text-lg text-muted">
                {BRAND.name} runs a computer vision model on a photo, then applies rules anyone can read to decide what needs
                fixing and how soon. Two modules today: potholes on roads, and confusing restroom door signs.
              </p>
            </StaggerItem>
            <StaggerItem className="flex flex-wrap gap-3">
              <ButtonLink href="/app" size="lg">
                Open the app <ArrowRight aria-hidden />
              </ButtonLink>
              <ButtonLink href="#how" size="lg" variant="secondary">
                See how it works
              </ButtonLink>
            </StaggerItem>
            <StaggerItem>
              <p className="inline-flex flex-wrap items-center gap-2 text-sm text-muted">
                {COURSE.code} course prototype. Runs on demo data until the trained models are connected. <DemoBadge show />
              </p>
            </StaggerItem>
          </Stagger>
        </section>

        <div className="lane-stripe" aria-hidden />

        {/* Problem */}
        <section id="problem" className="container-page scroll-mt-20 pt-[var(--section-gap)]" aria-labelledby="problem-h">
          <SectionTitle id="problem-h" eyebrow="The problem" title="Most inspection is still done by eye" />
          <Stagger className="mt-8 grid gap-4 md:grid-cols-2">
            <StaggerItem as="article" className="rounded-lg border border-border bg-surface p-6">
              <h3 className="text-xl font-bold">Potholes are found late</h3>
              <p className="mt-2 text-muted">
                Most are reported by drivers after they damage a car. An inspector cannot drive every street every week, and a
                list of complaints does not say which hole to fix first.
              </p>
            </StaggerItem>
            <StaggerItem as="article" className="rounded-lg border border-border bg-surface p-6">
              <h3 className="text-xl font-bold">Door signs confuse visitors</h3>
              <p className="mt-2 text-muted">
                Signs are installed once and rarely checked. When the two doors of a restroom carry signs from different sets, or
                two signs that look alike, people hesitate or walk into the wrong room. Nobody audits signage across a campus.
              </p>
            </StaggerItem>
          </Stagger>
          <p className="mt-6 max-w-3xl text-lg">
            Both are the same job: look at a photo, find the problem, decide what to do. {BRAND.name} makes that job faster and
            more consistent, and shows how every decision was made.
          </p>
        </section>

        {/* Modules */}
        <section id="modules" className="container-page scroll-mt-20 pt-[var(--section-gap)]" aria-labelledby="modules-h">
          <SectionTitle id="modules-h" eyebrow="The platform" title="One platform, two modules" />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ModuleCard
              id="roads"
              demo={<HeroDemo />}
              text="A YOLO object detector draws a box around each pothole. Six rules weigh size, lane position, clusters, road class and school zones into a repair priority with a target time."
              output="Severity, score and target time"
              cta={{ href: "/app/roads/analyze?sample=s01", label: "Analyze a road photo", icon: ScanSearch }}
            />
            <ModuleCard
              id="restrooms"
              demo={<PairDemo />}
              text="A CLIP image encoder reads each door sign: which gender it shows, and how alike two designs are. Three rules turn a pair into clear, review or confusing."
              output="Verdict and recommended action"
              cta={{
                href: `/app/restrooms/compare?a=${RESTROOM_PRESETS[0].a}&b=${RESTROOM_PRESETS[0].b}`,
                label: "Compare two signs",
                icon: GitCompareArrows,
              }}
            />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="container-page scroll-mt-20 pt-[var(--section-gap)]" aria-labelledby="how-h">
          <SectionTitle id="how-h" eyebrow="How it works" title="Photo, model, rules, action" />
          <Stagger as="ol" className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <StaggerItem as="li" key={s.title} className="relative rounded-lg border border-border bg-surface p-6">
                  <span className="font-display text-6xl leading-none font-bold text-surface-3" aria-hidden>
                    {i + 1}
                  </span>
                  <div className="mt-4 flex items-center gap-2">
                    <Icon className="size-5 text-accent-ink" aria-hidden />
                    <h3 className="text-2xl font-bold">{s.title}</h3>
                  </div>
                  <p className="mt-2 text-muted">{s.text}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>

        {/* Rules you can read */}
        <section id="rules" className="container-page scroll-mt-20 pt-[var(--section-gap)]" aria-labelledby="rules-h">
          <SectionTitle id="rules-h" eyebrow="Explainable by design" title="Rules you can read" />
          <p className="mt-3 max-w-3xl text-muted">
            The model only reports what it sees. The decision comes from rules the team wrote down, and every result lists which
            rules fired. Two real rule hits, computed by the same code the app runs:
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <RuleHitCard
              module="roads"
              context="Highway sample, three potholes"
              ruleId={roadHit.ruleId}
              title={roadHit.title}
              detail={roadHit.detail}
              effect={`+${roadHit.points} points`}
              outcome={
                <>
                  <SeverityBadge severity={roadResult.severity} /> score {roadResult.score} · {formatSla(roadResult.slaHours)}
                </>
              }
              href="/app/roads/rules"
            />
            <RuleHitCard
              module="restrooms"
              context={`${faint.title} sample pair`}
              ruleId={signHit.ruleId}
              title={signHit.title}
              detail={signHit.detail}
              effect="Failed"
              outcome={
                <>
                  <VerdictBadge verdict={signResult.verdict} /> {signResult.recommendedAction}
                </>
              }
              href="/app/restrooms/rules"
            />
          </div>
        </section>

        {/* Local or cloud, privacy */}
        <section id="privacy" className="container-page scroll-mt-20 pt-[var(--section-gap)]" aria-labelledby="privacy-h">
          <SectionTitle id="privacy-h" eyebrow="Deployment" title="Local or cloud, private by default" />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <Feature icon={Laptop} title="Local">
              Both trained models run in a FastAPI service on the laptop. Images never leave the device.
            </Feature>
            <Feature icon={Cloud} title="Cloud, opt-in">
              The same service on a hosted endpoint, for more capacity. Chosen in Settings; a privacy switch blocks it.
            </Feature>
            <Feature icon={ServerCog} title="Mock">
              Canned results for the bundled samples keep the demo working offline. Every number it shows is marked as demo data.
            </Feature>
          </div>
          <ul className="mt-6 grid gap-3 text-sm text-muted sm:grid-cols-2">
            <PrivacyPoint icon={ShieldCheck}>GPS and camera metadata are stripped in the browser before an upload is sent.</PrivacyPoint>
            <PrivacyPoint icon={Lock}>No accounts and no server database: history stays in this browser and can be cleared.</PrivacyPoint>
            <PrivacyPoint icon={Camera}>Road photos can show faces and plates, so the cloud model is off until you choose it.</PrivacyPoint>
            <PrivacyPoint icon={Cpu}>Restroom images are door-sign icons only. Never upload a photo taken inside a restroom.</PrivacyPoint>
          </ul>
        </section>

        {/* Results teaser */}
        <section id="results" className="container-page scroll-mt-20 pt-[var(--section-gap)]" aria-labelledby="results-h">
          <SectionTitle id="results-h" eyebrow="Results" title="What the models score" />
          <p className="mt-3 max-w-3xl text-muted">
            Both modules follow the same protocol: one change per run against a fixed baseline, chosen on validation, test read
            once. Invented numbers carry a demo badge.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <ResultsCard module="roads" badge={<DemoBadge show={IS_DEMO_DATA} label="Placeholder numbers" />}>
              <Metric label="mAP50-95" value={CHAMPION.map5095.toFixed(2)} note={`baseline ${BASELINE.map5095.toFixed(2)}`} />
              <Metric label="Recall" value={CHAMPION.recall.toFixed(2)} note={`baseline ${BASELINE.recall.toFixed(2)}`} />
              <p className="col-span-2 text-sm text-muted">
                {EXPERIMENTS.runs.length} runs. Selected: <span className="font-mono">{CHAMPION.id}</span> ({CHAMPION.changed.toLowerCase()}).
              </p>
            </ResultsCard>
            <ResultsCard module="restrooms" badge={<DemoBadge
                  module="restrooms"
                  show={RESTROOM_IS_DEMO}
                  label={RESTROOM_CHAMPION?.isReal ? "Some runs still pending" : "Our runs pending"}
                />}>
              <Metric
                label="Our top-1 accuracy"
                value={RESTROOM_CHAMPION?.matchTop1Test != null ? RESTROOM_CHAMPION.matchTop1Test.toFixed(2) : "not run yet"}
                note={RESTROOM_CHAMPION ? `run ${RESTROOM_CHAMPION.run}, test set` : `${RESTROOM_EXPERIMENTS.runs.length} runs planned, R0–R6`}
                small={RESTROOM_CHAMPION?.matchTop1Test == null}
              />
              <Metric
                label="IOAI reference"
                value={`${RESTROOM_EXPERIMENTS.reference.ioaiBaseline.toFixed(2)} / ${RESTROOM_EXPERIMENTS.reference.ioaiBest.toFixed(2)}`}
                note="baseline / best, published by IOAI, not our runs"
              />
            </ResultsCard>
          </div>
          <p className="mt-4 text-sm text-muted">
            <Link href="/app/model" className="font-medium text-accent-ink underline underline-offset-2">
              See every run and what the metrics mean
            </Link>
          </p>
        </section>

        {/* Course */}
        <section id="course" className="container-page scroll-mt-20 pt-[var(--section-gap)]" aria-labelledby="course-h">
          <SectionTitle id="course-h" eyebrow={`Built on ${COURSE.code}`} title="What the course taught, applied" />
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {COURSE_TOPICS.map((t) => (
              <StaggerItem as="article" key={t.title} className="rounded-lg border border-border bg-surface p-6">
                <BookOpenText className="size-5 text-accent-ink" aria-hidden />
                <h3 className="mt-3 text-xl font-bold">{t.title}</h3>
                <p className="mt-2 text-muted">{t.text}</p>
                <p className="mt-3 font-mono text-xs text-subtle">{t.source}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Team */}
        <section id="team" className="container-page scroll-mt-20 pt-[var(--section-gap)]" aria-labelledby="team-h">
          <SectionTitle id="team-h" eyebrow="Team" title="Six students, one platform" />
          <p className="mt-3 text-muted">
            {COURSE.code} group project at {COURSE.school}. Each lane has one owner.
          </p>
          <div className="mt-8">
            <TeamGrid />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SectionTitle({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-accent-ink uppercase">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-3xl font-bold sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

function ModuleCard({
  id,
  demo,
  text,
  output,
  cta,
}: {
  id: ModuleId;
  demo: ReactNode;
  text: string;
  output: string;
  cta: { href: string; label: string; icon: typeof ScanSearch };
}) {
  const m = MODULES[id];
  const Icon = MODULE_ICONS[id];
  return (
    <article className="grid content-start gap-5 rounded-xl border border-border bg-surface p-5 sm:p-6" aria-labelledby={`card-${id}`}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-inverse text-inverse-fg">
          <Icon className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">{m.name}</p>
          <h3 id={`card-${id}`} className="text-2xl font-bold">
            {m.task}
          </h3>
        </div>
      </div>
      {demo}
      <p className="text-muted">{text}</p>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm">
          <span className="text-muted">Output:</span> <span className="font-medium">{output}</span>
        </p>
        <ButtonLink href={cta.href}>
          <cta.icon aria-hidden /> {cta.label}
        </ButtonLink>
      </div>
    </article>
  );
}

function RuleHitCard({
  module,
  context,
  ruleId,
  title,
  detail,
  effect,
  outcome,
  href,
}: {
  module: ModuleId;
  context: string;
  ruleId: string;
  title: string;
  detail: string;
  effect: string;
  outcome: ReactNode;
  href: string;
}) {
  return (
    <article className="grid content-start gap-4 rounded-lg border border-border bg-surface p-6">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
        {MODULES[module].name} · {context}
      </p>
      <div className="rounded-md bg-inverse p-4 font-mono text-sm leading-relaxed text-inverse-fg">
        <p>
          <span className="opacity-70">{ruleId}</span> {title}
        </p>
        <p className="mt-1 opacity-85">{detail}</p>
        <p className="mt-2 font-semibold">→ {effect}</p>
      </div>
      <p className="flex flex-wrap items-center gap-2 text-sm">{outcome}</p>
      <Link href={href} className="text-sm font-medium text-accent-ink underline underline-offset-2">
        Change the thresholds and watch the result move
      </Link>
    </article>
  );
}

function Feature({ icon: Icon, title, children }: { icon: typeof Laptop; title: string; children: ReactNode }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-6">
      <Icon className="size-6 text-accent-ink" aria-hidden />
      <h3 className="mt-3 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-muted">{children}</p>
    </article>
  );
}

function PrivacyPoint({ icon: Icon, children }: { icon: typeof Lock; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <Icon className="mt-0.5 size-4.5 shrink-0 text-fg" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

function ResultsCard({ module, badge, children }: { module: ModuleId; badge: ReactNode; children: ReactNode }) {
  const Icon = MODULE_ICONS[module];
  return (
    <article className="grid content-start gap-4 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-2 text-xl font-bold">
          <Icon className="size-5 text-accent-ink" aria-hidden /> {MODULES[module].name}
        </h3>
        {badge}
      </div>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </article>
  );
}

function Metric({ label, value, note, small }: { label: string; value: string; note: string; small?: boolean }) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={small ? "mt-2 font-display text-2xl font-bold text-muted" : "tabular mt-1 font-display text-4xl font-bold"}>{value}</p>
      <p className="mt-1 text-xs text-subtle">{note}</p>
    </div>
  );
}
