// hooks/useDepartments.ts
import { useState, useEffect, useMemo } from "react";
import { DepartmentService } from "@/services/departmentService";
import { Department } from "@/models";
import type { User } from "@/models";

const departmentService = new DepartmentService();

export function useDepartments(items: User[] = [], departmentFilter: string = "", teamFilter: string = "") {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentService.getAll()
      .then(setDepartments)
      .finally(() => setLoading(false));
  }, []);

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
  const salesCount  = useMemo(() => filteredItems.filter((u) => u.role >= 3).length, [filteredItems]);

  return { departments, loading, filteredItems, activeCount, adminCount, salesCount };
}