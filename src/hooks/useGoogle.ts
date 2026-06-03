"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GoogleService } from "@/services/googleService";
import { useAuth } from "./useAuth";

const service = new GoogleService();

export function useGoogleStatus() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["google", "status"],
    queryFn: () => service.getStatus(),
    enabled: !!user,
  });
}

export function useGoogleConnect() {
  return useMutation({
    mutationFn: () => service.getConnectUrl(),
    onSuccess: (url) => {
      window.location.href = url;
    },
  });
}

export function useGoogleDisconnect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => service.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google", "status"] });
    },
  });
}
