import type { Metadata } from "next";
import { RestroomOverviewClient } from "@/components/restrooms/restroom-overview-client";
import { MODULES } from "@/lib/brand";

export const metadata: Metadata = { title: `${MODULES.restrooms.name} overview` };

export default function RestroomsPage() {
  return <RestroomOverviewClient />;
}
