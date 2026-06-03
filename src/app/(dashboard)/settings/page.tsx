"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/helper/authHelper";

export default function SettingsPage() {
  const { user } = useAuth();
  if (!isAdmin(user)) {
    return <div className="py-10 text-center text-gray-500">Bạn không có quyền truy cập Settings.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>
      <Link href="/settings/pipeline" className="block rounded-xl border bg-white p-4 hover:bg-slate-50">
        <p className="font-medium">Pipeline Stages</p>
        <p className="text-sm text-gray-500">Cấu hình stage cho sales pipeline.</p>
      </Link>
      <Link href="/settings/google" className="block rounded-xl border bg-white p-4 hover:bg-slate-50">
        <p className="font-medium">Gmail & Calendar</p>
        <p className="text-sm text-gray-500">Kết nối Google để tự động đồng bộ hoạt động vào timeline.</p>
      </Link>
    </div>
  );
}

