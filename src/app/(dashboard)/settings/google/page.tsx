"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { GoogleSyncSettings } from "@/components/settings/googleSyncSettings";

export default function GoogleSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại Settings
      </Link>
      <GoogleSyncSettings />
    </div>
  );
}
