/**
 * What each of our restroom models picks on Match for every IOAI catalogue sign
 * (data/restroom-ioai-match.json, written by ml/restroom/export_match.py). The
 * query is a whole door sign; its gallery is its true partner plus up to 58
 * signs of its IOAI set. Real model outputs computed offline, not mock data.
 */
import data from "@/data/restroom-ioai-match.json";

export type IoaiMatchMethod = { id: string; label: string; trained: boolean; detail: string };

export const IOAI_MATCH_METHODS = data.methods as IoaiMatchMethod[];
export const IOAI_MATCH_ACCURACY = data.accuracy as Record<string, Record<string, number>>;
export const IOAI_GALLERY_MAX = data.galleryMax;
const PICKS = data.picks as Record<string, Record<string, string | null>>;

/** The sign each method picks for this query, or null when the query is not an IOAI catalogue sign. */
export function ioaiPicks(queryId: string | null | undefined): Record<string, string | null> | null {
  return (queryId && PICKS[queryId]) || null;
}

/** The method the app serves (the two-step pipeline). */
export const SERVED_METHOD = "R7";
