"use client";

import { useQuery } from "@tanstack/react-query";
import { CustomerService } from "@/services/customerService";
import { DepartmentService } from "@/services/departmentService";
import { DealService } from "@/services/dealService";
import { UserService } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";
import { canManageUsers } from "@/helper/authHelper";

const customerService = new CustomerService();
const departmentService = new DepartmentService();
const dealService = new DealService();
const userService = new UserService();

export function useDashboardStats() {
  const { user } = useAuth();
  const isAdmin = canManageUsers(user ?? null);

  // Lấy tổng số khách hàng — chỉ cần pageSize=1 để lấy pagination.totalCount
  const customerQuery = useQuery({
    queryKey: ["dashboard", "customers-count"],
    queryFn: () => customerService.getCustomers({ page: 1, pageSize: 1 }),
    enabled: !!user,
    staleTime: 60_000, // 1 phút
  });

  // Lấy danh sách phòng ban → đếm length
  const departmentQuery = useQuery({
    queryKey: ["dashboard", "departments-count"],
    queryFn: () => departmentService.getAll(),
    enabled: !!user,
    staleTime: 60_000,
  });

  // Lấy danh sách users (chỉ Admin/Owner)
  const usersQuery = useQuery({
    queryKey: ["dashboard", "users-count"],
    queryFn: () => userService.getAllUsers(),
    enabled: !!user && isAdmin,
    staleTime: 60_000,
  });

  const dealStatsQuery = useQuery({
    queryKey: ["dashboard", "deal-stats"],
    queryFn: () => dealService.getStats(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const isLoading =
    customerQuery.isLoading ||
    departmentQuery.isLoading ||
    dealStatsQuery.isLoading ||
    (isAdmin && usersQuery.isLoading);

  return {
    customerCount: customerQuery.data?.pagination.totalCount ?? 0,
    departmentCount: departmentQuery.data?.length ?? 0,
    userCount: usersQuery.data?.length ?? 0,
    openDealsCount: dealStatsQuery.data?.openCount ?? 0,
    isLoading,
    isAdmin,
    isError:
      customerQuery.isError ||
      departmentQuery.isError,
  };
}
