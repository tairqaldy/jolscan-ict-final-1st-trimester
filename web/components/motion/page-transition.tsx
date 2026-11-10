"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Set after the first page has hydrated. The server never sets it (effects do
 * not run there), so the server HTML and the hydration render match.
 */
let hydratedOnce = false;

/**
 * Used by template.tsx files: each client-side navigation fades (and lifts)
 * the new page in with a short CSS animation (globals.css: .page-enter).
 * The very first page load is NOT animated: content is visible from the first
 * paint instead of flashing a blank page while JS loads.
 * Use lift={false} around anything containing position:fixed elements.
 */
export function PageTransition({ children, lift = true }: { children: ReactNode; lift?: boolean }) {
  const [animate] = useState(() => hydratedOnce);
  useEffect(() => {
    hydratedOnce = true;
  }, []);
  return <div className={animate ? (lift ? "page-enter page-enter--lift" : "page-enter") : undefined}>{children}</div>;
}
