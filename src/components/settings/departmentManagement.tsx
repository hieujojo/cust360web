"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartmentList,
  useUpdateDepartment,
} from "@/hooks/useDepartmentSettings";
import { useUsers } from "@/hooks/useUsers";
import { useToast } from "@/helper/toastHelper";
import { extractErrorMessage } from "@/lib/api/client";
import type { Department } from "@/models";

export function DepartmentManagement() {
  const { toast } = useToast();
  const { data: departments = [], isLoading } = useDepartmentList();
  const { data: usersData } = useUsers();
  const users = usersData?.items ?? [];
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [managerId, setManagerId] = useState("");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setManagerId("");
    setDialogOpen(true);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    setName(dept.name);
    setDescription(dept.description ?? "");
    setManagerId(dept.managerId ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      if (editing) {
        const payload = {
          name: name.trim(),
          description: description.trim() || undefined,
          managerId: managerId || undefined,
        };
        await updateDept.mutateAsync({ id: editing.id, data: payload });
        toast({ title: "Đã cập nhật", description: "Phòng ban đã được lưu." });
      } else {
        const payload = {
          name: name.trim(),
          description: description.trim() || undefined,
        };
        await createDept.mutateAsync(payload);
        toast({ title: "Đã tạo", description: "Phòng ban mới đã được thêm." });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!confirm(`Xóa phòng ban "${dept.name}"?`)) return;

    try {
      await deleteDept.mutateAsync(dept.id);
      toast({ title: "Đã xóa", description: "Phòng ban đã được xóa." });
    } catch (error) {
      toast({
        title: "Không thể xóa",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--crm-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-medium text-card-foreground">Phòng ban</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Quản lý phòng ban và gán trưởng phòng.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm phòng ban
        </Button>
      </div>

      {departments.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-muted-foreground">Chưa có phòng ban nào.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-[13px]">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Tên</th>
                <th className="px-4 py-2.5 font-medium">Trưởng phòng</th>
                <th className="px-4 py-2.5 font-medium">Nhân viên</th>
                <th className="px-4 py-2.5 font-medium w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{dept.name}</div>
                    {dept.description && (
                      <div className="text-[12px] text-muted-foreground mt-0.5">{dept.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{dept.managerName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{dept.userCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(dept)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept)}
                        className="rounded p-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa phòng ban" : "Thêm phòng ban"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tên phòng ban</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Mô tả</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            {editing && (
              <div className="space-y-1.5">
                <Label>Trưởng phòng</Label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm"
                >
                  <option value="">— Chưa gán —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.displayName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={createDept.isPending || updateDept.isPending || !name.trim()}
            >
              {(createDept.isPending || updateDept.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
