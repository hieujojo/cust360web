"use client";

import { Users, TrendingUp, Building2, Activity, RefreshCw, LayoutDashboard, BarChart3, GitBranch } from "lucide-react";

import { getRoleLabel } from "@/helper/authHelper";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ─── Skeleton ──────────────────────────────────────────── */

function StatSkeleton() {
  return (
    <div className="h-6 w-16 animate-pulse rounded-md bg-gray-200" />
  );
}

/* ─── Stat card ─────────────────────────────────────────── */

interface StatCardProps {
  title: string;
  value: number;
  label: string;
  icon: React.ElementType;
  isLoading: boolean;
  color?: string;
}

function StatCard({ title, value, label, icon: Icon, isLoading, color = "text-muted-foreground" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", color)} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <StatSkeleton />
        ) : (
          <div className="text-2xl font-bold">{value.toLocaleString("vi-VN")}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

/* ─── Page ───────────────────────────────────────────────── */

export default function DashboardPage() {
  const { user } = useAuth();
  const { customerCount, departmentCount, userCount, openDealsCount, todayDealsCount, isLoading, isAdmin, isError } = useDashboardStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Chào mừng trở lại, {user?.displayName ?? "bạn"}!
        </p>
      </div>

      {/* System intro */}
      <div className="rounded-xl border bg-muted/40 p-4 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
          <LayoutDashboard className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-sm font-medium">CRM Customer 360</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Nền tảng quản lý quan hệ khách hàng toàn diện — theo dõi khách hàng, pipeline deals và hoạt động nội bộ trong một giao diện duy nhất.
          </p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            <Activity className="h-3 w-3" /> Hệ thống đang hoạt động ổn định
          </span>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Building2, title: "Khách hàng", desc: "Quản lý thông tin, lịch sử tương tác và phân loại theo phòng ban.", bg: "bg-blue-50 dark:bg-blue-950", color: "text-blue-600 dark:text-blue-400" },
          { icon: GitBranch, title: "Pipeline", desc: "Theo dõi deals theo từng giai đoạn và dự báo doanh thu.", bg: "bg-violet-50 dark:bg-violet-950", color: "text-violet-600 dark:text-violet-400" },
          { icon: BarChart3, title: "Báo cáo", desc: "Phân tích dữ liệu theo nhóm, phòng ban và thời gian.", bg: "bg-green-50 dark:bg-green-950", color: "text-green-600 dark:text-green-400" },
          { icon: Users, title: "Nhóm & phân quyền", desc: "Phân chia nhân sự và thiết lập vai trò truy cập.", bg: "bg-amber-50 dark:bg-amber-950", color: "text-amber-600 dark:text-amber-400" },
        ].map(({ icon: Icon, title, desc, bg, color }) => (
          <div key={title} className="flex gap-3 rounded-xl border bg-card p-4">
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", bg)}>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <RefreshCw className="h-4 w-4 shrink-0" />
          Không thể tải một số dữ liệu. Vui lòng thử lại sau.
        </div>
      )}

      {/* Stat cards */}
      <div
        className={cn(
          "grid gap-4",
          isAdmin
            ? "md:grid-cols-3 lg:grid-cols-5"  // 5 cards khi là Admin
            : "md:grid-cols-2 lg:grid-cols-4"  // 4 cards khi không phải Admin
        )}
        data-tour="dashboard-stats"
      >
        <StatCard
          title="Khách hàng"
          value={customerCount}
          label="Tổng khách hàng"
          icon={Building2}
          isLoading={isLoading}
        />

        <StatCard
          title="Deals"
          value={openDealsCount}
          label="Deals đang mở"
          icon={TrendingUp}
          isLoading={isLoading}
          color="text-muted-foreground"
        />

        <StatCard
          title="Phòng ban"
          value={departmentCount}
          label={isAdmin ? "Toàn tổ chức" : "Phòng ban"}
          icon={Users}
          isLoading={isLoading}
        />

        <StatCard
          title="Hoạt động"
          value={todayDealsCount}
          label="Hoạt động hôm nay"
          icon={Activity}
          isLoading={isLoading}
          color="text-muted-foreground"
        />
        {isAdmin && (
          <StatCard
            title="Người dùng"
            value={userCount}
            label="Tổng tài khoản"
            icon={Users}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Thông tin tài khoản */}
      <Card data-tour="dashboard-account-info">
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>Chi tiết tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Mã nhân viên</p>
            <p className="text-sm">{user?.employeeCode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phòng ban</p>
            <p className="text-sm">{user?.departmentName || "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Team</p>
            <p className="text-sm">
              {user?.teamName || "—"} {user?.isTeamLead && "(Lead)"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Vai trò</p>
            <p className="text-sm">{getRoleLabel(user?.role)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
