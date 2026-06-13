"use client";

import { useEffect, useState } from "react";
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
import { useDepartmentList } from "@/hooks/useDepartmentSettings";
import {
  useTeamList,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
} from "@/hooks/useTeamSettings";
import { useUsers } from "@/hooks/useUsers";
import { useToast } from "@/helper/toastHelper";
import { extractErrorMessage } from "@/lib/api/client";
import type { Team } from "@/models";

export function TeamManagement() {
  const { toast } = useToast();
  const { data: departments = [], isLoading: loadingDepts } = useDepartmentList();
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const selectedDept = departments.find((d) => d.id === selectedDeptId) ?? null;

  useEffect(() => {
    if (departments.length > 0 && !selectedDeptId) {
      setSelectedDeptId(departments[0].id);
    }
  // Only run when departments array first populates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departments]);

  const { data: teams = [], isLoading: loadingTeams } = useTeamList(selectedDeptId);
  const { data: usersData } = useUsers();
  const users = usersData?.items ?? [];

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leadId, setLeadId] = useState("");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setLeadId("");
    setDialogOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditing(team);
    setName(team.name);
    setDescription(team.description ?? "");
    setLeadId(team.leadId ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !selectedDeptId) return;

    try {
      if (editing) {
        const payload = {
          departmentId: selectedDeptId,
          name: name.trim(),
          description: description.trim() || undefined,
          leadId: leadId || undefined,
          clearLead: !leadId,
        };
        await updateTeam.mutateAsync({ id: editing.id, data: payload as any });
        toast({ title: "Đã cập nhật", description: "Team đã được lưu." });
      } else {
        const payload = {
          name: name.trim(),
          description: description.trim() || undefined,
        };
        await createTeam.mutateAsync({ departmentId: selectedDeptId, data: payload });
        toast({ title: "Đã tạo", description: "Team mới đã được thêm." });
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

  const handleDelete = async (team: Team) => {
    if (!confirm(`Xóa team "${team.name}"?`)) return;

    try {
      await deleteTeam.mutateAsync({ id: team.id, departmentId: selectedDeptId });
      toast({ title: "Đã xóa", description: "Team đã được xóa." });
    } catch (error) {
      toast({
        title: "Không thể xóa",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  if (loadingDepts) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--crm-primary)]" />
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="space-y-4 rounded-xl border bg-card p-5">
        <p className="text-[13px] text-muted-foreground">
          Cần tạo ít nhất một phòng ban trước khi có thể quản lý Team.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-medium text-card-foreground">Team</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Quản lý nhóm và gán trưởng nhóm.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={selectedDeptId}
            onChange={(e) => {
              setSelectedDeptId(e.target.value);
              setDialogOpen(false); // reset khi đổi phòng ban
            }}
            className="flex h-9 rounded-md border border-input bg-background text-foreground px-3 text-sm"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={openCreate} disabled={!selectedDeptId}>
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm Team
          </Button>
        </div>
      </div>

      {loadingTeams ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : teams.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-muted-foreground">
          Chưa có team nào trong phòng ban này.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-[13px]">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Tên Team</th>
                <th className="px-4 py-2.5 font-medium">Trưởng nhóm</th>
                <th className="px-4 py-2.5 font-medium">Thành viên</th>
                <th className="px-4 py-2.5 font-medium w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{team.name}</div>
                    {team.description && (
                      <div className="text-[12px] text-muted-foreground mt-0.5">
                        {team.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{team.leadName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{team.memberCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(team)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(team)}
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
            <DialogTitle>
              {editing
                ? `Sửa Team: ${editing.name}`
                : `Thêm Team — ${selectedDept?.name ?? ""}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tên Team</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Mô tả</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {editing && (
              <div className="space-y-1.5">
                <Label>Trưởng nhóm</Label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm"
                >
                  <option value="">— Chưa gán —</option>
                  {users
                    .filter((u) => u.departmentId === selectedDeptId && u.teamId === editing.id)
                    .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.displayName} ({u.email})
                    </option>
                  ))}
                </select>
                <p className="text-[12px] text-muted-foreground">
                  Chỉ những nhân viên đã được gán vào team này mới có thể được chọn làm trưởng nhóm.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={createTeam.isPending || updateTeam.isPending || !name.trim()}
            >
              {(createTeam.isPending || updateTeam.isPending) && (
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
