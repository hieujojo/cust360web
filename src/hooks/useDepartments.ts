// hooks/useDepartments.ts
import { useMemo } from "react";
import { useDepartmentList } from "@/hooks/useDepartmentSettings";
import type { User } from "@/models";

export function useDepartments(items: User[] = [], departmentFilter: string = "", teamFilter: string = "") {
  const { data: departments = [], isLoading: loading } = useDepartmentList();

  const filteredItems = useMemo(() => {
    let result = items;
    if (departmentFilter) {
      result = result.filter((u) => u.departmentId === departmentFilter);
    }
    if (teamFilter) {
      result = result.filter((u) => u.teamId === teamFilter);
    }
    return result;
  }, [items, departmentFilter, teamFilter]);

  const activeCount = useMemo(() => filteredItems.filter((u) => u.isActive).length, [filteredItems]);
  const adminCount  = useMemo(() => filteredItems.filter((u) => u.role <= 2).length, [filteredItems]);

  return { departments, loading, filteredItems, activeCount, adminCount };
}