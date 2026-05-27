/**
 * Authentication and Authorization Utility Functions
 */

import { User, UserRole } from "@/models";

export interface DepartmentFilterParams {
  departmentId?: string;
  includeAllDepartments?: boolean;
}

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

export function hasRole(user: User | null, roles: UserRole[]): boolean {
  return user ? roles.includes(user.role) : false;
}

export function isOwner(user: User | null): boolean {
  return user?.role === UserRole.Owner;
}

export function isAdmin(user: User | null): boolean {
  return user?.role === UserRole.Owner || user?.role === UserRole.Admin;
}

export function canManageUsers(user: User | null): boolean {
  return isAdmin(user);
}

export function getDepartmentFilter(user: User): DepartmentFilterParams {
  if (user.role === UserRole.Owner || user.role === UserRole.Admin) {
    return { includeAllDepartments: true };
  }
  return { departmentId: user.departmentId };
}

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
    canAccessSettings: isOwnerRole,
  };
}

export function canDeleteCustomer(user: User | null): boolean {
  return isAdmin(user);
}

export function canChangeCustomerOwner(user: User | null): boolean {
  return isAdmin(user);
}

export function canRestoreCustomer(user: User | null): boolean {
  return isOwner(user);
}