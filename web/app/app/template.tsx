import { PageTransition } from "@/components/motion/page-transition";

/** Re-mounts on every /app/* navigation, so each page fades in. */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
