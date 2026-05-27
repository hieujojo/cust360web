"use client";

import { Building2, UserCircle2, Mail, Phone, User, Briefcase, RefreshCcw, Trash2, ArrowRightLeft } from "lucide-react";
import type { Customer360Response } from "@/models/customerModel";

interface CustomerSidebarProps {
  info: Customer360Response["info"];
  sidebar: Customer360Response["sidebar"];
  onStatusClick: () => void;
  onOwnerClick: () => void;
  onDeleteClick: () => void;
  onRestoreClick: () => void;
  canChangeOwner: boolean;
  canDelete: boolean;
  canRestore: boolean;
  isDeleted: boolean;
}

const statusColors = {
  Lead: "bg-blue-50 text-blue-700 border-blue-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-300",
  Churned: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels = {
  Lead: "Tiềm năng",
  Active: "Hoạt động",
  Inactive: "Tạm ngưng",
  Churned: "Rời bỏ",
};

export function CustomerSidebar({
  info,
  sidebar,
  onStatusClick,
  onOwnerClick,
  onDeleteClick,
  onRestoreClick,
  canChangeOwner,
  canDelete,
  canRestore,
  isDeleted,
}: CustomerSidebarProps) {
  return (
    <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
      {/* Basic Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        {isDeleted && (
          <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
        )}
        <div className="p-6 flex flex-col items-center text-center border-b border-slate-100">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{info.name}</h2>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">
              {info.customerCode}
            </span>
          </div>
          <span className={`inline-flex px-3 py-1 text-xs font-semibold border rounded-full ${statusColors[info.status]}`}>
            {statusLabels[info.status]}
          </span>
        </div>

        {/* Contact Info */}
        <div className="p-4 space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="flex-1 overflow-hidden">
              <p className="text-slate-500 mb-0.5 text-xs uppercase font-semibold">Email</p>
              <p className="text-slate-900 truncate" title={info.email || ""}>{info.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-slate-500 mb-0.5 text-xs uppercase font-semibold">Số điện thoại</p>
              <p className="text-slate-900">{info.phone || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-slate-500 mb-0.5 text-xs uppercase font-semibold">Người phụ trách</p>
              <p className="text-slate-900 font-medium">{info.ownerName || "Chưa giao"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Briefcase className="h-4 w-4 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-slate-500 mb-0.5 text-xs uppercase font-semibold">Phòng ban</p>
              <p className="text-slate-900">{info.departmentName || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <p className="text-xl font-bold text-slate-900">{sidebar.openDealsCount || 0}</p>
          <p className="text-xs text-slate-500 font-medium uppercase mt-1">Deals mở</p>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <p className="text-xl font-bold text-slate-900">{sidebar.activeTicketsCount || 0}</p>
          <p className="text-xs text-slate-500 font-medium uppercase mt-1">Tickets mở</p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase">Thao tác nhanh</h3>
        
        {!isDeleted && (
          <button
            onClick={onStatusClick}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-slate-500" />
              Đổi trạng thái
            </div>
          </button>
        )}

        {!isDeleted && canChangeOwner && (
          <button
            onClick={onOwnerClick}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <UserCircle2 className="h-4 w-4 text-slate-500" />
              Đổi người phụ trách
            </div>
          </button>
        )}

        {isDeleted && canRestore && (
          <button
            onClick={onRestoreClick}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Khôi phục khách hàng
            </div>
          </button>
        )}

        {!isDeleted && canDelete && (
          <button
            onClick={onDeleteClick}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors mt-4"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Xóa khách hàng
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
