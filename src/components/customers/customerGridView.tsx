"use client";

import { memo } from "react";
import { Building2, Mail, Phone, Calendar, User } from "lucide-react";
import type { Customer } from "@/models/customerModel";

interface CustomerGridViewProps {
  data: Customer[];
  onRowClick: (customer: Customer) => void;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Lead: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  Active: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-400", dot: "bg-green-500" },
  Inactive: { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-500" },
  Churned: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
};

export const CustomerGridView = memo(function CustomerGridView({ data, onRowClick }: CustomerGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((customer) => {
        const statusStyle = statusConfig[customer.status] || statusConfig.Lead;

        return (
          <div
            key={customer.id}
            onClick={() => onRowClick(customer)}
            className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
          >
            {/* Header with status */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate group-hover:text-[var(--crm-primary)] transition-colors">
                    {customer.name}
                  </h3>
                  {customer.customerCode && (
                    <p className="text-xs text-muted-foreground font-mono">{customer.customerCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className="mb-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                {customer.status === "Lead" && "Tiềm năng"}
                {customer.status === "Active" && "Đang hoạt động"}
                {customer.status === "Inactive" && "Tạm ngưng"}
                {customer.status === "Churned" && "Đã rời bỏ"}
              </span>
            </div>

            {/* Contact info */}
            <div className="space-y-2 text-sm">
              {customer.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{customer.phone}</span>
                </div>
              )}
              {customer.ownerName && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{customer.ownerName}</span>
                </div>
              )}
              {customer.updatedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{new Date(customer.updatedAt).toLocaleDateString("vi-VN")}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {data.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Không có khách hàng nào</p>
        </div>
      )}
    </div>
  );
});
