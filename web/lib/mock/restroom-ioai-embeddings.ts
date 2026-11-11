/**
 * Real zero-shot CLIP ViT-B/32 similarity between IOAI signs, for the mock
 * provider only (server side: the embeddings file is 167 kB and never reaches
 * the browser). Written by ml/restroom/export_catalogue.py as int8 (x 127).
 */
import data from "@/data/restroom-ioai-embeddings.json";

const DIM = data.dim;
const bytes = Uint8Array.from(atob(data.b64), (c) => c.charCodeAt(0));
const vectors = new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const index = new Map<string, number>(data.ids.map((id, i) => [id, i]));
for (const [alias, id] of Object.entries(data.aliases as Record<string, string>)) {
  const i = index.get(id);
  if (i !== undefined) index.set(alias, i);
}
const norms = data.ids.map((_, i) => {
  let s = 0;
  for (let k = 0; k < DIM; k++) s += vectors[i * DIM + k] ** 2;
  return Math.sqrt(s);
});

/** True when the sign has a stored embedding (every IOAI sign, bundled ioai-v* included). */
export const hasIoaiEmbedding = (id: string) => index.has(id);

/** (cos + 1) / 2 of two IOAI signs, as the API computes it, or null if either has no embedding. */
export function ioaiSimilarity(aId: string, bId: string): number | null {
  const a = index.get(aId);
  const b = index.get(bId);
  if (a === undefined || b === undefined) return null;
  if (a === b) return 1;
  let dot = 0;
  for (let k = 0; k < DIM; k++) dot += vectors[a * DIM + k] * vectors[b * DIM + k];
  const cos = dot / (norms[a] * norms[b]);
  return Math.round(Math.min(1, Math.max(0, (cos + 1) / 2)) * 100) / 100;
}
