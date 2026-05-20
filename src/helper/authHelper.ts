/**
 * Authentication and Authorization Utility Functions
 * 
 * This module provides helper functions for role-based access control
 * and department-based data scoping.
 */

import { User, UserRole } from "@/models";

/**
 * Type for department filter parameters
 */
export interface DepartmentFilterParams {
  departmentId?: string;
  includeAllDepartments?: boolean;
}

/**
 * Type for role-based permissions
 */
export interface RolePermissions {
  canManageUsers: boolean;
  canAccessAllDepartments: boolean;
  canAccessSettings: boolean;
}

export function getRoleLabel(role?: UserRole): string {
  switch (role) {
    case UserRole.Owner:
      return "Owner";
    case UserRole.Admin:
      return "Admin";
    case UserRole.User:
    default:
      return "User";
  }
}

/**
 * Check if a user has any of the specified roles
 * 
 * @param user - The user to check (can be null for unauthenticated users)
 * @param roles - Array of roles to check against
 * @returns true if user has any of the specified roles, false otherwise
 * 
 * @example
 * ```typescript
 * const user = { role: UserRole.Admin, ... };
 * hasRole(user, [UserRole.Owner, UserRole.Admin]); // true
 * hasRole(user, [UserRole.SalesManager]); // false
 * hasRole(null, [UserRole.Admin]); // false
 * ```
 */
export function hasRole(user: User | null, roles: UserRole[]): boolean {
  return user ? roles.includes(user.role) : false;
}

/**
 * Check if a user is an Owner (highest privilege level)
 * 
 * @param user - The user to check (can be null for unauthenticated users)
 * @returns true if user is Owner, false otherwise
 * 
 * @example
 * ```typescript
 * const owner = { role: UserRole.Owner, ... };
 * isOwner(owner); // true
 * 
 * const admin = { role: UserRole.Admin, ... };
 * isOwner(admin); // false
 * ```
 */
export function isOwner(user: User | null): boolean {
  return user?.role === UserRole.Owner;
}

/**
 * Check if a user is an Admin (Owner or Admin role)
 * 
 * Owners are considered admins with full privileges.
 * 
 * @param user - The user to check (can be null for unauthenticated users)
 * @returns true if user is Owner or Admin, false otherwise
 * 
 * @example
 * ```typescript
 * const owner = { role: UserRole.Owner, ... };
 * isAdmin(owner); // true
 * 
 * const admin = { role: UserRole.Admin, ... };
 * isAdmin(admin); // true
 * 
 * const salesUser = { role: UserRole.SalesUser, ... };
 * isAdmin(salesUser); // false
 * ```
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === UserRole.Owner || user?.role === UserRole.Admin;
}

/**
 * Check if a user can manage other users
 * 
 * Only Owners and Admins can manage users (create, edit, delete, reset password).
 * 
 * @param user - The user to check (can be null for unauthenticated users)
 * @returns true if user can manage users, false otherwise
 * 
 * @example
 * ```typescript
 * const admin = { role: UserRole.Admin, ... };
 * canManageUsers(admin); // true
 * 
 * const salesManager = { role: UserRole.SalesManager, ... };
 * canManageUsers(salesManager); // false
 * ```
 */
export function canManageUsers(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Get department filter parameters based on user role
 * 
 * - Owners and Admins can see all departments (no filter applied)
 * - Regular users (SalesManager, SalesUser) can only see their own department
 * 
 * @param user - The user to get department filter for
 * @returns Department filter parameters for API queries
 * 
 * @example
 * ```typescript
 * const owner = { role: UserRole.Owner, departmentId: "dept-1", ... };
 * getDepartmentFilter(owner); 
 * // { includeAllDepartments: true }
 * 
 * const salesUser = { role: UserRole.SalesUser, departmentId: "dept-2", ... };
 * getDepartmentFilter(salesUser); 
 * // { departmentId: "dept-2" }
 * 
 * const userWithoutDept = { role: UserRole.SalesUser, departmentId: undefined, ... };
 * getDepartmentFilter(userWithoutDept); 
 * // { departmentId: undefined }
 * ```
 */
export function getDepartmentFilter(user: User): DepartmentFilterParams {
  // Owner and Admin can see all departments
  if (user.role === UserRole.Owner || user.role === UserRole.Admin) {
    return { includeAllDepartments: true };
  }

  // Regular users only see their department
  return { departmentId: user.departmentId };
}

/**
 * Get comprehensive role permissions for a user
 * 
 * Returns an object with all permission flags for the user's role.
 * Useful for complex permission checks in UI components.
 * 
 * @param user - The user to get permissions for (can be null for unauthenticated users)
 * @returns Object containing all permission flags
 * 
 * @example
 * ```typescript
 * const admin = { role: UserRole.Admin, ... };
 * const permissions = getRolePermissions(admin);
 * // {
 * //   canManageUsers: true,
 * //   canAccessAllDepartments: true,
 * //   canAccessSettings: false
 * // }
 * 
 * const salesUser = { role: UserRole.SalesUser, ... };
 * const permissions = getRolePermissions(salesUser);
 * // {
 * //   canManageUsers: false,
 * //   canAccessAllDepartments: false,
 * //   canAccessSettings: false
 * // }
 * ```
 */
export function getRolePermissions(user: User | null): RolePermissions {
  if (!user) {
    return {
      canManageUsers: false,
      canAccessAllDepartments: false,
      canAccessSettings: false,
    };
  }

  const isOwnerRole = user.role === UserRole.Owner;
  const isAdminRole = user.role === UserRole.Admin || isOwnerRole;

  return {
    canManageUsers: isAdminRole,
    canAccessAllDepartments: isAdminRole,
    canAccessSettings: isOwnerRole, // Only Owner can access settings
  };
}
