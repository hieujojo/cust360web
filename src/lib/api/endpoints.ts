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
  UPLOAD_AVATAR: "/users/me/avatar",
  CHANGE_PASSWORD: "/users/me/password",
  DETAIL: (id: string) => `/users/${id}`,
} as const;

// ============================================
// SETTINGS - USER MANAGEMENT ENDPOINTS
// ============================================
export const SETTINGS_USER_ENDPOINTS = {
  LIST: "/settings/users",
  ALL: "/settings/users/all",
  DETAIL: (id: string) => `/settings/users/${id}`,
  CREATE: "/settings/users",
  UPDATE: (id: string) => `/settings/users/${id}`,
  TOGGLE_STATUS: (id: string) => `/settings/users/${id}/status`,
  RESET_PASSWORD: (id: string) => `/settings/users/${id}/reset-password`,
} as const;

/** @deprecated Use SETTINGS_USER_ENDPOINTS */
export const ADMIN_USER_ENDPOINTS = SETTINGS_USER_ENDPOINTS;

// ============================================
// AUDIT LOG ENDPOINTS
// ============================================
export const AUDIT_LOG_ENDPOINTS = {
  LIST: "/admin/audit-logs",
} as const;

// ============================================
// CUSTOMER ENDPOINTS
// ============================================
export const CUSTOMER_ENDPOINTS = {
  LIST: "/customers",
  SEARCH: "/customers/search",
  DETAIL_360: (id: string) => `/customers/${id}/360`,
  CREATE: "/customers",
  UPDATE: (id: string) => `/customers/${id}`,
  UPDATE_STATUS: (id: string) => `/customers/${id}/status`,
  UPDATE_OWNER: (id: string) => `/customers/${id}/owner`,
  DELETE: (id: string) => `/customers/${id}`,
  RESTORE: (id: string) => `/customers/${id}/restore`,
  
  // Contact endpoints
  ADD_CONTACT: (custId: string) => `/customers/${custId}/contacts`,
  UPDATE_CONTACT: (custId: string, contactId: string) => `/customers/${custId}/contacts/${contactId}`,
  DELETE_CONTACT: (custId: string, contactId: string) => `/customers/${custId}/contacts/${contactId}`,
  SET_PRIMARY_CONTACT: (custId: string, contactId: string) => `/customers/${custId}/contacts/${contactId}/primary`,
} as const;

// ============================================
// ACTIVITY ENDPOINTS (Module 4)
// ============================================
export const ACTIVITY_ENDPOINTS = {
  LIST: "/activities",
  DETAIL: (id: string) => `/activities/${id}`,
  CREATE: "/activities",
  UPDATE: (id: string) => `/activities/${id}`,
  DELETE: (id: string) => `/activities/${id}`,
} as const;

export const GOOGLE_ENDPOINTS = {
  CONNECT_URL: "/auth/google/connect-url",
  STATUS: "/auth/google/status",
  DISCONNECT: "/auth/google/disconnect",
} as const;

// ============================================
// SALES ENDPOINTS (Phase 3)
// ============================================
export const SALES_ENDPOINTS = {
  DEALS: "/deals",
  DEAL_DETAIL: (id: string) => `/deals/${id}`,
  CREATE_DEAL: "/deals",
  UPDATE_DEAL: (id: string) => `/deals/${id}`,
  DELETE_DEAL: (id: string) => `/deals/${id}`,
  PATCH_STAGE: (id: string) => `/deals/${id}/stage`,
  DEALS_STATS: "/deals/stats",
  PIPELINE_STAGES: "/settings/pipeline-stages",
  PIPELINE_STAGE_DETAIL: (id: string) => `/settings/pipeline-stages/${id}`,
  PIPELINE_STAGE_REORDER: "/settings/pipeline-stages/reorder",
  QUOTATIONS: (dealId: string) => `/deals/${dealId}/quotations`,
  QUOTATION_DETAIL: (dealId: string, id: string) => `/deals/${dealId}/quotations/${id}`,
} as const;

// ============================================
// DEPARTMENT ENDPOINTS (Phase 2)
// ============================================
export const DEPARTMENT_ENDPOINTS = {
  LIST: "/settings/departments",
  DETAIL: (id: string) => `/settings/departments/${id}`,
  CREATE: "/settings/departments",
  UPDATE: (id: string) => `/settings/departments/${id}`,
  DELETE: (id: string) => `/settings/departments/${id}`,
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
  ORGANIZATION: "/settings/organization",
  ORGANIZATION_LOGO: "/settings/organization/logo",
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
