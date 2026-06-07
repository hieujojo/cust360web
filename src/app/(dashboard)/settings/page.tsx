"use client";

import Link from "next/link";
import { Building2, GitBranch, Mail, Settings, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/helper/authHelper";

const settingsCards = [
  {
    href: "/settings/organization",
    title: "Hồ sơ tổ chức",
    description: "Tên công ty, logo, múi giờ, tiền tệ và ngôn ngữ.",
    icon: Building2,
  },
  {
    href: "/settings/departments",
    title: "Phòng ban",
    description: "Thêm, sửa, xóa phòng ban và gán trưởng phòng.",
    icon: Building2,
  },
  {
    href: "/users",
    title: "Quản lý người dùng",
    description: "Tạo tài khoản, phân quyền, vô hiệu hóa và reset mật khẩu.",
    icon: Users,
  },
  {
    href: "/settings/pipeline",
    title: "Pipeline Stages",
    description: "Cấu hình stage, xác suất mặc định và ngưỡng stuck.",
    icon: GitBranch,
  },
  {
    href: "/settings/google",
    title: "Gmail & Calendar",
    description: "Kết nối Google để tự động đồng bộ hoạt động vào timeline.",
    icon: Mail,
  },
];

export default function SettingsPage() {
  const { user } = useAuth();
  if (!isAdmin(user)) {
    return <div className="py-10 text-center text-gray-500">Bạn không có quyền truy cập Settings.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h1 className="text-xl font-semibold">Cài đặt hệ thống</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="flex gap-3 rounded-xl border bg-white p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{card.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{card.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

