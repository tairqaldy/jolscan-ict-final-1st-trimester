/** Upload rules, shared by the browser (early feedback) and the API route (the real check). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Only JPEG, PNG or WebP images are accepted.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `The image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 10 MB.`;
  }
  if (file.size === 0) return "The file is empty.";
  return null;
}

/** Error body every API route returns on failure. */
export type ApiError = {
  error: { code: string; message: string; hint?: string };
};
