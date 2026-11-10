/**
 * Typed access to the sample photo manifest (public/samples/samples.json).
 * The drawings and their detections are placeholders; swap in real photos by
 * editing the manifest only.
 */
import manifest from "@/public/samples/samples.json";
import type { Detection, PhotoMeta } from "@/lib/types";

export type Sample = {
  id: string;
  file: string;
  title: string;
  description: string;
  imageWidth: number;
  imageHeight: number;
  meta: Required<PhotoMeta>;
  location: { lat: number; lng: number; label: string };
  mockLatencyMs: number;
  detections: Detection[];
};

export const SAMPLES = manifest.samples as Sample[];

export function getSample(id: string | null | undefined): Sample | undefined {
  return SAMPLES.find((s) => s.id === id);
}
