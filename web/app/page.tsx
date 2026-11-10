import { ArrowRight, ChartColumn, BookOpenText, Camera, Cloud, Laptop, ListOrdered, ScanSearch } from "lucide-react";
import Link from "next/link";
import { DemoBadge } from "@/components/app/demo-badge";
import { HeroDemo } from "@/components/landing/hero-demo";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { TeamGrid } from "@/components/landing/team-grid";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { BASELINE, CHAMPION, EXPERIMENTS } from "@/lib/mock/experiments";

const STEPS = [
  { icon: Camera, title: "Photo", text: "Take a forward-facing photo of the road, or upload one. Add the road class and whether it is a school zone." },
  { icon: ScanSearch, title: "Detect", text: "A YOLO object detector, fine-tuned on pothole images, draws a box around every pothole it finds." },
  { icon: ListOrdered, title: "Prioritise", text: "Six readable rules weigh size, lane position, clusters, road class and school zones into a repair priority." },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section className="container-page grid items-center gap-12 pt-12 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:pt-20">
          <Stagger className="grid gap-6">
            <StaggerItem>
              <p className="text-xs font-semibold tracking-[0.18em] text-accent-ink uppercase">Jol (жол) means road</p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="text-4xl leading-[1.02] font-bold sm:text-5xl lg:text-[4.5rem]">
                Road photo in.
                <br />
                Repair priority out.
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="max-w-lg text-lg text-muted">
                JolScan finds potholes in a road photo and turns them into a repair priority with rules anyone can read,
                so a maintenance team knows which street to fix first and why.
              </p>
            </StaggerItem>
            <StaggerItem className="flex flex-wrap gap-3">
              <ButtonLink href="/app/analyze" size="lg">
                <ScanSearch aria-hidden /> Analyze a photo
              </ButtonLink>
              <ButtonLink href="/app" size="lg" variant="secondary">
                Open the dashboard <ArrowRight aria-hidden />
              </ButtonLink>
            </StaggerItem>
          </Stagger>
          <div className="pb-10">
            <HeroDemo />
          </div>
        </section>

        <div className="lane-stripe" aria-hidden />

        {/* How it works */}
        <section id="how" className="container-page scroll-mt-20 pt-[var(--section-gap)]" aria-labelledby="how-h">
          <h2 id="how-h" className="text-3xl font-bold sm:text-4xl">How it works</h2>
          <Stagger inView as="ol" className="mt-8 grid gap-4 md:grid-cols-3">
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

        {/* Features */}
        <section id="features" className="container-page scroll-mt-20 pt-[var(--section-gap)]" aria-labelledby="features-h">
          <h2 id="features-h" className="text-3xl font-bold sm:text-4xl">Built to be explained</h2>
          <Stagger inView className="mt-8 grid gap-4 lg:grid-cols-3">
            <StaggerItem as="article" className="rounded-lg border border-border bg-surface p-6 lg:row-span-2">
              <BookOpenText className="size-6 text-accent-ink" aria-hidden />
              <h3 className="mt-3 text-2xl font-bold">Rules you can read</h3>
              <p className="mt-2 text-muted">
                The model only says where the potholes are. Urgency comes from six rules the team wrote down, and every
                result lists which rules fired and how many points each added.
              </p>
              <pre className="mt-5 overflow-x-auto rounded-md bg-inverse p-4 font-mono text-xs leading-relaxed text-inverse-fg">
{`score = (Σ size × lane
         + cluster)
        × road class
        + school zone`}
              </pre>
              <ButtonLink href="/app/rules" variant="ghost" className="mt-4 -ml-3">
                Try the rules <ArrowRight aria-hidden />
              </ButtonLink>
            </StaggerItem>
            <StaggerItem as="article" className="rounded-lg border border-border bg-surface p-6 lg:col-span-2">
              <div className="flex gap-2 text-accent-ink">
                <Laptop className="size-6" aria-hidden />
                <Cloud className="size-6" aria-hidden />
              </div>
              <h3 className="mt-3 text-2xl font-bold">Local or cloud model</h3>
              <p className="mt-2 max-w-2xl text-muted">
                Run the trained weights on the laptop, so photos never leave the device, or call a hosted endpoint for more
                capacity. A mock mode keeps the demo working offline. One switch in Settings, the same scoring everywhere.
              </p>
            </StaggerItem>
            <StaggerItem as="article" className="rounded-lg border border-border bg-surface p-6 lg:col-span-2">
              <ChartColumn className="size-6 text-accent-ink" aria-hidden />
              <h3 className="mt-3 text-2xl font-bold">Analytics and a review queue</h3>
              <p className="mt-2 max-w-2xl text-muted">
                Severity over time, confidence drift and latency per provider. Low-confidence photos are flagged for a
                human instead of being hidden, and feed the next dataset version.
              </p>
            </StaggerItem>
          </Stagger>
        </section>

        {/* Results teaser */}
        <section id="results" className="container-page scroll-mt-20 pt-[var(--section-gap)]" aria-labelledby="results-h">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="results-h" className="text-3xl font-bold sm:text-4xl">Model results</h2>
              <p className="mt-2 max-w-xl text-muted">
                {EXPERIMENTS.runs.length} training runs, one change at a time against a fixed baseline.
              </p>
            </div>
            <DemoBadge label="Placeholder numbers until training finishes" />
          </div>
          <Stagger inView className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "mAP50-95", value: CHAMPION.map5095.toFixed(2), note: `baseline ${BASELINE.map5095.toFixed(2)}` },
              { label: "Recall", value: CHAMPION.recall.toFixed(2), note: `baseline ${BASELINE.recall.toFixed(2)}` },
              { label: "Latency", value: `${CHAMPION.latencyMs} ms`, note: "per photo, laptop CPU" },
              { label: "Size", value: `${CHAMPION.sizeMB} MB`, note: "weights file" },
            ].map((m) => (
              <StaggerItem key={m.label} className="rounded-lg border border-border bg-surface p-5">
                <p className="text-sm text-muted">{m.label}</p>
                <p className="tabular mt-1 font-display text-4xl font-bold">{m.value}</p>
                <p className="mt-1 text-xs text-subtle">{m.note}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-4 text-sm text-muted">
            Selected run: <span className="font-mono">{CHAMPION.id}</span> ({CHAMPION.changed.toLowerCase()}).{" "}
            <Link href="/app/model" className="font-medium text-accent-ink underline underline-offset-2">
              See all runs
            </Link>
          </p>
        </section>

        {/* Team */}
        <section id="team" className="container-page scroll-mt-20 pt-[var(--section-gap)]" aria-labelledby="team-h">
          <h2 id="team-h" className="text-3xl font-bold sm:text-4xl">Team</h2>
          <p className="mt-2 text-muted">Six students, three lanes: data and model, serving, design and frontend.</p>
          <div className="mt-8">
            <TeamGrid />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
