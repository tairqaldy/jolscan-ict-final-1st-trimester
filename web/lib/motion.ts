/**
 * Motion tokens for JS animations (motion/react). Mirrors the CSS variables in
 * app/tokens.css (--duration-*, --ease-*). Keep the two in sync when re-skinning.
 * Seconds, because that is what motion expects.
 */
export const duration = { fast: 0.12, base: 0.2, slow: 0.42, draw: 0.7 } as const;

export const ease = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.3, 0, 0, 1],
  exit: [0.4, 0, 1, 1],
} as const satisfies Record<string, [number, number, number, number]>;

/** Delay between items in a staggered list. */
export const stagger = 0.06;

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
  /** The result line (priority or verdict) appears once the drawing is done. */
  resultDelay: 1.4,
  /** The first door's gender tag appears; the second one follows a step later. */
  tagDelay: 0.35,
  tagStep: 0.15,
  /** The similarity bar starts to grow. */
  similarityDelay: 0.7,
} as const;
