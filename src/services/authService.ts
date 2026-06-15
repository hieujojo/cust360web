
  import { apiClient } from '@/lib/api/client';
  import { LoginRequest, LoginResponse, ForgotPasswordRequest, ResetPasswordByTokenRequest } from '@/models';
  import { AUTH_ENDPOINTS, USER_ENDPOINTS } from '@/lib/api/endpoints';

  // Storage keys
  const STORAGE_KEYS = {
    TOKEN: 'token',
    USER_ID: 'userId',
    COMPANY_ID: 'companyId',
    EMAIL: 'email',
    EMAIL_LOCAL: 'email_local',
  } as const;

  // Cookie options mặc định
  const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  export interface AuthData {
    token: string | null;
    userId: string | null;
    companyId: string | null;
    email: string | null;
  }

  export class AuthService {
    // ─── Login ────────────────────────────────────────────────────────────────

    static async login(credentials: LoginRequest): Promise<LoginResponse> {
      try {
        const response = await apiClient.post<LoginResponse>(
          AUTH_ENDPOINTS.LOGIN,
          credentials,
        );

        return response.data;
      } catch (error: any) {
        console.error('Login API Error:', error);
        throw error;
      }
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    static async logout(): Promise<void> {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT, {}).catch(() => {});
    }



    // ─── Password / Email reset ────────────────────────────────────────────────

    static async forgotPassword(
      email: string,
    ): Promise<void> {
      try {
        await apiClient.post<void>(
          '/auth/forgot-password',
          { email } satisfies ForgotPasswordRequest,
        );
      } catch (error: any) {
        console.error('Forgot Password API Error:', error);
        throw error;
      }
    }

    // ─── Reset password bằng token (chưa login) ───────────────────────────────

    static async resetPasswordByToken(
      token: string,
      newPassword: string,
    ): Promise<void> {
      try {
        await apiClient.post(
          '/auth/reset-password',
          { token, newPassword } satisfies ResetPasswordByTokenRequest,
        );
      } catch (error: any) {
        console.error('Reset Password API Error:', error);
        throw error;
      }
    }

    // ─── Change password khi đã login ─────────────────────────────────────────

    static async changePassword(
      currentPassword: string,
      newPassword: string,
    ): Promise<void> {
      try {
        await apiClient.put(
          USER_ENDPOINTS.CHANGE_PASSWORD,
          { currentPassword, newPassword },
        );
      } catch (error: any) {
        console.error('Change Password API Error:', error);
        throw error;
      }
    }

    // ─── Local email storage (Client-side only) ───────────────────────────────

    // Lưu ý: method này chỉ dùng được trong Client Components ('use client')

    static saveEmail(email: string): void {
      try {
        localStorage.setItem(STORAGE_KEYS.EMAIL_LOCAL, email);
      } catch (error) {
        // 
      }
    }

    static getEmail(): string | null {
      try {
        return localStorage.getItem(STORAGE_KEYS.EMAIL_LOCAL);
      } catch (error) {
        return null;
      }
    }
  }