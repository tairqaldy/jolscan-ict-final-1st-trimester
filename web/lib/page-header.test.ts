/**
 * Motion grill: the eyebrow's middle dot gets its own box (Overpass draws it
 * with no advance width), and the text a reader or screen reader gets is
 * unchanged.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageHeader } from "@/components/ui/page-header";

const text = (html: string) => html.replace(/<[^>]+>/g, "");

describe("PageHeader eyebrow", () => {
  it("boxes each middle dot and keeps the words and spaces", () => {
    const html = renderToStaticMarkup(createElement(PageHeader, { eyebrow: "Roads · Pothole detection", title: "T" }));
    expect(html).toContain('<span class="inline-block w-[0.24em]">·</span>');
    expect(text(html)).toContain("Roads · Pothole detection");
  });

  it("leaves an eyebrow without a dot as plain text", () => {
    const html = renderToStaticMarkup(createElement(PageHeader, { eyebrow: "Settings", title: "T" }));
    expect(html).toContain(">Settings</p>");
  });
});
