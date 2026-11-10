import type { Metadata } from "next";
import { PlatformOverviewClient } from "@/components/app/platform-overview-client";

export const metadata: Metadata = { title: "Home" };

export default function PlatformHomePage() {
  return <PlatformOverviewClient />;
}
