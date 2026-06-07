"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SettingsService } from "@/services/settingsService";
import { useAuth } from "./useAuth";
import type { UpdateOrganizationProfileRequest } from "@/models/organizationModel";

const settingsService = new SettingsService();

export const organizationKeys = {
  profile: ["organization", "profile"] as const,
};

export function useOrganizationProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: organizationKeys.profile,
    queryFn: () => settingsService.getOrganizationProfile(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateOrganizationProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrganizationProfileRequest) =>
      settingsService.updateOrganizationProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(organizationKeys.profile, data);
    },
  });
}

export function useUploadOrganizationLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => settingsService.uploadOrganizationLogo(file),
    onSuccess: (data) => {
      queryClient.setQueryData(organizationKeys.profile, data);
    },
  });
}
