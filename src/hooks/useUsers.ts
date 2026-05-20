"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import { getDepartmentFilter } from "@/helper/authHelper";
import type {
  UsersListParams,
  CreateUserRequest,
  UpdateUserRequest,
  ToggleUserStatusRequest,
  ResetPasswordRequest,
} from "@/models";

/**
 * React Query Hooks for User Management
 */

const userService = new UserService();

// Query: List users with automatic department scoping
export function useUsers(params: UsersListParams = {}) {
  const { user } = useAuth();

  // Apply department filter based on user role
  const departmentFilter = user ? getDepartmentFilter(user) : {};
  const scopedParams: UsersListParams = {
    ...params,
    // Only apply departmentId filter if not already specified and user is not admin
    departmentId:
      params.departmentId ??
      (departmentFilter.includeAllDepartments ? undefined : departmentFilter.departmentId),
  };

  const result = useQuery({
    queryKey: ["users", scopedParams],
    queryFn: () => userService.getUsers(scopedParams as Record<string, unknown>),
    enabled: !!user,
  });

  return result;
}

// Query: Get user by ID
export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
}

// Mutation: Create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserRequest) => userService.createUser(payload),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Mutation: Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRequest }) =>
      userService.updateUser(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate users list and specific user
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
}

// Mutation: Toggle user status
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ToggleUserStatusRequest;
    }) =>
      userService.toggleUserStatus(id, payload.isActive, payload.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Mutation: Reset password
export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ResetPasswordRequest;
    }) => userService.resetUserPassword(id, payload.newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
