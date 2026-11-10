import type { Metadata } from "next";
import { SettingsClient } from "@/components/app/settings-client";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader eyebrow="Settings" title="Settings" description="Saved in this browser only." />
      <SettingsClient />
    </div>
  );
}
