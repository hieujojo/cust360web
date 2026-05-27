"use client";

import { Users, TrendingUp, Building2, Activity, RefreshCw } from "lucide-react";

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
  const { customerCount, departmentCount, userCount, isLoading, isAdmin, isError } = useDashboardStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Chào mừng trở lại, {user?.displayName ?? "bạn"}!
        </p>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <RefreshCw className="h-4 w-4 shrink-0" />
          Không thể tải một số dữ liệu. Vui lòng thử lại sau.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Khách hàng"
          value={customerCount}
          label="Tổng khách hàng"
          icon={Building2}
          isLoading={isLoading}
        />

        <StatCard
          title="Deals"
          value={0}
          label="Deals đang mở"
          icon={TrendingUp}
          isLoading={false}
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
          value={0}
          label="Hoạt động hôm nay"
          icon={Activity}
          isLoading={false}
          color="text-muted-foreground"
        />
      </div>

      {/* Admin: thêm card số lượng user */}
      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <StatSkeleton />
              ) : (
                <div className="text-2xl font-bold">{userCount.toLocaleString("vi-VN")}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Tổng tài khoản</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Thông tin tài khoản */}
      <Card>
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
