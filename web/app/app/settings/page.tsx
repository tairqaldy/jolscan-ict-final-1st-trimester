import type { Metadata } from "next";
import { SettingsClient } from "@/components/app/settings-client";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader eyebrow="Settings · both modules" title="Settings" description="Saved in this browser only. One provider and one set of privacy options for both modules." />
      <SettingsClient />
    </div>
  );
}
