"use client";

import { useState } from "react";
import { X, Loader2, RefreshCcw } from "lucide-react";
import { useRestoreCustomer } from "@/hooks/useCustomers";
import type { Customer } from "@/models/customerModel";
import { useToast } from "@/helper/toastHelper";

interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export function RestoreDialog({ open, onOpenChange, customer }: RestoreDialogProps) {
  const { toast } = useToast();
  const restoreMutation = useRestoreCustomer();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || !customer) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await restoreMutation.mutateAsync(customer.id);
      toast({
        title: "Thành công",
        description: `Đã khôi phục khách hàng ${customer.name}.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể khôi phục khách hàng.",
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
          <h2 className="text-lg font-semibold text-emerald-600 flex items-center">
            <RefreshCcw className="mr-2 h-5 w-5" />
            Xác nhận khôi phục
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn khôi phục khách hàng <span className="font-semibold text-slate-900">{customer.name}</span> từ thùng rác?
          </p>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Đang khôi phục..." : "Khôi phục"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
