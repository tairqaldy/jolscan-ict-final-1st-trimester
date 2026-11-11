"use client";

import { CircleCheck, CircleX, ExternalLink, FileCode } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Kpi } from "@/components/app/kpi";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";
import { IOAI_BASELINE_CODE, IOAI_NOTEBOOK_URL } from "@/lib/restroom-ioai-baseline";
import { IOAI_PAIRS, IOAI_SPLITS, ioaiGalleryUrl, ioaiQueryUrl, type IoaiSplitId } from "@/lib/restroom-ioai-pairs";
import { SignImage } from "./signage-bits";

const SOURCE_URL = "https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Restroom";
/** Training restroom of the worked example: its crop looks different from its framed original. */
const EXAMPLE = 40;
/** A female original of another training restroom, for the "wrong restroom" tile. */
const OTHER = 14;
const TRAIN_RESTROOMS = 82;

function Mark({ ok, children }: { ok: boolean; children: ReactNode }) {
  const Icon = ok ? CircleCheck : CircleX;
  return (
    <span className={cn("inline-flex items-center gap-1 font-medium", ok ? "text-success" : "text-danger")}>
      <Icon className="size-4 shrink-0" aria-hidden />
      {children}
    </span>
  );
}

function Tile({ src, alt, title, detail }: { src: string; alt: string; title: ReactNode; detail?: ReactNode }) {
  return (
    <figure className="grid content-start gap-2">
      <SignImage src={src} alt={alt} />
      <figcaption className="grid gap-0.5 text-sm">
        <span className="font-medium">{title}</span>
        {detail && <span className="text-muted">{detail}</span>}
      </figcaption>
    </figure>
  );
}

function SectionTitle({ n, children }: { n: number; children: ReactNode }) {
  return (
    <CardTitle>
      <span className="tabular text-muted">{n}.</span> {children}
    </CardTitle>
  );
}

function TaskCard() {
  // Training images: query n is crop n, gallery g is original g; 1-82 male, 83-164 female.
  const female = (r: number) => TRAIN_RESTROOMS + r;
  return (
    <Card>
      <CardHeader>
        <div>
          <SectionTitle n={1}>The task</SectionTitle>
          <CardDescription>
            Restroom Icon Matching, a task of the{" "}
            <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="font-medium text-accent-ink underline underline-offset-2">
              IOAI 2025 individual contest
            </a>{" "}
            (International Olympiad in Artificial Intelligence, Beijing).
          </CardDescription>
        </div>
      </CardHeader>
      <CardBody className="grid gap-6">
        <div className="grid max-w-3xl gap-3 text-sm">
          <p>
            Every restroom has two door signs, a male and a female one, drawn in the same style. The data gives each sign
            twice: as a tight <span className="font-medium">crop</span> of the icon and as the{" "}
            <span className="font-medium">original</span> picture around it.
          </p>
          <p>
            The task: for a cropped sign (the <span className="font-medium">query</span>), find the original of the{" "}
            <span className="font-medium">other gender</span> from the <span className="font-medium">same restroom</span> among
            all the originals (the <span className="font-medium">gallery</span>). Both conditions must hold. The rules ask for a
            model trained on the training set.
          </p>
        </div>

        <div className="grid gap-3">
          <p className="text-sm font-medium">Example: training restroom {EXAMPLE}</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Tile src={ioaiQueryUrl("train", EXAMPLE)} alt={`Query: crop of the male sign of restroom ${EXAMPLE}`} title="Query" detail="crop, male" />
            <Tile
              src={ioaiGalleryUrl("train", female(EXAMPLE))}
              alt={`The answer: original of the female sign of restroom ${EXAMPLE}`}
              title={<Mark ok>The answer</Mark>}
              detail="other gender, same restroom"
            />
            <Tile
              src={ioaiGalleryUrl("train", EXAMPLE)}
              alt={`Wrong: original of the male sign of restroom ${EXAMPLE}`}
              title={<Mark ok={false}>Wrong</Mark>}
              detail="same restroom, same gender: the query's own original"
            />
            <Tile
              src={ioaiGalleryUrl("train", female(OTHER))}
              alt={`Wrong: original of the female sign of restroom ${OTHER}`}
              title={<Mark ok={false}>Wrong</Mark>}
              detail="other gender, another restroom"
            />
          </div>
        </div>

        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div className="grid content-start gap-1">
            <dt className="font-medium">What you hand in</dt>
            <dd className="text-muted">
              A notebook that trains the model and writes one gallery number per query: <code>submission_a.npy</code> for
              validation and <code>submission_b.npy</code> for test.
            </dd>
          </div>
          <div className="grid content-start gap-1">
            <dt className="font-medium">Score</dt>
            <dd className="text-muted">
              Correct matches divided by the number of queries, from 0 to 1. A notebook over the time limit scores 0.
            </dd>
          </div>
          <div className="grid content-start gap-1">
            <dt className="font-medium">Reference scores</dt>
            <dd className="text-muted">
              Published by the IOAI committee on the test set (Leaderboard B): <span className="tabular">0.77</span> for the
              baseline below, <span className="tabular">0.90</span> as the best.
            </dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  );
}

