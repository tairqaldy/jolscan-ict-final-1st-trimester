import type { Metadata } from "next";
import { DashboardClient } from "@/components/app/dashboard-client";
import { MODULES } from "@/lib/brand";

export const metadata: Metadata = { title: `${MODULES.roads.name} overview` };

export default function RoadsOverviewPage() {
  return <DashboardClient />;
}
