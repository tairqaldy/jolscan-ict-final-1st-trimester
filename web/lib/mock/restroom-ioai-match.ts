/**
 * What each of our restroom models picks on Match for every IOAI catalogue sign
 * (data/restroom-ioai-match.json, written by ml/restroom/export_match.py). The
 * query is a whole door sign; its gallery is its true partner plus up to 58
 * signs of its IOAI set. Real model outputs computed offline, not mock data.
 */
import data from "@/data/restroom-ioai-match.json";

export type IoaiMatchMethod = { id: string; label: string; trained: boolean; detail: string };
/** CLIP ViT-B/32 with its last `blocks` of 12 transformer blocks fine-tuned (L0 is zero-shot, the same as R1). */
export type IoaiLayerMethod = IoaiMatchMethod & { blocks: number };

export const IOAI_MATCH_METHODS = data.methods as IoaiMatchMethod[];
export const IOAI_LAYER_METHODS = data.layers as IoaiLayerMethod[];
/** The IOAI set every fine-tuned model was trained on: on its signs they have seen the answer. */
export const IOAI_TRAINED_ON = data.trainedOn;
/** Per IOAI set: the signs that at least one layer model gets wrong, most wrong first. */
export const IOAI_LAYER_DISAGREE = data.layerDisagree as Record<string, string[]>;
export const IOAI_MATCH_ACCURACY = data.accuracy as Record<string, Record<string, number>>;
export const IOAI_GALLERY_MAX = data.galleryMax;
const PICKS = data.picks as Record<string, Record<string, string | null>>;

/** The sign each method picks for this query, or null when the query is not an IOAI catalogue sign. */
export function ioaiPicks(queryId: string | null | undefined): Record<string, string | null> | null {
  return (queryId && PICKS[queryId]) || null;
}

/** The method the app serves (the two-step pipeline). */
export const SERVED_METHOD = "R7";
