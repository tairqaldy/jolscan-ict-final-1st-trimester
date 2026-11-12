/**
 * The demo path (task W-30): the steps of the 90-second demo on slide 3
 * (docs/PRESENTATION.md), in order, as links. Each link only preselects the
 * input; the presenter still presses Analyze or Compare, so the provider line
 * stays on screen before every run.
 *
 * The sample ids must exist in the sample manifests. lib/demo-path.test.ts
 * checks every link, so a renamed sample breaks the test, not the demo.
 */
import { RESTROOM_PRESETS } from "@/lib/mock/restroom-samples";

export type DemoStep = {
  title: string;
  /** One line to say aloud at this step. */
  note: string;
  href: string;
};

/** Compare link for one of the example pairs in the restroom manifest, by preset id. */
function compareHref(presetId: string): string {
  const preset = RESTROOM_PRESETS.find((p) => p.id === presetId);
  // Unknown preset: open Compare with nothing selected. The test catches this.
  if (!preset) return "/app/restrooms/compare";
  return `/app/restrooms/compare?a=${preset.a}&b=${preset.b}`;
}

export const DEMO_PATH: DemoStep[] = [
  {
    title: "Roads: worked example A",
    note: "Three potholes. Point at the boxes, the severity and a rule hit.",
    href: "/app/roads/analyze?sample=s01",
  },
  {
    title: "Roads: needs review",
    note: "Faint damage: the model is unsure, so the photo goes to review.",
    href: "/app/roads/analyze?sample=s05",
  },
  // The restroom steps use real IOAI signs, so they run on every provider (C-13).
  {
    title: "Restrooms: real pair",
    note: "Two doors of one IOAI restroom: the verdict is Pair.",
    href: compareHref("ioai-matching"),
  },
  {
    title: "Restrooms: two restrooms",
    note: "Signs from two different restrooms. Point at the rule that fails.",
    href: compareHref("ioai-mismatched"),
  },
  {
    title: "Restrooms: compare, not judge alone",
    note: "Alone, both signs read as male; compared with each other, the verdict is still Pair.",
    href: compareHref("ioai-faint"),
  },
  {
    title: "Restrooms: match a sign",
    note: "Find the partner of a real sign: it should rank first.",
    href: "/app/restrooms/match?q=ioai-v9",
  },
  {
    title: "Model page",
    note: "Both experiment tables. We come back to these later.",
    href: "/app/model#roads",
  },
];
