/**
 * Motion tokens for JS animations (motion/react). Mirrors the CSS variables in
 * app/tokens.css (--duration-*, --ease-*). Keep the two in sync when re-skinning.
 * Seconds, because that is what motion expects.
 */
/** draw: one detection box outline drawing in, and the landing similarity bar (DESIGN-BRIEF.md, Motion). */
export const duration = { fast: 0.12, base: 0.2, slow: 0.42, draw: 0.3 } as const;

export const ease = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.3, 0, 0, 1],
  exit: [0.4, 0, 1, 1],
} as const satisfies Record<string, [number, number, number, number]>;

/**
 * Delay between items in a staggered list (tokens.css --stagger-step). Short
 * enough that a list ends within reveal.budget: see staggerDelay.
 */
export const stagger = 0.045;

/**
 * Single-purpose timings (seconds), named so that no animation in
 * components/ carries a bare number. Same values as before they moved here.
 */
export const timing = {
  /** Default CSS transition for hover, focus and colour (tokens.css --duration-ui). */
  ui: 0.16,
  /** A number counting from its old value to a new one (components/motion/count-up.tsx). */
  countUp: 0.8,
  /** One down-and-back sweep of the scan line while an analysis runs (analyze-client.tsx). */
  scanSweep: 2.2,
} as const;

/** Landing demos (components/landing), seconds. */
export const demo = {
  /** The roads demo replays its boxes this often. */
  heroReplay: 7,
  /** The sign demo moves to the next example pair this often. */
  pairCycle: 5,
  /**
   * The result line (priority or verdict) appears once the drawing is done:
   * the road boxes are in by 0.6 s, the similarity bar by
   * similarityDelay + duration.draw = 1.0 s.
   */
  resultDelay: 1.0,
  /** The first door's gender tag appears; the second one follows a step later. */
  tagDelay: 0.35,
  tagStep: 0.15,
  /** The similarity bar starts to grow. */
  similarityDelay: 0.7,
} as const;

/**
 * G-75: staged reveal of a fresh result (road analysis, restroom compare), seconds
 * from the moment the result appears. Each step is one --duration-base rise
 * (globals.css .result-stage): the priority or verdict card, then the score or
 * verdict inside it, then the rule rows one after another. No step starts after
 * lastStart, so the whole reveal ends by budget (600 ms, the swarm motion rule).
 */
export const reveal = {
  card: 0.06,
  key: 0.12,
  rows: 0.18,
  rowStep: 0.04,
  lastStart: 0.36,
  budget: 0.6,
} as const;

/**
 * Start of item i in a staggered entry whose items each take itemDuration
 * seconds: one stagger step per item, capped so the last item still ends
 * within reveal.budget (600 ms). Items past the cap start together.
 */
export function staggerDelay(i: number, itemDuration: number): number {
  return Math.min(i * stagger, Math.max(0, reveal.budget - itemDuration));
}
