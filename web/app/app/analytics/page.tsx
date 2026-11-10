import type { Metadata } from "next";
import { RoadsAnalytics } from "@/components/app/analytics-client";
import { MODULE_ICONS } from "@/components/app/nav";
import { RestroomAnalytics } from "@/components/restrooms/restroom-analytics";
import { PageHeader } from "@/components/ui/page-header";
import { MODULES, type ModuleId } from "@/lib/brand";

export const metadata: Metadata = { title: "Analytics" };

function SectionHeading({ id, text }: { id: ModuleId; text: string }) {
  const Icon = MODULE_ICONS[id];
  return (
    <div className="flex items-start gap-3 border-t border-border pt-6">
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-inverse text-inverse-fg">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <h2 id={`${id}-h`} className="text-2xl font-bold">
          {MODULES[id].name}: {MODULES[id].task.toLowerCase()}
        </h2>
        <p className="text-muted">{text}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Analytics · both modules"
        title="Monitoring"
        description="What to watch after deployment: volume, decisions, confidence drift, latency, and how the trained models compare. Every chart has a table view."
      />
      <nav aria-label="On this page" className="-mt-4 flex flex-wrap gap-2 text-sm">
        <a href="#roads" className="rounded-full border border-border-strong px-3 py-1.5 text-muted hover:text-fg">
          {MODULES.roads.name}
        </a>
        <a href="#restrooms" className="rounded-full border border-border-strong px-3 py-1.5 text-muted hover:text-fg">
          {MODULES.restrooms.name}
        </a>
      </nav>
      <section id="roads" aria-labelledby="roads-h" className="grid scroll-mt-24 gap-4">
        <SectionHeading id="roads" text="Detections per day, severity per week, model confidence and latency per provider." />
        <RoadsAnalytics />
      </section>
      <section id="restrooms" aria-labelledby="restrooms-h" className="grid scroll-mt-24 gap-4">
        <SectionHeading id="restrooms" text="Verdicts, how alike compared pairs are, and how sure the model is about each sign." />
        <RestroomAnalytics />
      </section>
    </div>
  );
}
