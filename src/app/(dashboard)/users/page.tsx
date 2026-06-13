"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ResetPasswordDialog, ToggleStatusDialog } from "@/components/users/userActionDialogs";
import {
  CreateUserDialog,
  EditUserDialog,
} from "@/components/users/userFormDialogs";
import { UserTable } from "@/components/users/userTable";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { canManageUsers, isAdmin } from "@/helper/authHelper";
import type { User } from "@/models";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false); // ← thêm
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const canManage = canManageUsers(currentUser ?? null);
  const isAdminUser = isAdmin(currentUser ?? null);

  const { data, isLoading, error } = useUsers();
  const { departments, filteredItems: deptFiltered, activeCount, adminCount } = useDepartments(
    data?.items ?? [],
    departmentFilter,
    teamFilter
  );

  const filteredItems = statusFilter
    ? deptFiltered.filter((u) => u.status.toLowerCase() === statusFilter)
    : deptFiltered;
  const { teams } = useTeams(departmentFilter);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setToggleStatusDialogOpen(true);
  };

  const handleResetPassword = (user: User) => { // ← thêm
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-[15px] font-medium text-[var(--crm-danger)]">Có lỗi xảy ra khi tải danh sách người dùng.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-[13px] font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium text-foreground">Quản lý người dùng</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Quản lý tài khoản và phân quyền trong hệ thống
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setCreateDialogOpen(true)}
            className="h-9 px-4 text-[13px] font-medium text-white bg-[var(--crm-primary)] rounded-lg hover:bg-[#14528F] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Tạo người dùng
          </button>
        )}
      </div>

      {/* ── Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="crm-stat-card">
          <p className="stat-label">Tổng người dùng</p>
          <p className="stat-value">{filteredItems.length}</p>
        </div>
        <div className="crm-stat-card">
          <p className="stat-label">Đang hoạt động</p>
          <p className="stat-value text-[var(--crm-success)]">{activeCount}</p>
        </div>
        <div className="crm-stat-card">
          <p className="stat-label">Quản trị viên (Admin)</p>
          <p className="stat-value text-foreground">{adminCount}</p>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────── */}
      {isAdminUser && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-muted-foreground">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 min-w-[140px] text-[13px] text-foreground bg-background border border-border rounded-lg outline-none cursor-pointer"
          >
            <option value="">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm ngưng</option>
            <option value="pending">Chờ đăng nhập</option>
          </select>

          <span className="text-[13px] font-medium text-muted-foreground ml-2">Phòng ban:</span>
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
            }}
            className="h-8 px-2.5 min-w-[160px] text-[13px] text-foreground bg-background border border-border rounded-lg outline-none cursor-pointer hover:border-muted-foreground focus:border-[var(--crm-primary)] focus:ring-1 focus:ring-[var(--crm-primary)]/20 transition-colors"
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          {departmentFilter && (
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="h-8 px-2.5 min-w-[160px] text-[13px] text-foreground bg-background border border-border rounded-lg outline-none cursor-pointer hover:border-muted-foreground focus:border-[var(--crm-primary)] focus:ring-1 focus:ring-[var(--crm-primary)]/20 transition-colors"
            >
              <option value="">Tất cả Team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 bg-card rounded-xl border border-border">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[var(--crm-primary)] border-t-transparent" />
        </div>
      ) : (
        <UserTable
          data={filteredItems}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword} // ← thêm
          canManage={canManage}
        />
      )}

      {/* ── Dialogs ────────────────────────────────────── */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
      />
      <ToggleStatusDialog
        open={toggleStatusDialogOpen}
        onOpenChange={setToggleStatusDialogOpen}
        user={selectedUser}
      />
      <ResetPasswordDialog  // ← thêm
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        user={selectedUser}
      />
    </div>
  );
}