import { apiClient } from "@/lib/api/client";
import { GOOGLE_ENDPOINTS } from "@/lib/api/endpoints";
import type { GoogleConnectionStatus } from "@/models/activityModel";

export class GoogleService {
  async getStatus(): Promise<GoogleConnectionStatus> {
    const response = await apiClient.get<GoogleConnectionStatus>(GOOGLE_ENDPOINTS.STATUS);
    return response.data;
  }

  async getConnectUrl(): Promise<string> {
    const response = await apiClient.get<{ url: string }>(GOOGLE_ENDPOINTS.CONNECT_URL);
    return response.data.url;
  }

  async disconnect(): Promise<void> {
    await apiClient.post(GOOGLE_ENDPOINTS.DISCONNECT);
  }
}
