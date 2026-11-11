/*
 * TEMPORARY (G-61): the three rule-hit variants on one page for screenshots.
 * Deleted before the pull request is merged.
 */
import type { Metadata } from "next";
import { LaneFigure, RuleHitCardA, RuleHitCardB, RuleHitCardC, SignPairFigure } from "@/components/landing/rule-hit-card";
import { VerdictBadge } from "@/components/restrooms/signage-bits";
import { SeverityBadge } from "@/components/ui/badge";
import { formatSla } from "@/lib/format";
import { roadHitMarks, signHitMarks } from "@/lib/landing-rule-hits";
import { RESTROOM_PRESETS, getRestroomSample, mockSimilarity } from "@/lib/mock/restroom-samples";
import { getSample } from "@/lib/mock/samples";
import { scoreDetections } from "@/lib/rules";
import { evaluateSignage } from "@/lib/signage";

export const metadata: Metadata = { title: "Rule hit variants (temporary)", robots: { index: false } };

const roadSample = getSample("s01")!;
const roadResult = scoreDetections(roadSample.detections, roadSample.meta);
const roadHit = roadResult.ruleHits.find((h) => h.ruleId === "R3")!;

const faint = RESTROOM_PRESETS.find((p) => p.id === "faint")!;
const faintA = getRestroomSample(faint.a)!;
const faintB = getRestroomSample(faint.b)!;
const similarity = mockSimilarity(faintA.id, faintB.id);
const signResult = evaluateSignage({ a: faintA.mock, b: faintB.mock, similarity });
const signHit = signResult.ruleHits.find((h) => !h.passed)!;

const road = {
  module: "roads" as const,
  context: "Highway sample, three potholes",
  ruleId: roadHit.ruleId,
  title: roadHit.title,
  detail: roadHit.detail,
  effect: `+${roadHit.points} points`,
  outcome: (
    <>
      <SeverityBadge severity={roadResult.severity} /> score {roadResult.score} · {formatSla(roadResult.slaHours)}
    </>
  ),
  href: "/app/roads/rules",
};
const sign = {
  module: "restrooms" as const,
  context: `${faint.title} sample pair`,
  ruleId: signHit.ruleId,
  title: signHit.title,
  detail: signHit.detail,
  effect: "Failed",
  outcome: (
    <>
      <VerdictBadge verdict={signResult.verdict} /> {signResult.recommendedAction}
    </>
  ),
  href: "/app/restrooms/rules",
};
const roadMarks = roadHitMarks(roadHit);
const signMarks = signHitMarks(signHit, signResult.doors, similarity);

const laneFigure = (
  <LaneFigure
    src={roadSample.file}
    alt={`${roadSample.title} (illustration) with the driving lane and the detection boxes`}
    width={roadSample.imageWidth}
    height={roadSample.imageHeight}
    detections={roadSample.detections}
    derived={roadResult.detections}
    laneLabel={roadHit.title}
  />
);
const signFigure = (
  <SignPairFigure
    doors={[
      { label: "Door A", src: faintA.file, alt: faintA.title, pMale: signResult.doors.pMaleA.toFixed(2) },
      { label: "Door B", src: faintB.file, alt: faintB.title, pMale: signResult.doors.pMaleB.toFixed(2) },
    ]}
  />
);

export default function RuleHitLab() {
  return (
    <main className="landing-page grid gap-16 py-12">
      <Variant id="a" name="A · current code block">
        <RuleHitCardA {...road} />
        <RuleHitCardA {...sign} />
      </Variant>
      <Variant id="b" name="B · sentence, setting highlighted">
        <RuleHitCardB {...road} marks={roadMarks} />
        <RuleHitCardB {...sign} marks={signMarks} />
      </Variant>
      <Variant id="c" name="C · sample photo, box and sentence">
        <RuleHitCardC {...road} marks={roadMarks} figure={laneFigure} />
        <RuleHitCardC {...sign} marks={signMarks} figure={signFigure} />
      </Variant>
    </main>
  );
}

function Variant({ id, name, children }: { id: string; name: string; children: React.ReactNode }) {
  return (
    <section data-variant={id} className="container-page public-container py-6">
      <p className="font-mono text-sm text-muted">Variant {name}</p>
      <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Rules you can read</h2>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}
