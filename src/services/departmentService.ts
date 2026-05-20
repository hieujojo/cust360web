import { apiClient } from "@/lib/api/client";
import { DEPARTMENT_ENDPOINTS } from "@/lib/api/endpoints";
import { Department } from "@/models";

type DepartmentDto = Partial<Omit<Department, "createdAt" | "updatedAt">> & {
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

function toDate(value?: string | Date): Date {
  if (value instanceof Date) {
    return value;
  }

  return value ? new Date(value) : new Date(0);
}

function mapDepartment(dto?: DepartmentDto | null): Department {
  return {
    id: dto?.id ?? "",
    organizationId: dto?.organizationId ?? "",
    name: dto?.name ?? "",
    description: dto?.description,
    isDeleted: dto?.isDeleted ?? false,
    createdAt: toDate(dto?.createdAt),
    updatedAt: toDate(dto?.updatedAt),
    createdBy: dto?.createdBy,
  };
}

function buildPayload(data: Partial<Department>) {
  return {
    name: data.name,
    description: data.description,
  };
}

export class DepartmentService {
  async create(data: Partial<Department>): Promise<Department> {
    const response = await apiClient.post<DepartmentDto>(
      DEPARTMENT_ENDPOINTS.CREATE,
      buildPayload(data)
    );

    return mapDepartment(response.data);
  }

  async update(id: string, data: Partial<Department>): Promise<Department> {
    const response = await apiClient.put<DepartmentDto>(
      DEPARTMENT_ENDPOINTS.UPDATE(id),
      buildPayload(data)
    );

    return mapDepartment(response.data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(DEPARTMENT_ENDPOINTS.DELETE(id));
  }

  async getAll(): Promise<Department[]> {
    const response = await apiClient.get<DepartmentDto[]>(
      DEPARTMENT_ENDPOINTS.LIST
    );

    return response.data.map((item) => mapDepartment(item));
  }

  async getById(id: string): Promise<Department | null> {
    try {
      const response = await apiClient.get<DepartmentDto>(
        DEPARTMENT_ENDPOINTS.DETAIL(id)
      );

      return mapDepartment(response.data);
    } catch (error) {
        return null;
    }
  }
}
