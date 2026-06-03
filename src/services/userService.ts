import { apiClient } from "@/lib/api/client";
import { ADMIN_USER_ENDPOINTS, USER_ENDPOINTS } from "@/lib/api/endpoints";
import { User, UserRole, UsersListResponse } from "@/models";

// ─── DTO types (ánh xạ raw JSON trả về từ server) ────────────────────────────

type UserDto = {
  id?: string;
  organizationId?: string;
  employeeCode?: string;
  email?: string;
  displayName?: string;
  role?: UserRole;
  roleName?: string;
  departmentId?: string;
  departmentName?: string;
  teamId?: string;
  teamName?: string;
  isTeamLead?: boolean;
  phone?: string;
  avatarUrl?: string;
  /** "Active" | "Inactive" — chuỗi từ server */
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: string;
};

interface UsersListResponseDto {
  items: UserDto[];
  /** Server PagedResult có thể trả totalCount hoặc total */
  totalCount?: number;
  total?: number;
  page?: number;
  pageSize?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDate(value?: string | Date): Date {
  if (value instanceof Date) return value;
  return value ? new Date(value) : new Date(0);
}

function mapUser(dto?: UserDto | null): User {
  const status = dto?.status ?? "Active";
  return {
    id:             dto?.id ?? "",
    organizationId: dto?.organizationId ?? "",
    employeeCode:   dto?.employeeCode ?? "",
    email:          dto?.email ?? "",
    displayName:    dto?.displayName ?? "",
    role:           dto?.role ?? UserRole.User,
    roleName:       dto?.roleName ?? "",
    departmentId:   dto?.departmentId,
    departmentName: dto?.departmentName,
    teamId:         dto?.teamId,
    teamName:       dto?.teamName,
    isTeamLead:     dto?.isTeamLead ?? false,
    phone:          dto?.phone,
    avatarUrl:      dto?.avatarUrl,
    status,
    isActive:       status === "Active",
    createdAt:      toDate(dto?.createdAt),
    updatedAt:      toDate(dto?.updatedAt),
    createdBy:      dto?.createdBy,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class UserService {
  async createUser(data: {
    email: string;
    displayName: string;
    role: UserRole;
    departmentId?: string;
    teamId?: string;
    password: string;
    phone?: string;
  }): Promise<User> {
    const response = await apiClient.post<UserDto>(
      ADMIN_USER_ENDPOINTS.CREATE,
      data
    );
    return mapUser(response.data);
  }

  async updateUser(id: string, data: {
    displayName?: string;
    role?: UserRole;
    departmentId?: string;
    teamId?: string;
    phone?: string;
  }): Promise<User> {
    const response = await apiClient.put<UserDto>(
      ADMIN_USER_ENDPOINTS.UPDATE(id),
      data
    );
    return mapUser(response.data);
  }

  async getUserById(id: string): Promise<User | null> {
    const response = await apiClient.get<UserDto>(
      ADMIN_USER_ENDPOINTS.DETAIL(id)
    );
    return mapUser(response.data);
  }

  async getUsers(filters?: Record<string, unknown>): Promise<UsersListResponse> {
    const response = await apiClient.get<UsersListResponseDto>(
      ADMIN_USER_ENDPOINTS.LIST,
      { params: filters }
    );

    const total = response.data.totalCount
      ?? response.data.total
      ?? response.data.items.length;

    return {
      items:    response.data.items.map((item) => mapUser(item)),
      total,
      page:     response.data.page ?? 1,
      pageSize: response.data.pageSize ?? 20,
    };
  }

  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<UserDto[]>(ADMIN_USER_ENDPOINTS.ALL);
    return response.data.map(mapUser);
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<UserDto>(USER_ENDPOINTS.ME);
    return mapUser(response.data);
  }

  async updateMyProfile(data: Partial<Pick<User, "displayName" | "phone" | "avatarUrl">>): Promise<User> {
    const response = await apiClient.put<UserDto>(USER_ENDPOINTS.ME, data);
    return mapUser(response.data);
  }

  /** PUT /api/admin/users/{id}/status */
  async toggleUserStatus(
    id: string,
    isActive: boolean,
    reason?: string
  ): Promise<void> {
    await apiClient.put(ADMIN_USER_ENDPOINTS.TOGGLE_STATUS(id), {
      isActive,
      reason,
    });
  }

  /** PUT /api/users/me/password — dùng currentPassword để khớp server */
  async changeMyPassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiClient.put(USER_ENDPOINTS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  }

  /** PUT /api/admin/users/{id}/reset-password */
  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    await apiClient.put(ADMIN_USER_ENDPOINTS.RESET_PASSWORD(id), {
      newPassword,
    });
  }
}
