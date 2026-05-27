export enum UserRole {
  Owner = 1,
  Admin = 2,
  User = 3,
}

// ─── User ─────────────────────────────────────────────────────────────────────

/**
 * Ánh xạ 1-1 với UserResponse từ server.
 * Server trả `status` ("Active"|"Inactive") thay vì `isActive` boolean.
 * isActive được map lại trong mapUser() ở userService.
 */
export interface User {
  id: string;
  organizationId: string;
  employeeCode: string;
  email: string;
  displayName: string;
  role: UserRole;
  roleName: string;
  departmentId?: string;
  departmentName?: string;
  teamId?: string;
  teamName?: string;
  isTeamLead: boolean;
  phone?: string;
  avatarUrl?: string;
  /** "Active" | "Inactive" — chuỗi từ server */
  status: string;
  /** Computed từ status === "Active" trong mapUser() */
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// ─── List Response ────────────────────────────────────────────────────────────

export interface UsersListResponse {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

/** GET /api/admin/users */
export interface UsersListParams {
  page?: number;
  pageSize?: number;
  role?: UserRole;
  search?: string;
  departmentId?: string;
  teamId?: string;
  isActive?: boolean;
  [key: string]: unknown; // index signature cho Record<string, unknown>
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

/** POST /api/admin/users */
export interface CreateUserRequest {
  email: string;
  displayName: string;
  role: UserRole;
  departmentId?: string;
  teamId?: string;
  password: string;
  phone?: string;
}

/** PUT /api/admin/users/{id} */
export interface UpdateUserRequest {
  displayName?: string;
  role?: UserRole;
  departmentId?: string;
  teamId?: string;
  phone?: string;
}

/** PUT /api/admin/users/{id}/status */
export interface ToggleUserStatusRequest {
  isActive: boolean;
  reason?: string;
}

/** PUT /api/admin/users/{id}/reset-password */
export interface ResetPasswordRequest {
  newPassword: string;
}
