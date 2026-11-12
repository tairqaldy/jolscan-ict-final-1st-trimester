import { Activity, ArrowRight, Database, FlaskConical, Rocket, Undo2 } from "lucide-react";

const STEPS = [
  { icon: Database, title: "Collect and validate data", where: "data/ · pothole dataset version, IOAI restroom set" },
  { icon: FlaskConical, title: "Train and evaluate", where: "ml/ · Colab, Ultralytics YOLO, CLIP, MLflow" },
  { icon: Rocket, title: "Deploy", where: "api/ · FastAPI, Docker, HF Spaces" },
  { icon: Activity, title: "Monitor", where: "web/ · analytics page" },
];

/**
 * Lifecycle as an ordered list (readable without the picture), laid out as a
 * row of steps with a return arrow back to data.
 */
export function LifecycleDiagram() {
  return (
    <div className="rounded-lg border border-border bg-surface p-(--card-pad)">
      <ol className="grid gap-3 md:grid-cols-4 md:gap-0">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.title} className="flex items-center gap-3 md:flex-col md:items-stretch md:gap-0">
              <div className="flex flex-1 items-stretch md:w-full">
                <div className="flex min-w-0 flex-1 items-start gap-3 rounded-md border border-border-strong bg-surface-2 p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent text-accent-fg">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-subtle">Step {i + 1}</span>
                    <span className="block font-semibold leading-snug">{s.title}</span>
                    <span className="block text-xs text-muted">{s.where}</span>
                  </span>
                </div>
                {i < STEPS.length - 1 && <ArrowRight className="mx-1 hidden size-5 shrink-0 self-center text-subtle md:block" aria-hidden />}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 flex items-center gap-3 rounded-md border border-dashed border-accent px-3 py-2.5 text-sm">
        <Undo2 className="size-4.5 shrink-0 text-accent-ink" aria-hidden />
        <p>
          <span className="font-semibold">Back to data:</span>{" "}
          <span className="text-muted">
            low-confidence road photos and confusing sign pairs from the review queues are labelled and added to the next dataset
            version.
          </span>
        </p>
      </div>
    </div>
  );
}
