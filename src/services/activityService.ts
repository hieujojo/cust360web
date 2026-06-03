import { apiClient } from "@/lib/api/client";
import { ACTIVITY_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Activity,
  ActivityListParams,
  ActivityListResponse,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "@/models/activityModel";

export class ActivityService {
  async list(params: ActivityListParams): Promise<ActivityListResponse> {
    const response = await apiClient.get<ActivityListResponse>(ACTIVITY_ENDPOINTS.LIST, {
      params,
    });
    return response.data;
  }

  async detail(id: string): Promise<Activity> {
    const response = await apiClient.get<Activity>(ACTIVITY_ENDPOINTS.DETAIL(id));
    return response.data;
  }

  async create(payload: CreateActivityRequest): Promise<Activity> {
    const response = await apiClient.post<Activity>(ACTIVITY_ENDPOINTS.CREATE, payload);
    return response.data;
  }

  async update(id: string, payload: UpdateActivityRequest): Promise<Activity> {
    const response = await apiClient.put<Activity>(ACTIVITY_ENDPOINTS.UPDATE(id), payload);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(ACTIVITY_ENDPOINTS.DELETE(id));
  }
}
