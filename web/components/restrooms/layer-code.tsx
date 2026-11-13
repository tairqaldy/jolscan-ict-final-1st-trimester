"use client";

import { ExternalLink, FileCode } from "lucide-react";
import { useState } from "react";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LAYER_CODE, githubLines } from "@/lib/restroom-layer-code";

/**
 * "How we changed the layers": the real code behind the layer chart, one tab
 * per excerpt (lib/restroom-layer-code.ts, checked against the Python files).
 */
export function LayerCode() {
  const [excerpt, setExcerpt] = useState(LAYER_CODE[0].id);
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>How we changed the layers</CardTitle>
          <CardDescription>
            The code behind the chart above, copied from the repository. There is no Colab notebook for the restroom model: the
            sweep is plain Python (<code className="[overflow-wrap:anywhere]">ml/restroom/layers.py</code>), run on a Kaggle T4 GPU by{" "}
            <code className="[overflow-wrap:anywhere]">ml/restroom/kaggle_run_layers.py</code>. Only the number of trained layers changes
            between runs.
          </CardDescription>
        </div>
      </CardHeader>
      <CardBody>
        <Tabs value={excerpt} onValueChange={setExcerpt}>
          {/* Five long tab names do not fit a phone (the strip was three screens wide), so a phone gets one select. */}
          <Select
            label="Code excerpt"
            value={excerpt}
            onValueChange={setExcerpt}
            options={LAYER_CODE.map((e) => ({ value: e.id, label: e.title }))}
            className="mb-3 sm:hidden"
          />
          <TabsList aria-label="Code excerpts" className="overflow-y-hidden max-sm:hidden">
            {LAYER_CODE.map((e) => (
              <TabsTrigger key={e.id} value={e.id}>
                {e.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {LAYER_CODE.map((e) => (
            <TabsContent key={e.id} value={e.id} className="grid gap-3">
              <p className="max-w-3xl text-sm text-muted">{e.note}</p>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5 font-mono [overflow-wrap:anywhere]">
                  <FileCode className="size-3.5" aria-hidden />
                  {e.file}, lines {e.from}–{e.to}
                </span>
                {e.onMain ? (
                  <a
                    href={githubLines(e)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-accent-ink underline underline-offset-2"
                  >
                    Open on GitHub <ExternalLink className="size-3" aria-hidden />
                  </a>
                ) : (
                  <span>not on main yet</span>
                )}
              </p>
              <pre className="max-h-[28rem] overflow-auto rounded-md bg-surface-2 p-4 font-mono text-xs leading-relaxed">
                <code>{e.code}</code>
              </pre>
            </TabsContent>
          ))}
        </Tabs>
      </CardBody>
    </Card>
  );
}
