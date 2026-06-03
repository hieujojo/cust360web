/** Maps to C# ActivityResponse */

export type ActivityType = "call" | "email" | "meeting" | "note" | "system";
export type ActivitySource = "manual" | "system" | "gmail" | "calendar";

export interface Activity {
  id: string;
  customerId: string;
  dealId?: string | null;
  type: ActivityType;
  source: ActivitySource;
  isAutoSync: boolean;
  createdBy: string;
  createdByName: string;
  occurredAt: string;
  createdAt: string;

  outcome?: string | null;
  durationMinutes?: number | null;
  note?: string | null;
  subject?: string | null;
  summary?: string | null;
  direction?: string | null;
  location?: string | null;
  attendees: string[];
  nextSteps?: string | null;
  body?: string | null;
  systemEvent?: string | null;
  metadata?: Record<string, string> | null;
}

export interface ActivityListParams {
  customerId?: string;
  dealId?: string;
  cursor?: string;
  limit?: number;
}

export interface ActivityListResponse {
  items: Activity[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface CreateActivityRequest {
  type: ActivityType;
  customerId: string;
  dealId?: string;
  occurredAt?: string;

  outcome?: string;
  durationMinutes?: number;
  note?: string;

  subject?: string;
  summary?: string;

  location?: string;
  attendees?: string[];
  nextSteps?: string;

  body?: string;
}

export type UpdateActivityRequest = Partial<
  Omit<CreateActivityRequest, "type" | "customerId" | "dealId">
>;

export interface GoogleConnectionStatus {
  connected: boolean;
  email?: string;
  calendarSyncEnabled: boolean;
  gmailSyncEnabled: boolean;
}
