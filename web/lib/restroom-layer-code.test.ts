import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LAYER_CODE, githubLines } from "./restroom-layer-code";

describe("layer code excerpts", () => {
  it("match the lines of the Python files exactly", () => {
    for (const e of LAYER_CODE) {
      const lines = readFileSync(fileURLToPath(new URL(`../../${e.file}`, import.meta.url)), "utf8").split("\n");
      expect(e.code, `${e.file}:${e.from}-${e.to}`).toBe(lines.slice(e.from - 1, e.to).join("\n"));
    }
  });

  it("show the unfreezing in every excerpt and link to the right lines", () => {
    expect(LAYER_CODE.find((e) => e.id === "clip")!.code).toContain("p.requires_grad = True");
    expect(githubLines(LAYER_CODE[0])).toBe(
      "https://github.com/tairqaldy/qarau-ict-final-1st-trimester/blob/main/ml/restroom/common.py#L393-L407",
    );
  });
});
