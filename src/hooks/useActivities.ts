"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ActivityService } from "@/services/activityService";
import type {
  ActivityListParams,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "@/models/activityModel";
import { useAuth } from "./useAuth";

const service = new ActivityService();

export const activityKeys = {
  all: ["activities"] as const,
  list: (params: ActivityListParams) => ["activities", "list", params] as const,
};

export function useActivities(params: ActivityListParams) {
  const { user } = useAuth();
  const enabled =
    !!user && (!!params.customerId || !!params.dealId);

  return useInfiniteQuery({
    queryKey: activityKeys.list(params),
    queryFn: ({ pageParam }) =>
      service.list({
        ...params,
        cursor: pageParam as string | undefined,
        limit: params.limit ?? 20,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined,
    enabled,
  });
}

function invalidateAllActivityLists(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({
    predicate: (query) =>
      Array.isArray(query.queryKey) &&
      query.queryKey[0] === "activities" &&
      query.queryKey[1] === "list",
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateActivityRequest) => service.create(payload),
    onSuccess: () => {
      invalidateAllActivityLists(queryClient);
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateActivityRequest }) =>
      service.update(id, payload),
    onSuccess: () => {
      invalidateAllActivityLists(queryClient);
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: () => {
      invalidateAllActivityLists(queryClient);
    },
  });
}
