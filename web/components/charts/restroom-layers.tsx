"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Segmented } from "@/components/ui/segmented";
import raw from "@/data/restroom-experiments.json";
import {
  axisProps,
  ChartCard,
  chartMargin,
  DataTable,
  gridProps,
  LegendSwatch,
  referenceLabel,
  referenceLineProps,
  SERIES,
  tooltipProps,
  xAxisTitle,
  yAxisTitle,
  yAxisWidth,
} from "./chart-kit";

type LayerRow = {
  backbone: "clip" | "resnet";
  n_trained: number;
  trainable_params: number;
  pair_top1_heldout_vs_all164: number;
  pair_top1_heldout_vs_all164_std: number;
  pair_top1_train: number;
  gender_acc_heldout: number;
  best: boolean;
};

const LAYERS = ((raw as { layers?: LayerRow[] }).layers ?? []) as LayerRow[];
const BACKBONE = {
  clip: { label: "CLIP ViT-B/32", unit: "transformer blocks trained (of 12)" },
  resnet: { label: "ResNet50", unit: "stages trained (of 5)" },
} as const;

/**
 * The layer sweep (task C-11): partner found among all 164 originals on held-out
 * restrooms (grouped 5-fold CV, 3 seeds) against the number of trained layers,
 * with the training restrooms' score to show overfitting and gender accuracy.
 * Read from web/data/restroom-experiments.json (`layers`, written by
 * ml/restroom/export_results.py from ml/results/restroom/layers.csv).
 */
export function RestroomLayersChart() {
  const [backbone, setBackbone] = useState<"clip" | "resnet">("clip");
  const rows = LAYERS.filter((r) => r.backbone === backbone).sort((a, b) => a.n_trained - b.n_trained);
  if (!rows.length) return null;
  const best = rows.find((r) => r.best) ?? rows[0];
  const data = rows.map((r) => ({
    n: r.n_trained,
    heldout: r.pair_top1_heldout_vs_all164,
    train: r.pair_top1_train,
    gender: r.gender_acc_heldout,
  }));
  return (
    <ChartCard
      title="How the number of trained layers changes the model"
      description={`${BACKBONE[backbone].label}: share of cropped query signs whose partner is ranked first among all 164 originals, on restrooms the model did not train on (5-fold cross-validation grouped by restroom, 3 seeds), against how many of its last layers were fine-tuned. Best: ${best.n_trained} (${best.pair_top1_heldout_vs_all164.toFixed(3)}). On the training restrooms every model with trained layers scores 1.0: more layers memorise more, and gender accuracy on new restrooms falls.`}
      height={300}
      legend={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <LegendSwatch color={SERIES[0]} label="Held-out restrooms" />
            <LegendSwatch color={SERIES[1]} dashed label="Training restrooms (overfitting)" />
            <LegendSwatch color={SERIES[2]} label="Gender, held-out" />
          </div>
          <Segmented
            label="Backbone"
            hideLabel
            value={backbone}
            onChange={setBackbone}
            options={[
              { value: "clip", label: "CLIP" },
              { value: "resnet", label: "ResNet50" },
            ]}
          />
        </div>
      }
      table={
        <DataTable
          head={["Trained", "Held-out", "± (seeds)", "Training", "Gender held-out", "Parameters trained"]}
          rows={rows.map((r) => [
            `${r.n_trained}${r.best ? " (best)" : ""}`,
            r.pair_top1_heldout_vs_all164.toFixed(3),
            r.pair_top1_heldout_vs_all164_std.toFixed(3),
            r.pair_top1_train.toFixed(3),
            r.gender_acc_heldout.toFixed(3),
            r.trainable_params.toLocaleString("en-US"),
          ])}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={chartMargin({ xTitle: true })}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="n" type="number" domain={[0, "dataMax"]} ticks={data.map((d) => d.n)} {...axisProps}>
            {xAxisTitle(BACKBONE[backbone].unit)}
          </XAxis>
          <YAxis domain={[0.5, 1]} ticks={[0.5, 0.6, 0.7, 0.8, 0.9, 1]} width={yAxisWidth(4)} {...axisProps}>
            {yAxisTitle("Share right")}
          </YAxis>
          <Tooltip {...tooltipProps} formatter={(v) => (typeof v === "number" ? v.toFixed(3) : String(v))} labelFormatter={(n) => `${n} trained`} />
          <ReferenceLine x={best.n_trained} {...referenceLineProps}>
            {referenceLabel(`best ${best.n_trained}`)}
          </ReferenceLine>
          <Line type="monotone" dataKey="heldout" name="Held-out" stroke={SERIES[0]} strokeWidth={2.5} dot={{ r: 4 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="train" name="Training" stroke={SERIES[1]} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="gender" name="Gender" stroke={SERIES[2]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
