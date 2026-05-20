// ============================================
// AUTH ENDPOINTS
// ============================================
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
} as const;

// ============================================
// USER ENDPOINTS
// ============================================
export const USER_ENDPOINTS = {
  ME: "/users/me",
  CHANGE_PASSWORD: "/users/me/password",
} as const;

// ============================================
// ADMIN - USER MANAGEMENT ENDPOINTS
// ============================================
export const ADMIN_USER_ENDPOINTS = {
  LIST: "/admin/users",
  DETAIL: (id: string) => `/admin/users/${id}`,
  CREATE: "/admin/users",
  UPDATE: (id: string) => `/admin/users/${id}`,
  TOGGLE_STATUS: (id: string) => `/admin/users/${id}/status`,
  RESET_PASSWORD: (id: string) => `/admin/users/${id}/reset-password`,
} as const;

// ============================================
// AUDIT LOG ENDPOINTS
// ============================================
export const AUDIT_LOG_ENDPOINTS = {
  LIST: "/admin/audit-logs",
} as const;

// ============================================
// CUSTOMER ENDPOINTS (Phase 2)
// ============================================
export const CUSTOMER_ENDPOINTS = {
  LIST: "/customers",
  DETAIL: (id: string) => `/customers/${id}`,
  CREATE: "/customers",
  UPDATE: (id: string) => `/customers/${id}`,
  UPDATE_STATUS: (id: string) => `/customers/${id}/status`,
} as const;

// ============================================
// SALES ENDPOINTS (Phase 3)
// ============================================
export const SALES_ENDPOINTS = {
  DEALS: "/sales/deals",
  DEAL_DETAIL: (id: string) => `/sales/deals/${id}`,
  CREATE_DEAL: "/sales/deals",
  UPDATE_DEAL: (id: string) => `/sales/deals/${id}`,
  PIPELINE: "/sales/pipeline",
  PIPELINE_STAGES: "/sales/pipeline/stages",
} as const;

// ============================================
// DEPARTMENT ENDPOINTS (Phase 2)
// ============================================
export const DEPARTMENT_ENDPOINTS = {
  LIST: "/departments",
  DETAIL: (id: string) => `/departments/${id}`,
  CREATE: "/departments",
  UPDATE: (id: string) => `/departments/${id}`,
  DELETE: (id: string) => `/departments/${id}`,
} as const;

// ============================================
// TEAM ENDPOINTS (Phase 2)
// ============================================
export const TEAM_ENDPOINTS = {
  LIST: (departmentId: string) => `/departments/${departmentId}/teams`,
  DETAIL: (departmentId: string, id: string) =>
    `/departments/${departmentId}/teams/${id}`,
  CREATE: (departmentId: string) => `/departments/${departmentId}/teams`,
  UPDATE: (departmentId: string, id: string) =>
    `/departments/${departmentId}/teams/${id}`,
  DELETE: (departmentId: string, id: string) =>
    `/departments/${departmentId}/teams/${id}`,
} as const;



// ============================================
// NOTIFICATION ENDPOINTS (Phase 2)
// ============================================
export const NOTIFICATION_ENDPOINTS = {
  LIST: "/notifications",
  UNREAD_COUNT: "/notifications/unread-count",
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: "/notifications/mark-all-read",
} as const;

// ============================================
// SETTINGS ENDPOINTS (Phase 2)
// ============================================
export const SETTINGS_ENDPOINTS = {
  SYSTEM: "/settings/system",
  UPDATE_SYSTEM: "/settings/system",
  EMAIL: "/settings/email",
  UPDATE_EMAIL: "/settings/email",
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build query string from object params
 * @example buildQueryString({ page: 1, search: 'test' }) => '?page=1&search=test'
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Build full URL với query params
 * @example buildUrl('/users', { page: 1 }) => '/users?page=1'
 */
export function buildUrl(
  endpoint: string,
  params?: Record<string, any>
): string {
  if (!params) return endpoint;
  return `${endpoint}${buildQueryString(params)}`;
}

// ============================================
// TYPE EXPORTS
// ============================================

export type AuthEndpoint = typeof AUTH_ENDPOINTS[keyof typeof AUTH_ENDPOINTS];
export type UserEndpoint = typeof USER_ENDPOINTS[keyof typeof USER_ENDPOINTS];
export type AdminUserEndpoint = typeof ADMIN_USER_ENDPOINTS[keyof typeof ADMIN_USER_ENDPOINTS];
export type CustomerEndpoint = typeof CUSTOMER_ENDPOINTS[keyof typeof CUSTOMER_ENDPOINTS];
export type SalesEndpoint = typeof SALES_ENDPOINTS[keyof typeof SALES_ENDPOINTS];
export type DepartmentEndpoint = typeof DEPARTMENT_ENDPOINTS[keyof typeof DEPARTMENT_ENDPOINTS];
