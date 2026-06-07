export interface OrganizationProfile {
  id: string;
  organizationId: string;
  name: string;
  logoUrl?: string;
  timezone: string;
  currency: string;
  language: string;
}

export interface UpdateOrganizationProfileRequest {
  name: string;
  timezone: string;
  currency: string;
  language: string;
}
