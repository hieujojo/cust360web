"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useChangeCustomerStatus } from "@/hooks/useCustomers";
import type { Customer, CustomerStatus } from "@/models/customerModel";
import { useToast } from "@/helper/toastHelper";
import { ContactFormDialog } from "./contactFormDialog";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

const statusTransitions: Record<CustomerStatus, CustomerStatus[]> = {
  Lead: ["Active", "Inactive", "Churned"],
  Active: ["Lead", "Inactive", "Churned"],
  Inactive: ["Lead", "Active", "Churned"],
  Churned: ["Lead", "Active", "Inactive"],
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
  const [contactOpen, setContactOpen] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Đổi trạng thái</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Khách hàng:</p>
            <p className="font-medium text-foreground">{customer.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Trạng thái hiện tại:</p>
            <span className="inline-flex px-2.5 py-1 text-xs font-medium border border-border rounded-full bg-muted text-foreground">
              {statusLabels[customer.status]}
            </span>
          </div>

          {validNextStatuses.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Trạng thái mới
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CustomerStatus)}
                className="w-full p-2 text-sm border border-border rounded-lg outline-none focus:border-[var(--crm-primary)] bg-background text-foreground"
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
            <p className="text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800 mt-4">
              Khách hàng ở trạng thái này không thể chuyển sang trạng thái khác.
            </p>
          )}

          <div className="pt-4 flex justify-between items-center border-t border-border mt-4">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="text-xs font-medium text-[var(--crm-primary)] hover:underline"
            >
              + Thêm người liên hệ
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedStatus || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--crm-primary)] rounded-lg hover:bg-[#14528F] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Đang lưu..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ContactFormDialog
        open={contactOpen}
        onOpenChange={setContactOpen}
        customerId={customer.id}
      />
    </div>
  );
}
