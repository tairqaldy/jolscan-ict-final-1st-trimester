import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_BYTES, validateImageFile } from "./upload";

describe("image upload validation", () => {
  it("rejects unsupported types and empty files", () => {
    expect(validateImageFile({ type: "image/gif", size: 1 })).toBe("Only JPEG, PNG or WebP images are accepted.");
    expect(validateImageFile({ type: "image/jpeg", size: 0 })).toBe("The file is empty.");
  });
  it("accepts exactly 10 MB and clearly rejects one byte more", () => {
    expect(validateImageFile({ type: "image/jpeg", size: MAX_UPLOAD_BYTES })).toBeNull();
    expect(validateImageFile({ type: "image/jpeg", size: MAX_UPLOAD_BYTES + 1 })).toContain("larger than 10 MB");
  });
});
