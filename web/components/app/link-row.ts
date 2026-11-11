/**
 * Feedback for a list row or a card that is a link on the overview pages (G-9).
 * Hover darkens the border and the background, a press goes one step darker, so a
 * row that opens something reads differently from a static tile next to it.
 * Duration and easing are the button tokens (tokens.css --duration-fast, --ease-standard);
 * Reduce motion and prefers-reduced-motion cut the transition (globals.css).
 */
export const LINK_ROW =
  "transition-colors duration-[var(--duration-fast)] ease-standard hover:border-border-strong hover:bg-surface-2 active:bg-surface-3";

/** The arrow at the end of a link card: moves a little towards where the link goes on hover. */
export const LINK_ARROW =
  "size-4 shrink-0 text-muted transition-transform duration-[var(--duration-fast)] ease-standard group-hover:translate-x-0.5 group-hover:text-fg";