const SETS = [
  {
    name: "Training",
    what: `${TRAIN_RESTROOMS} restrooms, four images each: male and female, crop and original. File 40.png is restroom 40 in all four folders, so the file names are the labels.`,
    images: TRAIN_RESTROOMS * 4,
  },
  {
    name: "Validation (test_a)",
    what: "10 cropped queries and a gallery of 20 originals.",
    images: 30,
  },
  {
    name: "Test (test_b)",
    what: "30 cropped queries and a gallery of 60 originals. The score on this set is Leaderboard B.",
    images: 90,
  },
];

/** The folders as the task notebook describes them, with the file numbers. */
const TREE = `training_set/
├── crop/
│   ├── male/     1.png … 82.png
│   └── female/   1.png … 82.png
└── orig/
    ├── male/     1.png … 82.png
    └── female/   1.png … 82.png
test_a/   validation
├── query/        1.png … 10.png
└── gallery/      1.png … 20.png
test_b/   test
├── query/        1.png … 30.png
└── gallery/      1.png … 60.png`;

function DatasetCard() {
  const [split, setSplit] = useState<IoaiSplitId>("val");
  const [selected, setSelected] = useState(1);
  const s = IOAI_PAIRS.splits[split];
  const row = s.rows.find((r) => r.n === selected) ?? s.rows[0];
  const qLabel = s.queryLabels?.[row.n - 1];
  const aLabel = s.galleryLabels?.[row.answer - 1];

  return (
    <Card>
      <CardHeader>
        <div>
          <SectionTitle n={2}>The dataset</SectionTitle>
          <CardDescription>What the IOAI committee gave: a labelled training set and two sets to answer.</CardDescription>
        </div>
      </CardHeader>
      <CardBody className="grid gap-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Kpi nested label="Training images" value={TRAIN_RESTROOMS * 4} note={`${TRAIN_RESTROOMS} restrooms × 4`} />
          <Kpi nested label="Validation queries" value={10} note="gallery of 20 originals" />
          <Kpi nested label="Test queries" value={30} note="gallery of 60 originals" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto]">
          <Table caption="The three sets of the IOAI restroom data">
            <THead>
              <TR>
                <TH>Set</TH>
                <TH>What is in it</TH>
                <TH className="text-right">Images</TH>
              </TR>
            </THead>
            <tbody>
              {SETS.map((r) => (
                <TR key={r.name}>
                  <TD className="font-medium">{r.name}</TD>
                  <TD className="text-muted">{r.what}</TD>
                  <TD className="text-right">{r.images}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
          <figure className="grid content-start gap-2">
            <pre className="overflow-x-auto rounded-md bg-surface-2 p-4 font-mono text-xs leading-relaxed">
              <code>{TREE}</code>
            </pre>
            <figcaption className="text-xs text-muted">The folders, as the task notebook lists them.</figcaption>
          </figure>
        </div>

        <p className="max-w-3xl text-sm text-muted">
          In validation and test, the query and gallery files are numbered separately and shuffled, so a file number says
          nothing. Each query has exactly two originals in the gallery, the male and the female sign of its restroom, so the
          gallery is twice the size of the queries: one original is the query&apos;s own, the other is the answer. The answers
          are in the IOAI repository (<code>Solution/Scoring/answer_a.npy</code> and <code>answer_b.npy</code>).
        </p>

        <div className="grid gap-4 border-t border-border pt-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Segmented
              label="Look through a set"
              value={split}
              onChange={(v) => {
                setSplit(v);
                setSelected(1);
              }}
              options={IOAI_SPLITS.map((id) => ({
                value: id,
                label: `${IOAI_PAIRS.splits[id].label} (${IOAI_PAIRS.splits[id].queries})`,
              }))}
            />
            <p className="text-sm text-muted">
              {s.queries} query crops, {s.gallery} originals in the gallery.
              {s.hiddenNote && <span className="block">{s.hiddenNote}</span>}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
            <ul className="grid max-h-[32rem] grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] content-start gap-2 overflow-y-auto">
              {s.rows.map((r) => (
                <li key={r.n}>
                  <button
                    type="button"
                    onClick={() => setSelected(r.n)}
                    aria-pressed={r.n === row.n}
                    aria-label={`Query ${r.n}`}
                    className={cn(
                      "grid w-full gap-1 rounded-md p-1 text-xs text-muted transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-focus",
                      r.n === row.n && "bg-accent-soft text-accent-ink",
                    )}
                  >
                    <SignImage src={ioaiQueryUrl(split, r.n)} alt="" className={cn(r.n === row.n && "border-accent")} />
                    <span className="tabular">{r.n}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="grid content-start gap-3">
              <div className="grid grid-cols-2 gap-4">
                <Tile
                  src={ioaiQueryUrl(split, row.n)}
                  alt={`Query ${row.n}, a crop of a door sign`}
                  title={`Query ${row.n}`}
                  detail={qLabel ? `crop, ${qLabel}` : "crop"}
                />
                <Tile
                  src={ioaiGalleryUrl(split, row.answer)}
                  alt={`Gallery ${row.answer}, the answer for query ${row.n}`}
                  title={`Answer: gallery ${row.answer}`}
                  detail={aLabel ? `original, ${aLabel}` : "original, other gender"}
                />
              </div>
              <p className="text-xs text-muted">Pick a crop on the left to see its answer.</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

const STEPS = [
  "Load CLIP ViT-B/16 with the weights OpenAI trained on image and text pairs. It is used as it is (zero-shot): nothing is trained on the restroom data.",
  "Turn every query crop and every gallery original into an embedding with CLIP's image encoder, and scale each embedding to length 1.",
  "Compare each query with every original by cosine similarity.",
  "Take the second most similar original as the answer. This assumes that the most similar one is the crop's own original (the same sign), so the next one is its partner.",
  "Save the gallery numbers to submission_a.npy and submission_b.npy.",
];

function BaselineCard() {
  const [split, setSplit] = useState<"val" | "test">("test");
  const s = IOAI_PAIRS.splits[split];
  const misses = s.rows.filter((r) => r.ioaiBaseline !== null && r.ioaiBaseline !== r.answer);
  const valRight = IOAI_PAIRS.splits.val.ioaiBaselineCorrect ?? 0;
  const testRight = IOAI_PAIRS.splits.test.ioaiBaselineCorrect ?? 0;

  return (
    <Card>
      <CardHeader>
        <div>
          <SectionTitle n={3}>The baseline that came with the task</SectionTitle>
          <CardDescription>
            The task notebook, <code>Restroom.ipynb</code>, ships one baseline pipeline. It trains nothing, although the rules
            ask for a trained model.
          </CardDescription>
        </div>
      </CardHeader>
      <CardBody className="grid gap-6">
        <ol className="grid max-w-3xl list-decimal gap-2 pl-5 text-sm marker:text-muted">
          {STEPS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <Kpi nested className="col-span-2 sm:col-span-1" label="Published, test" value={0.77} decimals={2} note="IOAI committee, Leaderboard B" />
          <Kpi nested label="Our rerun, test" value={testRight} suffix="/30" note={`${(testRight / 30).toFixed(3)}, run R0`} />
          <Kpi nested label="Our rerun, validation" value={valRight} suffix="/10" note={`${(valRight / 10).toFixed(2)}, run R0`} />
        </div>

        <div className="grid gap-4 border-t border-border pt-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="grid gap-1">
              <p className="font-medium">Where the baseline is wrong</p>
              <p className="max-w-2xl text-sm text-muted">
                It goes wrong when the second most similar original is not the partner: the crop&apos;s own original can come
                second, or a sign from another restroom in a similar style can look more alike than the partner, whose figure
                is different on purpose.
              </p>
            </div>
            <Segmented
              label="Set"
              hideLabel
              value={split}
              onChange={setSplit}
              options={[
                { value: "val", label: "Validation" },
                { value: "test", label: "Test" },
              ]}
            />
          </div>
          {misses.length === 0 ? (
            <p className="text-sm text-muted">No misses among the queries shown.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {misses.map((r) => (
                <li key={r.n} className="grid grid-cols-3 gap-3 rounded-md border border-border p-3">
                  <Tile src={ioaiQueryUrl(split, r.n)} alt={`Query ${r.n}`} title={`Query ${r.n}`} />
                  <Tile
                    src={ioaiGalleryUrl(split, r.ioaiBaseline!)}
                    alt={`Gallery ${r.ioaiBaseline}, the baseline's pick`}
                    title={<Mark ok={false}>Picked</Mark>}
                    detail={`gallery ${r.ioaiBaseline}`}
                  />
                  <Tile
                    src={ioaiGalleryUrl(split, r.answer)}
                    alt={`Gallery ${r.answer}, the answer`}
                    title={<Mark ok>Answer</Mark>}
                    detail={`gallery ${r.answer}`}
                  />
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted">
            {s.queries - (s.ioaiBaselineCorrect ?? 0)} of {s.queries} {s.label.toLowerCase()} queries wrong. Picks of the
            notebook as our run R0 ran it (CLIP ViT-B/16).{s.hiddenNote ? ` ${s.hiddenNote}` : ""}
          </p>
        </div>

        <div className="grid gap-3 border-t border-border pt-5">
          <p className="font-medium">The code</p>
          <Tabs defaultValue={IOAI_BASELINE_CODE[0].id}>
            <TabsList aria-label="Baseline code cells" className="overflow-y-hidden">
              {IOAI_BASELINE_CODE.map((e) => (
                <TabsTrigger key={e.id} value={e.id}>
                  {e.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {IOAI_BASELINE_CODE.map((e) => (
              <TabsContent key={e.id} value={e.id} className="grid gap-3">
                <p className="max-w-3xl text-sm text-muted">{e.note}</p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5 font-mono">
                    <FileCode className="size-3.5" aria-hidden />
                    Restroom.ipynb, code cell {e.cell}
                  </span>
                  <a
                    href={IOAI_NOTEBOOK_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-accent-ink underline underline-offset-2"
                  >
                    Open on GitHub <ExternalLink className="size-3" aria-hidden />
                  </a>
                </p>
                <pre className="max-h-[28rem] overflow-auto rounded-md bg-surface-2 p-4 font-mono text-xs leading-relaxed">
                  <code>{e.code}</code>
                </pre>
              </TabsContent>
            ))}
          </Tabs>
          <p className="text-xs text-muted">
            Code copied unchanged from <code>Restroom.ipynb</code> by the IOAI 2025 committee, CC-BY-4.0.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

export function IoaiTaskClient() {
  return (
    <div className="grid gap-8">
      <TaskCard />
      <DatasetCard />
      <BaselineCard />
      <p className="max-w-3xl text-sm text-muted">
        Our work starts from here: run R0 reruns this notebook, runs R2 to R4 fine-tune CLIP&apos;s last blocks, and the
        two-step pipeline behind{" "}
        <Link href="/app/restrooms/match" className="font-medium text-accent-ink underline underline-offset-2">
          Match
        </Link>{" "}
        gets 30 of 30 test queries right. The{" "}
        <Link href="/app/restrooms" className="font-medium text-accent-ink underline underline-offset-2">
          overview
        </Link>{" "}
        shows how the number of trained layers changes the result. {IOAI_PAIRS.credit}
      </p>
    </div>
  );
}
