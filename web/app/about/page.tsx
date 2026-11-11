import type { Metadata } from "next";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { TeamGrid } from "@/components/landing/team-grid";
import { BRAND, MODULES } from "@/lib/brand";
import { DATA_CREDITS } from "@/lib/credits";
import { COURSE } from "@/lib/team";

export const metadata: Metadata = { title: "About" };

/** Copied from docs/RULES.md, "Known limits" of Part 1 and Part 2. Keep them in sync. */
const ROAD_LIMITS = [
  "Box area in the image is not physical size. A pothole far from the camera looks small, and a close-up fills the frame. Fixing this needs camera calibration or a depth estimate.",
  "R3 is meaningful only for forward-facing, roughly level photos such as dashcam frames. In a handheld close-up almost every box counts as in lane.",
  "The rules never see road markings, so a pothole on the shoulder of a narrow road can be scored as in lane.",
  "Thresholds were set by the team on a small validation set.",
];

const SIGN_LIMITS = [
  "The model judges a cropped icon. It never sees the door, the text under the icon, the colour coding or the location.",
  "“Distinguishable to the model” is a stand-in for “distinguishable to a person”. The thresholds were chosen on the IOAI training restrooms, not tested with people.",
  "Per-sign gender is right only about 75% of the time, so the rules compare the two doors with each other (right 90% of the time on the IOAI training restrooms) instead of judging each sign alone.",
  "The training set is 82 restrooms, mostly from stock photos. Unusual or culture-specific icons may be misread.",
  "Accessible and all-gender restrooms are outside the IOAI data, so the model has no class for them.",
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
        <p className="eyebrow text-accent-ink">
          {COURSE.code} · {COURSE.school}
        </p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">About {BRAND.name}</h1>
        <p className="mt-4 text-lg text-muted">
          {BRAND.tagline} The name, {BRAND.nativeName}, is {BRAND.meaning}. It is a study
          project, not a city or campus service. Anything with a demo or mock badge is invented for the demo, not a result
          of our models.
        </p>

        <div className="mt-10 grid gap-10">
          <Section id="method" title="Method">
            <h3 className="text-lg font-semibold text-fg">
              {MODULES.roads.name}: {MODULES.roads.task.toLowerCase()}
            </h3>
            <p>
              <strong>Detection.</strong> A one-stage object detector (Ultralytics YOLO, small variant) fine-tuned from
              COCO-pretrained weights on a public pothole dataset. Detection, not classification, because the rules need to
              know where each pothole is and how large it looks.
            </p>
            <p>
              <strong>Prioritisation.</strong> Six deterministic rules applied after the model (R1–R6: confidence, size, lane,
              cluster, road class, school zone) give a score, a severity and a target time. Every result lists the rules that
              fired and the points each added.
            </p>
            <h3 className="mt-2 text-lg font-semibold text-fg">
              {MODULES.restrooms.name}: {MODULES.restrooms.task.toLowerCase()}
            </h3>
            <p>
              <strong>Embeddings.</strong> CLIP’s image encoder, a Vision Transformer, turns every door sign into an embedding.
              From it we predict the sign’s gender (zero-shot text prompts, or a logistic-regression probe or fine-tuned head)
              and the similarity of two signs (cosine similarity scaled to 0..1).
            </p>
            <p>
              <strong>Matching.</strong> For one query sign, the partner is the most similar gallery sign of the opposite
              gender: the IOAI 2025 “Restroom Icon Matching” task, scored as top-1 accuracy.
            </p>
            <p>
              <strong>Verdict.</strong> The two doors are compared with each other: the sign with the higher P(male) is read as
              the men&apos;s room. Two rules decide the verdict: S2, the doors read as different genders, and S3, the signs
              belong to one set. Both pass: a pair; either fails: not a pair. The thresholds come from the IOAI training restrooms.
            </p>
            <h3 className="mt-2 text-lg font-semibold text-fg">Both modules</h3>
            <p>
              <strong>Experiments.</strong> One change per run against a fixed baseline, same split and seed, chosen on
              validation, tracked in MLflow (assignment Option A).
            </p>
            <p>
              <strong>Serving.</strong> One FastAPI service answers <code className="font-mono text-sm">/predict</code>,{" "}
              <code className="font-mono text-sm">/restroom/compare</code> and <code className="font-mono text-sm">/restroom/match</code>,
              locally or in the cloud. This web app calls it through its own routes and applies the rules the same way for
              every provider.
            </p>
          </Section>

          <Section id="limits" title="Known limits">
            <h3 className="text-lg font-semibold text-fg">{MODULES.roads.name}</h3>
            <ul className="grid list-disc gap-2 pl-5">
              {ROAD_LIMITS.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <h3 className="mt-2 text-lg font-semibold text-fg">{MODULES.restrooms.name}</h3>
            <ul className="grid list-disc gap-2 pl-5">
              {SIGN_LIMITS.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </Section>

          <Section id="privacy" title="Privacy and ethics">
            <ul className="grid list-disc gap-2 pl-5">
              <li>
                <strong>Restroom images contain no people</strong>: the IOAI data are icons on doors and walls. Never upload a
                photo taken inside a restroom, or any photo with a person in it.
              </li>
              <li>
                <strong>Road photos can show faces, number plates and location data.</strong> The local provider keeps photos on
                the device; the cloud provider is opt-in and can be blocked in Settings.
              </li>
              <li>The app strips EXIF metadata (including GPS) in the browser before upload.</li>
              <li>There are no accounts and no server database: history lives in the browser and can be cleared in Settings.</li>
              <li>Low-confidence results go to a review queue for a person, never silently dropped.</li>
              <li>
                Both outputs are decision support for a maintenance or facilities team, not automatic decisions. The rule
                thresholds are team assumptions, not an official standard or a building code.
              </li>
              <li>API keys are read on the server only and never committed to git.</li>
            </ul>
          </Section>

          <Section id="dataset" title="Data and licences">
            <dl className="grid gap-2 text-sm sm:grid-cols-[9rem_1fr]">
              <dt>Pothole dataset</dt>
              <dd className="text-fg">
                <a href={DATA_CREDITS.pothole.url} className="text-accent-ink underline underline-offset-2">
                  {DATA_CREDITS.pothole.name}
                </a>
                , by {DATA_CREDITS.pothole.author}, on Kaggle. {DATA_CREDITS.pothole.licence}.
              </dd>
              <dt>Restroom task</dt>
              <dd className="text-fg">
                {DATA_CREDITS.restroom.name}, by the IOAI 2025 committee, licensed {DATA_CREDITS.restroom.licence}:{" "}
                <a href={DATA_CREDITS.restroom.url} className="break-all text-accent-ink underline underline-offset-2">
                  {DATA_CREDITS.restroom.url}
                </a>
                . The reference scores (baseline 0.77, best 0.90) are theirs, not ours. The twelve real sample signs are images
                from its validation set, by the {DATA_CREDITS.restroomSamples.author}, licensed{" "}
                {DATA_CREDITS.restroomSamples.licence}. {DATA_CREDITS.restroomSamples.changes}.
              </dd>
              <dt>Sample images</dt>
              <dd className="text-fg">
                Road scenes and the drawn restroom icons are original SVG drawings made for this project. The real restroom
                signs are the IOAI images credited above.
              </dd>
              <dt>Map</dt>
              <dd className="text-fg">
                {DATA_CREDITS.map.name} ({DATA_CREDITS.map.licence}).
              </dd>
            </dl>
          </Section>

          <Section id="ai-use" title="Use of AI tools">
            <p>
              Team members used AI assistants for planning, code, data checks and writing. The course allows this and requires
              a prompt log. Ours is <code className="font-mono text-sm">docs/AI-USAGE-LOG.md</code> in the project repository:
              each entry names the tool and version, the purpose, the key prompts, what it produced and how it was checked.
            </p>
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
