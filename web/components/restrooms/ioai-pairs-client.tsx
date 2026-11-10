"use client";

import { CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/cn";
import {
  IOAI_PAIRS,
  IOAI_SPLITS,
  ioaiGalleryUrl,
  ioaiQueryUrl,
  type IoaiRow,
  type IoaiSplitId,
} from "@/lib/restroom-ioai-pairs";
import { SignImage } from "./signage-bits";

function Verdict({ ok }: { ok: boolean }) {
  const Icon = ok ? CircleCheck : CircleX;
  return (
    <span className={cn("inline-flex items-center gap-1 font-medium", ok ? "text-success" : "text-danger")}>
      <Icon className="size-4" aria-hidden />
      {ok ? "right" : "wrong"}
    </span>
  );
}

function Tile({ src, alt, title, detail }: { src: string; alt: string; title: string; detail?: React.ReactNode }) {
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

function Result({ split, row }: { split: IoaiSplitId; row: IoaiRow }) {
  const w = IOAI_PAIRS.histogramWeight;
  const right = row.pair === row.answer;
  const baseRight = row.baseline === row.answer;
  const topTaken = row.candidates[0]?.g !== row.pair;
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Query {row.n}: what the pipeline did</CardTitle>
            <CardDescription>Numbers are the IOAI gallery files.</CardDescription>
          </div>
        </CardHeader>
        <CardBody className="grid gap-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Tile src={ioaiQueryUrl(split, row.n)} alt={`Query ${row.n}, a crop of a door sign`} title={`Query ${row.n}`} detail="a crop" />
            <Tile
              src={ioaiGalleryUrl(split, row.own)}
              alt={`Gallery ${row.own}, the original the crop was cut from`}
              title={`1. Original: ${row.own}`}
              detail={`pixel match ${row.ncc.toFixed(2)}, ${row.inliers} SIFT points`}
            />
            <Tile
              src={ioaiGalleryUrl(split, row.pair)}
              alt={`Gallery ${row.pair}, the pair the pipeline found`}
              title={`2. Pair found: ${row.pair}`}
              detail={<Verdict ok={right} />}
            />
            <Tile src={ioaiGalleryUrl(split, row.answer)} alt={`Gallery ${row.answer}, the IOAI answer`} title={`IOAI answer: ${row.answer}`} />
            <Tile
              src={ioaiGalleryUrl(split, row.baseline)}
              alt={`Gallery ${row.baseline}, the zero-shot CLIP baseline's pick`}
              title={`CLIP only: ${row.baseline}`}
              detail={<Verdict ok={baseRight} />}
            />
          </div>
          <p className="max-w-3xl text-sm text-muted">
            <span className="font-medium text-fg">Step 1</span> finds the original the crop was cut from: SIFT points matched
            between the crop and every original, the geometric fit, then a pixel check after alignment. Here: gallery {row.own}.{" "}
            <span className="font-medium text-fg">Step 2</span> ranks the other originals by how alike they are to it,{" "}
            {Math.round(w * 100)}% colour histogram and {Math.round((1 - w) * 100)}% CLIP similarity, and takes gallery {row.pair}
            {topTaken ? ", because the top-ranked one went to another query in the global assignment" : ""}. The IOAI answer is
            gallery {row.answer}. Zero-shot CLIP alone, the IOAI baseline, picks gallery {row.baseline}.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Step 2 ranking</CardTitle>
            <CardDescription>The best candidates for the pair of gallery {row.own}, with their step-2 score.</CardDescription>
          </div>
        </CardHeader>
        <CardBody>
          <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {row.candidates.map((c, i) => (
              <li key={c.g}>
                <Tile
                  src={ioaiGalleryUrl(split, c.g)}
                  alt={`Candidate ${i + 1}, gallery ${c.g}`}
                  title={`#${i + 1}: gallery ${c.g}`}
                  detail={
                    <span className="inline-flex flex-wrap items-center gap-1.5">
                      <span className="tabular font-mono">{c.score.toFixed(2)}</span>
                      {c.g === row.pair && <Badge tone="inverse">chosen</Badge>}
                      {c.g === row.answer && <Badge tone="outline">IOAI answer</Badge>}
                    </span>
                  }
                />
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}

export function IoaiPairsClient() {
  const [split, setSplit] = useState<IoaiSplitId>("val");
  const [selected, setSelected] = useState(1);
  const s = IOAI_PAIRS.splits[split];
  const row = s.rows.find((r) => r.n === selected) ?? s.rows[0];

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Pick a query sign</CardTitle>
            <CardDescription>
              Each query is a crop of one door sign. The task: find the sign of the other gender from the same restroom among
              the {s.gallery} originals.
            </CardDescription>
          </div>
        </CardHeader>
        <CardBody className="grid gap-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Segmented
              label="Image set"
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
              On this set the pipeline gets{" "}
              <span className="font-semibold text-fg">
                {s.pipelineCorrect}/{s.queries}
              </span>{" "}
              right; zero-shot CLIP alone gets {s.baselineCorrect}/{s.queries}.
            </p>
          </div>
          <ul className="grid grid-cols-5 gap-2 sm:grid-cols-10">
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
        </CardBody>
      </Card>

      <Result split={split} row={row} />

      <Callout title="Real pipeline results, computed offline">
        These are real results of our pipeline (<code>ml/restroom/pipeline.py</code>, method <code>{IOAI_PAIRS.method}</code>),
        computed on the IOAI data and stored with this page, because the site has no Python server. To run it live, start{" "}
        <code>python ml/restroom/demo.py</code> on a laptop. {IOAI_PAIRS.credit}
      </Callout>
    </div>
  );
}
