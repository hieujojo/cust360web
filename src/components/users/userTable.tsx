"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  KeyRound,
  Pencil,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";

import type { User } from "@/models";
import { getRoleLabel } from "@/helper/authHelper";

interface UserTableProps {
  data: User[];
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onResetPassword: (user: User) => void; // ← thêm
  canManage?: boolean;
}

export function UserTable({
  data,
  onEdit,
  onToggleStatus,
  onResetPassword, // ← thêm
  canManage = true,
}: UserTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "employeeCode",
      header: "Mã NV",
      cell: ({ row }) => (
        <div className="font-mono text-[12px] text-gray-500">
          {row.getValue("employeeCode")}
        </div>
      ),
    },
    {
      accessorKey: "displayName",
      header: "Họ và tên",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 group-hover:text-[var(--crm-primary)] transition-colors">
            {row.getValue("displayName")}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => {
        const role = row.getValue("role") as number;
        let badgeClass = "badge-user";
        if (role === 1) badgeClass = "badge-owner";
        if (role === 2) badgeClass = "badge-admin";

        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${badgeClass}`}>
            {getRoleLabel(role)}
          </span>
        );
      },
    },
    {
      accessorKey: "departmentName",
      header: "Phòng ban",
      cell: ({ row }) => (
        <div className="text-[13px] text-gray-600">
          {row.getValue("departmentName") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status;
        const config =
          status === "Pending"
            ? { badgeClass: "bg-amber-50 text-amber-700", dotClass: "bg-amber-500", label: "Chờ đăng nhập" }
            : status === "Inactive"
              ? { badgeClass: "badge-inactive", dotClass: "bg-gray-400", label: "Tạm ngưng" }
              : { badgeClass: "badge-active", dotClass: "bg-[var(--crm-success)]", label: "Hoạt động" };

        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${config.badgeClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
            {config.label}
          </span>
        );
      },
    },
  ];

  if (canManage) {
    columns.push({
      id: "actions",
      header: () => <div className="text-right">Thao tác</div>,
      cell: ({ row }) => {
        const user = row.original;
        const isActive = user.isActive;

        return (
          <div className="table-row-actions flex items-center justify-end gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(user); }}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-[var(--crm-primary)] transition-colors"
              title="Chỉnh sửa"
            >
              <Pencil className="h-4 w-4" />
            </button>
            {/* ── Reset Password ── */}
            <button
              onClick={(e) => { e.stopPropagation(); onResetPassword(user); }}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-amber-500 transition-colors"
              title="Đặt lại mật khẩu"
            >
              <KeyRound className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStatus(user); }}
              className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
                isActive ? "text-gray-400 hover:text-[var(--crm-danger)]" : "text-gray-400 hover:text-[var(--crm-success)]"
              }`}
              title={isActive ? "Vô hiệu hoá" : "Kích hoạt"}
            >
              {isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </button>
          </div>
        );
      },
    });
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 20 },
    },
  });

  return (
    <div className="space-y-4">
      {/* ── Search Input ─────────────────────────────── */}
      <div className="relative w-full sm:w-[320px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-9 w-full rounded-lg border border-[var(--crm-border)] bg-white pl-9 pr-3 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[var(--crm-primary)] focus:ring-1 focus:ring-[var(--crm-primary)]/20 transition-colors"
        />
      </div>

      {/* ── Table ────────────────────────────────────── */}
      <div className="bg-white border border-[var(--crm-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left text-gray-600">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/80 border-b border-[var(--crm-border)]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 font-medium whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group border-b border-gray-100 hover:bg-gray-50/60 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center text-[13px] text-gray-500">
                    {globalFilter ? "Không tìm thấy kết quả phù hợp." : "Chưa có dữ liệu."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ───────────────────────────────── */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-gray-500">
            Hiển thị <span className="font-medium text-gray-900">{((table.getState().pagination.pageIndex) * 20) + 1}–{Math.min((table.getState().pagination.pageIndex + 1) * 20, data.length)}</span>
            {" "}của <span className="font-medium text-gray-900">{data.length}</span> người dùng
          </p>
          <div className="flex gap-2">
            <button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className="h-8 px-3 text-[13px] font-medium text-gray-700 bg-white border border-[var(--crm-border)] rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trang trước
            </button>
            <button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className="h-8 px-3 text-[13px] font-medium text-gray-700 bg-white border border-[var(--crm-border)] rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}