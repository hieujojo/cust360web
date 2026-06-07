export interface Department {
  id: string;
  organizationId?: string;
  name: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  teamCount?: number;
  userCount?: number;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}
