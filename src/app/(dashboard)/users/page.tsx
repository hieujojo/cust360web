"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResetPasswordDialog,
  ToggleStatusDialog,
} from "@/components/users/userActionDialogs";
import {
  CreateUserDialog,
  EditUserDialog,
} from "@/components/users/userFormDialogs";
import { UserTable } from "@/components/users/userTable";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { canManageUsers, isAdmin } from "@/helper/authHelper";
import type { User } from "@/models";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const canManage = canManageUsers(currentUser ?? null);
  const isAdminUser = isAdmin(currentUser ?? null);

  // Fetch users — department scoping is handled automatically in useUsers hook
  const { data, isLoading, error } = useUsers({
    page,
    pageSize: 20,
    departmentId: departmentFilter || undefined,
  });

  // Calculate totalPages from total and pageSize
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setToggleStatusDialogOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-destructive font-semibold">Có lỗi xảy ra khi tải danh sách người dùng.</p>
        <div className="text-sm text-muted-foreground max-w-2xl">
          <p className="font-mono bg-muted p-4 rounded">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Tải lại trang
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground">
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo người dùng
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Tổng người dùng</p>
          <p className="text-2xl font-bold">{data?.total ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Đang hoạt động</p>
          <p className="text-2xl font-bold">
            {data?.items.filter((u) => u.isActive).length ?? 0}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Admin</p>
          <p className="text-2xl font-bold">
            {data?.items.filter((u) => u.role <= 2).length ?? 0}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Sales Team</p>
          <p className="text-2xl font-bold">
            {data?.items.filter((u) => u.role >= 3).length ?? 0}
          </p>
        </div>
      </div>

      {/* Department filter — only for admins */}
      {isAdminUser && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Lọc theo phòng ban:</span>
          <Select
            value={departmentFilter || "all"}
            onValueChange={(val) => {
              setDepartmentFilter(val === "all" ? "" : val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48" aria-label="Lọc theo phòng ban">
              <SelectValue placeholder="Tất cả phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng ban</SelectItem>
              {/* Department list will be populated from API in future */}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Table */}
      <UserTable
        data={data?.items ?? []}
        onEdit={handleEdit}
        onDelete={handleToggleStatus}
        onResetPassword={handleResetPassword}
        canManage={canManage}
      />

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {data.page} / {totalPages} — {data.total} người dùng
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trang trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
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
      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        user={selectedUser}
      />
    </div>
  );
}
