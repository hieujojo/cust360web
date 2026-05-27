"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import type {
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
export function useUsers() {
  const { user } = useAuth();

  const result = useQuery({
    queryKey: ["users", "all"],
    queryFn: () => userService.getAllUsers(),
    enabled: !!user,
  });

  // Note: The new API returns User[] instead of UsersListResponse
  // To keep compatibility with existing components expecting items and total:
  return {
    ...result,
    data: result.data ? {
      items: result.data,
      total: result.data.length,
      page: 1,
      pageSize: result.data.length
    } : undefined
  };
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
