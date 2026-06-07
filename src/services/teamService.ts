import { apiClient } from "@/lib/api/client";
import { TEAM_ENDPOINTS } from "@/lib/api/endpoints";
import { Team } from "@/models";

type TeamDto = Partial<Omit<Team, "createdAt" | "updatedAt">> & {
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

function toDate(value?: string | Date): Date {
  if (value instanceof Date) {
    return value;
  }

  return value ? new Date(value) : new Date(0);
}

function mapTeam(dto?: TeamDto | null): Team {
  return {
    id: dto?.id ?? "",
    organizationId: dto?.organizationId ?? "",
    departmentId: dto?.departmentId ?? "",
    name: dto?.name ?? "",
    description: dto?.description,
    leadId: dto?.leadId,
    leadName: (dto as any)?.leadName,
    memberCount: (dto as any)?.memberCount,
    isDeleted: dto?.isDeleted ?? false,
    createdAt: toDate(dto?.createdAt),
    updatedAt: toDate(dto?.updatedAt),
    createdBy: dto?.createdBy,
  };
}

function buildPayload(data: Partial<Team>) {
  return {
    name: data.name,
    description: data.description,
    leadId: data.leadId,
  };
}

export class TeamService {
  async create(departmentId: string, data: Partial<Team>): Promise<Team> {
    const response = await apiClient.post<TeamDto>(
      TEAM_ENDPOINTS.CREATE(departmentId),
      buildPayload(data)
    );

    return mapTeam(response.data);
  }

  async update(id: string, data: Partial<Team>): Promise<Team> {
    if (!data.departmentId) {
      throw new Error("departmentId is required to update a team.");
    }

    const response = await apiClient.put<TeamDto>(
      TEAM_ENDPOINTS.UPDATE(data.departmentId, id),
      buildPayload(data)
    );

    return mapTeam(response.data);
  }

  async delete(id: string, departmentId?: string): Promise<void> {
    if (!departmentId) {
      throw new Error("departmentId is required to delete a team.");
    }

    await apiClient.delete(TEAM_ENDPOINTS.DELETE(departmentId, id));
  }

  async getByDepartment(departmentId: string): Promise<Team[]> {
    const response = await apiClient.get<TeamDto[]>(
      TEAM_ENDPOINTS.LIST(departmentId)
    );

    return response.data.map((item) => mapTeam(item));
  }

  async getById(departmentId: string, id: string): Promise<Team | null> {
    try {
      const response = await apiClient.get<TeamDto>(
        TEAM_ENDPOINTS.DETAIL(departmentId, id)
      );

      return mapTeam(response.data);
    } catch (error) {
        return null;
      }
  }
}
