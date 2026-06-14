"use client";

import { memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowUpDown,
  Building2,
  Eye,
  Pencil,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type {
  Customer,
  CustomerStatus,
  CustomerSource,
} from "@/models/customerModel";

interface CustomerTableProps {
  data: Customer[];
  onSort: (column: string) => void;
  onRowClick: (customer: Customer) => void;
  onStatusClick: (customer: Customer) => void;
  onOwnerClick: (customer: Customer) => void;
  onDeleteClick: (customer: Customer) => void;
  onRestoreClick: (customer: Customer) => void;
  canChangeOwner: boolean;
  canDelete: boolean;
  canRestore: boolean;
}

/* ── Status badge config ─────────────────────────────── */

const statusConfig: Record<CustomerStatus, { label: string; class: string }> = {
  Lead:     { label: "Tiềm năng",  class: "badge-lead" },
  Active:   { label: "Hoạt động",  class: "badge-active" },
  Inactive: { label: "Tạm ngưng",  class: "badge-inactive" },
  Churned:  { label: "Rời bỏ",     class: "badge-churned" },
};

const statusDotColor: Record<CustomerStatus, string> = {
  Lead:     "bg-[var(--crm-primary)]",
  Active:   "bg-[var(--crm-success)]",
  Inactive: "bg-gray-400",
  Churned:  "bg-[var(--crm-danger)]",
};

/* ── Source label ────────────────────────────────────── */

const sourceLabel: Record<CustomerSource, string> = {
  Website:    "Website",
  Referral:   "Giới thiệu",
  "Cold Call":"Gọi điện",
  Event:      "Sự kiện",
  Partner:    "Đối tác",
  Other:      "Khác",
};

/* ── Empty state ─────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-xl">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
        <Building2 className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-[15px] font-medium text-muted-foreground">Không tìm thấy khách hàng nào</p>
      <p className="text-[13px] text-muted-foreground opacity-70 mt-1">Hãy thử thay đổi bộ lọc hoặc tạo khách hàng mới</p>
    </div>
  );
}

/* ── Table component ─────────────────────────────────── */

export const CustomerTable = memo(function CustomerTable({
  data,
  onSort,
  onRowClick,
  onStatusClick,
  onOwnerClick,
  onDeleteClick,
  onRestoreClick,
  canChangeOwner,
  canDelete,
  canRestore,
}: CustomerTableProps) {
  if (data.length === 0) return <EmptyState />;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] text-left text-muted-foreground">
          <thead className="text-[11px] text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <SortableHeader label="Khách hàng"  column="name"      onSort={onSort} />
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Nguồn</th>
              <SortableHeader label="Trạng thái"  column="status"    onSort={onSort} />
              <SortableHeader label="Phụ trách"   column="owner"     onSort={onSort} className="hidden md:table-cell" />
              <th className="px-4 py-3 font-medium hidden lg:table-cell">Phòng ban</th>
              <SortableHeader label="Cập nhật"    column="updatedAt" onSort={onSort} className="hidden lg:table-cell" />
              <th className="px-4 py-3 font-medium text-right w-20">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => onRowClick(customer)}
                className={`
                  border-b border-border cursor-pointer group
                  hover:bg-muted/60 transition-colors
                  ${customer.isDeleted ? "opacity-50" : ""}
                `}
              >
                {/* Tên + mã KH */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                      <AvatarFallback className="bg-[var(--crm-primary-light)] text-[var(--crm-primary)] text-xs font-semibold">
                        {customer.name ? customer.name.charAt(0).toUpperCase() : "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-[var(--crm-primary)] transition-colors">
                        {customer.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground opacity-70 mt-0.5 font-mono">
                        {customer.customerCode}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Nguồn */}
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-[12px]">
                  {sourceLabel[customer.source] ?? customer.source}
                </td>

                {/* Trạng thái */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusConfig[customer.status].class}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDotColor[customer.status]}`} />
                    {statusConfig[customer.status].label}
                  </span>
                </td>

                {/* Phụ trách */}
                <td 
                  className="px-4 py-3 hidden md:table-cell cursor-pointer group/owner hover:bg-muted transition-colors"
                  onClick={(e) => { e.stopPropagation(); onOwnerClick(customer); }}
                  title="Đổi người phụ trách"
                >
                  {customer.ownerName ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={customer.ownerAvatarUrl} alt={customer.ownerName} />
                        <AvatarFallback className="bg-[var(--crm-primary-light)] text-[var(--crm-primary)] text-[10px] font-semibold uppercase">
                          {customer.ownerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[13px] text-foreground truncate group-hover/owner:text-[var(--crm-primary)] transition-colors">{customer.ownerName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic text-[12px] group-hover/owner:text-[var(--crm-primary)] transition-colors">Chưa giao (Nhấn để phân công)</span>
                  )}
                </td>

                {/* Phòng ban */}
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-[13px]">
                  {customer.departmentName || "—"}
                </td>

                {/* Cập nhật */}
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground opacity-70 text-[12px]">
                  {formatDistanceToNow(new Date(customer.updatedAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onRowClick(customer); }}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-[var(--crm-primary)] transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onStatusClick(customer); }}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Sortable header cell ────────────────────────────── */

function SortableHeader({
  label,
  column,
  onSort,
  className = "",
}: {
  label: string;
  column: string;
  onSort: (column: string) => void;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 font-medium cursor-pointer hover:bg-muted transition-colors group/th ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-50 group-hover/th:opacity-100 transition-opacity" />
      </div>
    </th>
  );
}