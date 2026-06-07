"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/helper/authHelper";
import { DepartmentManagement } from "@/components/settings/departmentManagement";
import { TeamManagement } from "@/components/settings/TeamManagement";

export default function DepartmentsSettingsPage() {
  const { user } = useAuth();

  if (!isAdmin(user)) {
    return (
      <div className="py-10 text-center text-gray-500">
        Bạn không có quyền quản lý phòng ban.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại Settings
      </Link>
      <h1 className="text-xl font-semibold mt-8">Quản lý phòng ban</h1>
      <DepartmentManagement />

      <h1 className="text-xl font-semibold mt-8">Quản lý Team</h1>
      <TeamManagement />
    </div>
  );
}
