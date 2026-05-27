"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useChangeCustomerStatus } from "@/hooks/useCustomers";
import type { Customer, CustomerStatus } from "@/models/customerModel";
import { useToast } from "@/helper/toastHelper";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

const statusTransitions: Record<CustomerStatus, CustomerStatus[]> = {
  Lead: ["Active", "Inactive"],
  Active: ["Inactive", "Churned"],
  Inactive: ["Active"],
  Churned: [],
};

const statusLabels: Record<CustomerStatus, string> = {
  Lead: "Tiềm năng",
  Active: "Hoạt động",
  Inactive: "Tạm ngưng",
  Churned: "Rời bỏ",
};

export function StatusChangeDialog({ open, onOpenChange, customer }: StatusChangeDialogProps) {
  const { toast } = useToast();
  const changeStatusMutation = useChangeCustomerStatus();
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || !customer) return null;

  const validNextStatuses = statusTransitions[customer.status] || [];

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    setIsSubmitting(true);
    try {
      await changeStatusMutation.mutateAsync({
        id: customer.id,
        payload: { newStatus: selectedStatus as CustomerStatus },
      });
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái khách hàng.",
      });
      onOpenChange(false);
      setSelectedStatus("");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Đổi trạng thái</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Khách hàng:</p>
            <p className="font-medium text-slate-900">{customer.name}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">Trạng thái hiện tại:</p>
            <span className="inline-flex px-2.5 py-1 text-xs font-medium border rounded-full bg-slate-100 text-slate-700">
              {statusLabels[customer.status]}
            </span>
          </div>

          {validNextStatuses.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Trạng thái mới
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CustomerStatus)}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white"
              >
                <option value="" disabled>Chọn trạng thái</option>
                {validNextStatuses.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 text-amber-800 text-sm border border-amber-200 rounded-lg">
              Trạng thái "{statusLabels[customer.status]}" không thể chuyển đổi sang trạng thái khác.
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedStatus}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
