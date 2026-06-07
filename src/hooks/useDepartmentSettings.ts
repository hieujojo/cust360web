"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DepartmentService } from "@/services/departmentService";
import { useAuth } from "./useAuth";
import type { Department } from "@/models";

const departmentService = new DepartmentService();

export const departmentKeys = {
  all: ["departments"] as const,
};

export function useDepartmentList() {
  const { user } = useAuth();
  return useQuery({
    queryKey: departmentKeys.all,
    queryFn: () => departmentService.getAll(),
    enabled: !!user,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Department>) => departmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
      departmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
}
