import type { Metadata } from "next";
import { ReportDetailClient } from "@/components/app/report-detail-client";

export async function generateMetadata({ params }: PageProps<"/app/reports/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Report ${id}` };
}

export default async function ReportPage({ params }: PageProps<"/app/reports/[id]">) {
  const { id } = await params;
  // The analysis may live in this browser's localStorage, so it is looked up on the client.
  return <ReportDetailClient id={id} />;
}
