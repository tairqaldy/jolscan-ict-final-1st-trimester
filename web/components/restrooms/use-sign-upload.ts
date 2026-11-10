"use client";

import { useEffect, useRef } from "react";
import { makeThumbnail, reencodeWithoutMetadata } from "@/lib/image";
import type { Settings } from "@/lib/store/settings";
import type { SignInputInfo } from "@/lib/types";
import type { ApiError } from "@/lib/upload";
import type { SlotValue } from "./sign-slot";

/**
 * Frees blob: preview URLs that no slot uses any more (and all of them on
 * unmount). Tracks the set, so swapping two slots never revokes a live URL.
 */
export function useRevokePreviews(values: (SlotValue | null)[]) {
  const key = values.map((v) => (v?.kind === "file" ? v.previewUrl : "")).join("\n");
  const live = useRef<Set<string>>(new Set());
  useEffect(() => {
    const next = new Set(key.split("\n").filter(Boolean));
    for (const url of live.current) if (!next.has(url)) URL.revokeObjectURL(url);
    live.current = next;
  }, [key]);
  useEffect(
    () => () => {
      for (const url of live.current) URL.revokeObjectURL(url);
    },
    [],
  );
}

/**
 * Adds one sign to the request form (upload in `fileField`, or sample id in
 * `sampleField`) and returns what to store about it. Uploads are re-encoded to
 * drop EXIF/GPS when the privacy setting asks for it, and a small thumbnail is
 * kept for this browser's history.
 */
export async function appendSign(
  form: FormData,
  value: SlotValue,
  fileField: string,
  sampleField: string,
  settings: Settings,
): Promise<SignInputInfo> {
  if (value.kind === "sample") {
    form.set(sampleField, value.sample.id);
    return { sampleId: value.sample.id, imageUrl: value.sample.file };
  }
  const file = settings.stripGps ? await reencodeWithoutMetadata(value.file) : value.file;
  form.set(fileField, file, file.name);
  return { fileName: value.file.name, imageUrl: await makeThumbnail(value.file, 320) };
}

/** POST /api/restroom and return the body or a clean error. */
export async function postRestroom<T>(form: FormData): Promise<{ ok: true; body: T } | { ok: false; error: ApiError["error"] }> {
  try {
    const res = await fetch("/api/restroom", { method: "POST", body: form });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body || body.error) {
      return { ok: false, error: body?.error ?? { code: `http_${res.status}`, message: `The server answered with HTTP ${res.status}.` } };
    }
    return { ok: true, body: body as T };
  } catch {
    return { ok: false, error: { code: "network", message: "Could not reach the app server.", hint: "Check that the app is still running." } };
  }
}

export const cloudBlocked: ApiError["error"] = {
  code: "privacy",
  message: "Cloud is blocked because “Keep photos on this device only” is on.",
  hint: "Use the mock or local provider, or turn the option off in Settings.",
};
