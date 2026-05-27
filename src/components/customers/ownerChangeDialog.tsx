"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useChangeCustomerOwner } from "@/hooks/useCustomers";
import type { Customer } from "@/models/customerModel";
import type { User } from "@/models";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";
import { useToast } from "@/helper/toastHelper";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OwnerChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  users: User[];
}

export function OwnerChangeDialog({ open, onOpenChange, customer, users }: OwnerChangeDialogProps) {
  const { toast } = useToast();
  const changeOwnerMutation = useChangeCustomerOwner();
  const [selectedOwner, setSelectedOwner] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");

  const { departments, filteredItems } = useDepartments(
    users,
    departmentFilter === "all" ? "" : departmentFilter,
    teamFilter === "all" ? "" : teamFilter
  );
  const { teams } = useTeams(departmentFilter === "all" ? "" : departmentFilter);

  if (!customer) return null;

  const handleSubmit = async () => {
    if (!selectedOwner) return;

    setIsSubmitting(true);
    try {
      await changeOwnerMutation.mutateAsync({
        id: customer.id,
        payload: { newOwnerId: selectedOwner },
      });
      toast({
        title: "Thành công",
        description: "Đã phân công người phụ trách.",
      });
      onOpenChange(false);
      setSelectedOwner("");
      setDepartmentFilter("all");
      setTeamFilter("all");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể phân công.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSelectedOwner("");
      setDepartmentFilter("all");
      setTeamFilter("all");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Đổi người phụ trách</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm text-slate-500 mb-1">Khách hàng:</p>
            <p className="font-medium text-slate-900">{customer.name}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">Người phụ trách hiện tại:</p>
            <p className="font-medium text-slate-900">{customer.ownerName || "Chưa giao"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lọc theo phòng ban / team
            </label>
            <div className="flex gap-2 mb-4">
              <Select value={departmentFilter} onValueChange={(val) => { setDepartmentFilter(val); setTeamFilter("all"); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tất cả phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {departmentFilter !== "all" && (
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tất cả Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả Team</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Người phụ trách mới
            </label>
            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {filteredItems.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500 text-center">Không tìm thấy nhân viên nào</div>
                ) : (
                  filteredItems.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.displayName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <button
            onClick={() => handleOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedOwner}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Đang lưu..." : "Cập nhật"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
