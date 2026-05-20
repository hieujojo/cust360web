import axios, { AxiosHeaders } from "axios";

import {
  API_BASE_URL,
  API_KEY,
  API_TIMEOUT,
} from "@/lib/api/constants";
import type { User } from "@/models";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_STORAGE_KEY = "user";
const AUTH_HEADER = "Authorization";
const COMPANY_HEADER = "x-company-id";
const CLIENT_HEADER = "x-client-id";
const API_KEY_HEADER = "x-api-key";

function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function getResponseMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const responseData = data as Record<string, unknown>;

  if (typeof responseData.errorMessage === "string") return responseData.errorMessage;
  if (typeof responseData.detail === "string") return responseData.detail;
  if (typeof responseData.title === "string") return responseData.title;
  if (typeof responseData.message === "string") return responseData.message;

  return undefined;
}

function getResponseErrorCode(data: unknown): string | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const responseData = data as Record<string, unknown>;
  return typeof responseData.errorCode === "string"
    ? responseData.errorCode
    : undefined;
}

function clearStoredAuthState() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  document.cookie = "accessToken=; path=/; max-age=0";
}

function shouldSkipAutoLogout(url?: string): boolean {
  return Boolean(url && url.includes("/auth/login"));
}

function setDefaultHeader(name: string, value?: string) {
  if (value) {
    apiClient.defaults.headers.common[name] = value;
    return;
  }

  delete apiClient.defaults.headers.common[name];
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    ...(API_KEY ? { [API_KEY_HEADER]: API_KEY } : {}),
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const headers = AxiosHeaders.from(config.headers ?? {});
    const token = getStoredToken();
    const user = getStoredUser();

    if (token && !headers.has(AUTH_HEADER)) {
      headers.set(AUTH_HEADER, `Bearer ${token}`);
    }

    if (user?.organizationId && !headers.has(COMPANY_HEADER)) {
      headers.set(COMPANY_HEADER, user.organizationId);
    }

    if (user?.id && !headers.has(CLIENT_HEADER)) {
      headers.set(CLIENT_HEADER, user.id);
    }

    if (API_KEY && !headers.has(API_KEY_HEADER)) {
      headers.set(API_KEY_HEADER, API_KEY);
    }

    config.headers = headers;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url;

    if (error.response) {
      const { status } = error.response;

      if (
        status === 401 &&
        !shouldSkipAutoLogout(requestUrl) &&
        typeof window !== "undefined"
      ) {
        clearStoredAuthState();
        clearApiHeaders();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export function initializeApiClient() {
  const token = getStoredToken();
  const user = getStoredUser();

  setDefaultHeader(AUTH_HEADER, token ? `Bearer ${token}` : undefined);
  setDefaultHeader(COMPANY_HEADER, user?.organizationId);
  setDefaultHeader(CLIENT_HEADER, user?.id);

  if (API_KEY) {
    setDefaultHeader(API_KEY_HEADER, API_KEY);
  }
}

export function setAuthToken(token: string) {
  setDefaultHeader(AUTH_HEADER, `Bearer ${token}`);
}

export function removeAuthToken() {
  clearApiHeaders();
}

export function clearApiHeaders() {
  delete apiClient.defaults.headers.common[AUTH_HEADER];
  delete apiClient.defaults.headers.common[COMPANY_HEADER];
  delete apiClient.defaults.headers.common[CLIENT_HEADER];
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "Yêu cầu hết thời gian chờ";
    }

    return getResponseMessage(error.response?.data) ||
      (error.message === "Network Error"
        ? "Không thể kết nối đến máy chủ"
        : error.message) ||
      "Đã xảy ra lỗi, vui lòng thử lại";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Đã xảy ra lỗi, vui lòng thử lại";
}

export default apiClient;
