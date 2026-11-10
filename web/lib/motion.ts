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
