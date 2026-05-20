export interface Department {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}
