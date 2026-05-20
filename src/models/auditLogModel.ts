export interface AuditLog {
  id: string;
  organizationId: string;
  actorId?: string;
  actorEmail: string;
  action: string;
  targetUserId?: string;
  targetUserEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, string>;
  createdAt: Date;
}

export const AuditActions = {
  UserCreated: "UserCreated",
  UserUpdated: "UserUpdated",
  UserActivated: "UserActivated",
  UserDeactivated: "UserDeactivated",
  UserLoggedIn: "UserLoggedIn",
  UserPasswordChanged: "UserPasswordChanged",
  UserPasswordReset: "UserPasswordReset",
} as const;

export type AuditAction =
  (typeof AuditActions)[keyof typeof AuditActions];
