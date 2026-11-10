import { PageTransition } from "@/components/motion/page-transition";

/** Transition between top-level sections (landing, about, design, app). */
export default function RootTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition lift={false}>{children}</PageTransition>;
}
