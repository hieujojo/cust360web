import { apiClient } from "@/lib/api/client";
import { NOTIFICATION_ENDPOINTS } from "@/lib/api/endpoints";

export class NotificationService {
  async markAllRead(userId: string): Promise<void> {
    await apiClient.put(NOTIFICATION_ENDPOINTS.MARK_ALL_READ, { userId });
  }
}
