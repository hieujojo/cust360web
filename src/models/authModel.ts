import { User } from "./userModel";

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: User;
  firebaseToken: string;
}

// ─── Forgot / Reset Password ──────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordByTokenRequest {
  token: string;
  newPassword: string;
}

// ─── Change Password (chỉ dùng khi đã login) ─────────────────────────────────

/** PUT /api/users/me/password */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
