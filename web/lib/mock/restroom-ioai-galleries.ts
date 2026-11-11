/**
 * Server only: the fixed Match gallery of every IOAI catalogue sign (its true
 * partner plus up to 58 signs of its IOAI set), from ml/restroom/export_match.py.
 */
import data from "@/data/restroom-ioai-galleries.json";
import { RESTROOM_IOAI_CATALOGUE, type RestroomSample } from "./restroom-samples";

const byId = new Map(RESTROOM_IOAI_CATALOGUE.map((s) => [s.id, s]));
const GALLERIES = data.galleries as Record<string, number[]>;

/** The gallery for an IOAI catalogue query, or null for any other query. */
export function ioaiGallery(queryId: string | null | undefined): RestroomSample[] | null {
  const idx = queryId ? GALLERIES[queryId] : undefined;
  if (!idx) return null;
  return idx.map((i) => byId.get(data.ids[i])).filter((s): s is NonNullable<typeof s> => Boolean(s));
}
