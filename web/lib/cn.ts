/** Join class names, skipping falsy values. Tiny on purpose (no clsx/tailwind-merge). */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
