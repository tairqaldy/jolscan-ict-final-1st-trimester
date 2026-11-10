import type { Metadata } from "next";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { TeamGrid } from "@/components/landing/team-grid";
import { Callout } from "@/components/ui/callout";
import { EXPERIMENTS } from "@/lib/mock/experiments";
import { COURSE } from "@/lib/team";

export const metadata: Metadata = { title: "About" };

/** Copied from docs/RULES.md "Known limits". Keep the two in sync. */
const KNOWN_LIMITS = [
  "Box area in the image is not physical size. A pothole far from the camera looks small. Fixing this needs camera calibration or a depth estimate.",
  "inLane assumes a forward-facing, roughly level photo.",
  "The rules never see road markings, so a pothole on the shoulder of a narrow road can be scored as in lane.",
  "Thresholds were set by the team on a small validation set.",
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-3 border-t border-border pt-8">
      <h2 id={id} className="text-2xl font-bold sm:text-3xl">
        {title}
      </h2>
      <div className="grid gap-3 text-muted [&_strong]:text-fg">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page max-w-3xl pt-12">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent-ink uppercase">
          {COURSE.code} · {COURSE.school}
        </p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">About JolScan</h1>
        <p className="mt-4 text-lg text-muted">
          A course prototype that turns a road photo into a repair priority. It is a study project, not a city service, and
          the numbers marked “Demo data” are placeholders.
        </p>

        <div className="mt-10 grid gap-10">
          <Section id="method" title="Method">
            <p>
              <strong>Detection.</strong> A one-stage object detector (Ultralytics YOLO, small variant) fine-tuned from
              COCO-pretrained weights on a public pothole dataset. Detection, not classification, because the rules need
              to know where each pothole is and how large it looks.
            </p>
            <p>
              <strong>Experiments.</strong> One change per run against a fixed baseline, same split and seed, tracked in
              MLflow. We compare precision, recall, mAP50, mAP50-95, latency and model size.
            </p>
            <p>
              <strong>Prioritisation.</strong> Deterministic rules applied after the model (R1–R6: confidence, size, lane,
              cluster, road class, school zone). Every result lists the rules that fired, so the decision can be explained.
            </p>
            <p>
              <strong>Serving.</strong> A FastAPI <code className="font-mono text-sm">/predict</code> service runs locally or
              in the cloud; this web app calls it through one route and scores every result the same way.
            </p>
          </Section>

          <Section id="limits" title="Known limits">
            <ul className="grid list-disc gap-2 pl-5">
              {KNOWN_LIMITS.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </Section>

          <Section id="privacy" title="Privacy and ethics">
            <ul className="grid list-disc gap-2 pl-5">
              <li>Road photos can contain faces, number plates and location data. The local provider keeps photos on the device.</li>
              <li>The app can strip EXIF metadata (including GPS) in the browser before upload, and can block the cloud provider.</li>
              <li>There are no accounts and no server database: history lives in the browser and can be cleared in Settings.</li>
              <li>Low-confidence detections are flagged for a person to review, never silently dropped.</li>
              <li>The priority is decision support for a maintenance team, not an automatic decision. The rule thresholds are team assumptions, not an official standard.</li>
              <li>API keys are read on the server only and never committed to git.</li>
            </ul>
          </Section>

          <Section id="dataset" title="Dataset and licences">
            <Callout tone="warning" title="To be completed before the defense">
              Dataset name, version, source link and licence are placeholders until the Data lane confirms them.
            </Callout>
            <dl className="grid gap-2 text-sm sm:grid-cols-[8rem_1fr]">
              <dt>Dataset</dt>
              <dd className="text-fg">{EXPERIMENTS.dataset.name}</dd>
              <dt>Source</dt>
              <dd className="text-fg">{EXPERIMENTS.dataset.source}</dd>
              <dt>Licence</dt>
              <dd className="text-fg">{EXPERIMENTS.dataset.licence}</dd>
              <dt>Sample images</dt>
              <dd className="text-fg">Original SVG illustrations drawn for this project (no third-party photos).</dd>
              <dt>Map</dt>
              <dd className="text-fg">© OpenStreetMap contributors (ODbL).</dd>
            </dl>
          </Section>

          <Section id="team" title="Team">
            <TeamGrid />
          </Section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
