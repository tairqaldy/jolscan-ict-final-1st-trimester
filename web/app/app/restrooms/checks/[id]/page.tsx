import type { Metadata } from "next";
import { CheckDetailClient } from "@/components/restrooms/check-detail-client";

export async function generateMetadata({ params }: PageProps<"/app/restrooms/checks/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Sign check ${id}` };
}

export default async function CheckPage({ params }: PageProps<"/app/restrooms/checks/[id]">) {
  const { id } = await params;
  // The check may live in this browser's localStorage, so it is looked up on the client.
  return <CheckDetailClient id={id} />;
}
