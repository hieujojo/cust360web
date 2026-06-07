"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamService } from "@/services";
import { useAuth } from "./useAuth";
import type { Team } from "@/models";

export const teamKeys = {
  all: ["teams"] as const,
  byDepartment: (departmentId: string) => ["teams", departmentId] as const,
};

export function useTeamList(departmentId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: teamKeys.byDepartment(departmentId),
    queryFn: () => teamService.getByDepartment(departmentId),
    enabled: !!user && !!departmentId,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ departmentId, data }: { departmentId: string; data: Partial<Team> }) => 
      teamService.create(departmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.byDepartment(variables.departmentId) });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Team> }) =>
      teamService.update(id, data),
    onSuccess: (_, variables) => {
      if (variables.data.departmentId) {
        queryClient.invalidateQueries({ queryKey: teamKeys.byDepartment(variables.data.departmentId) });
      }
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, departmentId }: { id: string; departmentId: string }) => 
      teamService.delete(id, departmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.byDepartment(variables.departmentId) });
    },
  });
}
