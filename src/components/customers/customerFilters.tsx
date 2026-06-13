"use client";

import { useState, useEffect } from "react";
import { Search, Download, LayoutList, LayoutGrid, X } from "lucide-react";
import { isAdmin } from "@/helper/authHelper";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";
import type { User } from "@/models/userModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface CustomerFiltersProps {
  onSearch: (searchTerm: string) => void;
  onStatusChange: (status: string) => void;
  onOwnerChange: (ownerId: string) => void;
  onDepartmentChange?: (departmentId: string) => void;
  onTypeChange?: (type: string) => void;
  users: User[];
  showOwnerFilter: boolean;
  onExport?: () => void;
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
}

export function CustomerFilters({
  onSearch,
  onStatusChange,
  onOwnerChange,
  onDepartmentChange,
  onTypeChange,
  users,
  showOwnerFilter,
  onExport,
  viewMode = "list",
  onViewModeChange,
}: CustomerFiltersProps) {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [type, setType] = useState("");
  const isAdminUser = isAdmin(currentUser ?? null);
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const { departments, filteredItems } = useDepartments(users, departmentFilter, teamFilter);
  const { teams } = useTeams(departmentFilter);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, onSearch]);

  const hasFilters = searchTerm || status || ownerId || type || departmentFilter || teamFilter;

  const handleClear = () => {
    setSearchTerm("");
    setStatus("");
    setOwnerId("");
    setType("");
    setDepartmentFilter("");
    setTeamFilter("");
    onStatusChange("");
    onOwnerChange("");
    onTypeChange?.("");
    if (onDepartmentChange) onDepartmentChange("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm khách hàng..."
              className="h-8 pl-9 w-full text-[13px] bg-background text-foreground border-border rounded-lg focus-visible:ring-1 focus-visible:ring-[var(--crm-primary)]"
            />
          </div>

          <Select
            value={status}
            onValueChange={(val) => {
              const newValue = val === "all" ? "" : val;
              setStatus(newValue);
              onStatusChange(newValue);
            }}
          >
            <SelectTrigger className="h-8 min-w-[140px] text-[13px] bg-background text-foreground border-border rounded-lg w-full sm:w-auto">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Lead">Tiềm năng</SelectItem>
              <SelectItem value="Active">Đang hoạt động</SelectItem>
              <SelectItem value="Inactive">Tạm ngưng</SelectItem>
              <SelectItem value="Churned">Đã rời bỏ</SelectItem>
            </SelectContent>
          </Select>

          {showOwnerFilter && (
            <Select
              value={ownerId}
              onValueChange={(val) => {
                const newValue = val === "all" ? "" : val;
                setOwnerId(newValue);
                onOwnerChange(newValue);
              }}
            >
              <SelectTrigger className="h-8 min-w-[150px] text-[13px] bg-background text-foreground border-border rounded-lg w-full sm:w-auto">
                <SelectValue placeholder="Người phụ trách" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phụ trách</SelectItem>
                {filteredItems.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {isAdminUser && (
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={departmentFilter}
                onValueChange={(val) => {
                  const newValue = val === "all" ? "" : val;
                  setDepartmentFilter(newValue);
                  if (onDepartmentChange) onDepartmentChange(newValue);
                }}
              >
                <SelectTrigger className="h-8 min-w-[150px] text-[13px] bg-background text-foreground border-border rounded-lg w-full sm:w-auto">
                  <SelectValue placeholder="Phòng ban" />
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

              {departmentFilter && (
                <Select
                  value={teamFilter}
                  onValueChange={(val) => setTeamFilter(val === "all" ? "" : val)}
                >
                  <SelectTrigger className="h-8 min-w-[150px] text-[13px] bg-background text-foreground border-border rounded-lg w-full sm:w-auto">
                    <SelectValue placeholder="Team" />
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
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          {hasFilters && (
            <button
              onClick={handleClear}
              className="h-8 px-2 text-muted-foreground hover:text-[var(--crm-danger)] hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              title="Xoá bộ lọc"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={onExport}
            className="h-8 px-3 text-[13px] font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>

          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => onViewModeChange?.("list")}
              className={`p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-[var(--crm-primary)] text-white"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
              title="Danh sách"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange?.("grid")}
              className={`p-1.5 transition-colors border-l border-border ${
                viewMode === "grid"
                  ? "bg-[var(--crm-primary)] text-white"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
              title="Lưới"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
