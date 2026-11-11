import type { ComponentProps, ReactNode } from "react";

export type IllustrationProps = Omit<ComponentProps<"svg">, "children">;

/**
 * Shared 120 × 80 canvas for the empty-state drawings (G-26). Decorative only,
 * so hidden from screen readers. Colours come from currentColor and tokens.
 */
export function IllustrationFrame({ children, ...props }: IllustrationProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 80"
      width={120}
      height={80}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}
