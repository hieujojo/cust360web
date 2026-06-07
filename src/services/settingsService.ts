import { apiClient } from "@/lib/api/client";
import { SETTINGS_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  OrganizationProfile,
  UpdateOrganizationProfileRequest,
} from "@/models/organizationModel";

type OrganizationProfileDto = Partial<OrganizationProfile>;

function mapProfile(dto?: OrganizationProfileDto | null): OrganizationProfile {
  return {
    id: dto?.id ?? "",
    organizationId: dto?.organizationId ?? "",
    name: dto?.name ?? "",
    logoUrl: dto?.logoUrl,
    timezone: dto?.timezone ?? "Asia/Ho_Chi_Minh",
    currency: dto?.currency ?? "VND",
    language: dto?.language ?? "vi",
  };
}

export class SettingsService {
  async getOrganizationProfile(): Promise<OrganizationProfile> {
    const response = await apiClient.get<OrganizationProfileDto>(
      SETTINGS_ENDPOINTS.ORGANIZATION
    );
    return mapProfile(response.data);
  }

  async updateOrganizationProfile(
    payload: UpdateOrganizationProfileRequest
  ): Promise<OrganizationProfile> {
    const response = await apiClient.put<OrganizationProfileDto>(
      SETTINGS_ENDPOINTS.ORGANIZATION,
      payload
    );
    return mapProfile(response.data);
  }

  async uploadOrganizationLogo(file: File): Promise<OrganizationProfile> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<OrganizationProfileDto>(
      SETTINGS_ENDPOINTS.ORGANIZATION_LOGO,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return mapProfile(response.data);
  }
}
