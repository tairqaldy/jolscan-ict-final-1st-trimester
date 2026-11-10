/**
 * The restroom pipeline's answers on the IOAI 2025 validation and test sets
 * (data/restroom-ioai-pairs.json), written by ml/restroom/export_pairs.py with
 * the code of ml/restroom/pipeline.py. Real results computed offline, not mock
 * data: the site has no Python server, so the "IOAI pairs" page shows them.
 * Gallery numbers are the 1-based IOAI file numbers.
 */
import raw from "@/data/restroom-ioai-pairs.json";

export type IoaiSplitId = "val" | "test";

export type IoaiCandidate = { g: number; score: number };

export type IoaiRow = {
  n: number;
  /** Step 1: the original the crop was cut from (SIFT + pixel check). */
  own: number;
  /** Step 2: the pair the pipeline found. */
  pair: number;
  /** The IOAI answer. */
  answer: number;
  /** The IOAI zero-shot CLIP baseline's pick. */
  baseline: number;
  /** Pixel correlation after alignment between the crop and its original, -1..1. */
  ncc: number;
  inliers: number;
  /** The best step-2 candidates for the pair, highest score first. */
  candidates: IoaiCandidate[];
};

export type IoaiSplit = {
  label: string;
  queries: number;
  gallery: number;
  pipelineCorrect: number;
  baselineCorrect: number;
  rows: IoaiRow[];
};

export type IoaiPairsFile = {
  method: string;
  histogramWeight: number;
  imageBase: string;
  credit: string;
  splits: Record<IoaiSplitId, IoaiSplit>;
};

export const IOAI_PAIRS = raw as unknown as IoaiPairsFile;

export const IOAI_SPLITS: IoaiSplitId[] = ["val", "test"];

export const ioaiQueryUrl = (split: IoaiSplitId, n: number) => `${IOAI_PAIRS.imageBase}/${split}/q${n}.webp`;
export const ioaiGalleryUrl = (split: IoaiSplitId, g: number) => `${IOAI_PAIRS.imageBase}/${split}/g${g}.webp`;
