/**
 * G-50: one Dropzone for roads Analyze and the restroom sign slots.
 * The file check must stay `validateImageFile` (same messages as before), and
 * every state must render its own look.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DROPZONE_STATES, Dropzone, dropzoneState, takeFile } from "@/components/ui/dropzone";

const file = (name: string, type: string, size: number) => new File([new Uint8Array(size)], name, { type });

function render(props: Partial<Parameters<typeof Dropzone>[0]> = {}) {
  return renderToStaticMarkup(
    createElement(Dropzone, { title: "Drop a photo here, or click to choose", onFile: () => {}, onReject: () => {}, ...props }),
  );
}

describe("takeFile", () => {
  it("rejects a wrong type with the validateImageFile message", () => {
    const onFile = vi.fn();
    const onReject = vi.fn();
    takeFile(file("notes.txt", "text/plain", 12), onFile, onReject);
    expect(onReject).toHaveBeenCalledWith("Only JPEG, PNG or WebP images are accepted.");
    expect(onFile).not.toHaveBeenCalled();
  });

  it("rejects a file over 10 MB with its size", () => {
    const onFile = vi.fn();
    const onReject = vi.fn();
    takeFile(file("huge.png", "image/png", 11 * 1024 * 1024), onFile, onReject);
    expect(onReject).toHaveBeenCalledWith("The image is 11.0 MB. The limit is 10 MB.");
    expect(onFile).not.toHaveBeenCalled();
  });

  it("passes a good image on and returns the promise of an async handler", async () => {
    const good = file("road.webp", "image/webp", 7062);
    const onReject = vi.fn();
    expect(takeFile(good, () => {}, onReject)).toBeUndefined();
    const running = takeFile(good, async () => {}, onReject);
    expect(running).toBeInstanceOf(Promise);
    await running;
    expect(onReject).not.toHaveBeenCalled();
  });

  it("ignores an empty pick", () => {
    const onFile = vi.fn();
    const onReject = vi.fn();
    takeFile(undefined, onFile, onReject);
    expect(onFile).not.toHaveBeenCalled();
    expect(onReject).not.toHaveBeenCalled();
  });
});

describe("dropzoneState", () => {
  it("is idle with no flags and filled with a preview", () => {
    expect(dropzoneState({})).toBe("idle");
    expect(dropzoneState({ filled: true })).toBe("filled");
  });

  it("shows drag-over even after an error, and invalid over filled", () => {
    expect(dropzoneState({ invalid: true, dragging: true })).toBe("drag-over");
    expect(dropzoneState({ invalid: true, filled: true })).toBe("invalid");
  });

  it("lets busy and disabled win, since both block input", () => {
    expect(dropzoneState({ dragging: true, disabled: true })).toBe("disabled");
    expect(dropzoneState({ disabled: true, busy: true })).toBe("busy");
  });
});

describe("Dropzone markup", () => {
  it("has exactly six states", () => {
    expect(DROPZONE_STATES).toEqual(["idle", "drag-over", "invalid", "filled", "disabled", "busy"]);
  });

  it("idle: dashed prompt, keyboard-reachable file input with the accepted types", () => {
    const html = render();
    expect(html).toContain('data-state="idle"');
    expect(html).toContain("border-dashed");
    expect(html).toContain('type="file"');
    expect(html).toContain('accept="image/jpeg,image/png,image/webp"');
    expect(html).toContain("JPEG, PNG or WebP, up to 10 MB");
    expect(html).not.toContain("disabled");
  });

  it("drag-over: accent border and fill", () => {
    const html = render({ forceState: "drag-over" });
    expect(html).toContain('data-state="drag-over"');
    expect(html).toContain("border-accent bg-accent-soft");
  });

  it("invalid: danger border and aria-invalid on the input", () => {
    const html = render({ invalid: true });
    expect(html).toContain('data-state="invalid"');
    expect(html).toContain("border-danger");
    expect(html).toContain('aria-invalid="true"');
  });

  it("filled: the preview replaces the prompt", () => {
    const html = render({ preview: createElement("img", { alt: "Door A: sign.webp", src: "/x.webp" }), shape: "tile" });
    expect(html).toContain('data-state="filled"');
    expect(html).toContain('alt="Door A: sign.webp"');
    expect(html).not.toContain("Drop a photo here");
  });

  it("disabled: the input is disabled", () => {
    const html = render({ disabled: true, inputLabel: "Door A: upload a sign image" });
    expect(html).toContain('data-state="disabled"');
    expect(html).toMatch(/<input[^>]*disabled=""/);
    expect(html).toContain('aria-label="Door A: upload a sign image"');
  });

  it("busy: aria-busy and a spinning icon", () => {
    const html = render({ busy: true });
    expect(html).toContain('data-state="busy"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("animate-spin");
  });
});
