"use client";

import { useState, useEffect } from "react";
import { Search, Download, LayoutList, LayoutGrid, X } from "lucide-react";
import { isAdmin } from "@/helper/authHelper";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";
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
  users: Array<{ id: string; displayName: string }>;
  showOwnerFilter: boolean;
}

export function CustomerFilters({
  onSearch,
  onStatusChange,
  onOwnerChange,
  onDepartmentChange,
  onTypeChange,
  users,
  showOwnerFilter,
}: CustomerFiltersProps) {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [type, setType] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const isAdminUser = isAdmin(currentUser ?? null);
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const { data, isLoading, error } = useUsers();
  const { departments, filteredItems, activeCount, adminCount, salesCount } = useDepartments(
    data?.items ?? [],
    departmentFilter,
    teamFilter
  );
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {/* Left — Search and Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm khách hàng..."
            className="h-8 pl-9 w-[200px] text-[13px] bg-white border-[var(--crm-border)] rounded-lg focus-visible:ring-1 focus-visible:ring-[var(--crm-primary)]"
          />
        </div>

        {/* Trạng thái */}
        <Select
          value={status}
          onValueChange={(val) => {
            const newValue = val === "all" ? "" : val;
            setStatus(newValue);
            onStatusChange(newValue);
          }}
        >
          <SelectTrigger className="h-8 w-[140px] text-[13px] bg-white border-[var(--crm-border)] rounded-lg">
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

        {/* Phụ trách */}
        {showOwnerFilter && (
          <Select
            value={ownerId}
            onValueChange={(val) => {
              const newValue = val === "all" ? "" : val;
              setOwnerId(newValue);
              onOwnerChange(newValue);
            }}
          >
            <SelectTrigger className="h-8 w-[160px] text-[13px] bg-white border-[var(--crm-border)] rounded-lg">
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

        {/* Phòng ban — TODO: map API if needed */}
        {isAdminUser && (
          <div className="flex items-center gap-2">
            <Select
              value={departmentFilter}
              onValueChange={(val) => {
                const newValue = val === "all" ? "" : val;
                setDepartmentFilter(newValue);
                if (onDepartmentChange) onDepartmentChange(newValue);
              }}
            >
              <SelectTrigger className="h-8 w-[160px] text-[13px] bg-white border-[var(--crm-border)] rounded-lg">
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

            {/* Team Filter */}
            {departmentFilter && (
              <Select
                value={teamFilter}
                onValueChange={(val) => setTeamFilter(val === "all" ? "" : val)}
              >
                <SelectTrigger className="h-8 w-[160px] text-[13px] bg-white border-[var(--crm-border)] rounded-lg">
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
        )}

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={handleClear}
            className="h-8 px-2 text-gray-400 hover:text-[var(--crm-danger)] hover:bg-red-50 rounded-lg transition-colors"
            title="Xoá bộ lọc"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Right — Export + View toggle */}
      <div className="flex items-center gap-2">
        {/* Export */}
        <button
          className="h-8 px-3 text-[13px] font-medium text-gray-600 bg-white border border-[var(--crm-border)] rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>

        {/* View toggle */}
        <div className="flex rounded-lg border border-[var(--crm-border)] overflow-hidden">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-[var(--crm-primary)] text-white" : "bg-white text-gray-400 hover:text-gray-600"}`}
            title="Danh sách"
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`p-1.5 transition-colors ${viewMode === "kanban" ? "bg-[var(--crm-primary)] text-white" : "bg-white text-gray-400 hover:text-gray-600"}`}
            title="Kanban"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
