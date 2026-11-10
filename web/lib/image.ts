/**
 * Browser-only image helpers for uploads.
 */

export async function readImageSize(url: string): Promise<{ width: number; height: number }> {
  const img = await loadImage(url);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the image."));
    img.src = url;
  });
}

/**
 * Re-encode an image through a canvas. A canvas never copies EXIF, so this
 * drops GPS and camera metadata ("strip GPS" privacy option).
 */
export async function reencodeWithoutMetadata(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d")!.drawImage(img, 0, 0);
    const type = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.92));
    return blob ? new File([blob], file.name, { type }) : file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Small JPEG data URL (max 640 px) kept in localStorage so history can show the photo. */
export async function makeThumbnail(file: File, maxSide = 640): Promise<string | undefined> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return undefined;
  } finally {
    URL.revokeObjectURL(url);
  }
}
