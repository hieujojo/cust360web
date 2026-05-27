"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DealService } from "@/services/dealService";
import type {
  ChangeDealStageRequest,
  CreateDealRequest,
  DealListParams,
  UpdateDealRequest,
  UpsertPipelineStageRequest,
} from "@/models/dealModel";
import { useAuth } from "./useAuth";

const service = new DealService();

export function useDeals(params: DealListParams = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["deals", params],
    queryFn: () => service.list(params),
    enabled: !!user,
  });
}

export function useDeal(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["deals", "detail", id],
    queryFn: () => service.detail(id),
    enabled: !!user && !!id,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDealRequest) => service.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDealRequest }) => service.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "detail", variables.id] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function usePatchDealStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ChangeDealStageRequest }) => service.patchStage(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "detail", variables.id] });
    },
  });
}

export function usePipelineStages() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pipelineStages"],
    queryFn: () => service.getPipelineStages(),
    enabled: !!user,
    refetchInterval: 5000,
  });
}

export function useCreatePipelineStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertPipelineStageRequest) => service.createPipelineStage(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["pipelineStages"], data);
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertPipelineStageRequest }) =>
      service.updatePipelineStage(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["pipelineStages"], data);
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useDeletePipelineStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.deletePipelineStage(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["pipelineStages"], data);
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useReorderPipelineStages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stageIds: string[]) => service.reorderPipelineStages(stageIds),
    onSuccess: (data) => {
      queryClient.setQueryData(["pipelineStages"], data);
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

