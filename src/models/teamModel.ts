export interface Team {
  id: string;
  organizationId: string;
  departmentId: string;
  name: string;
  description?: string;
  leadId?: string;
  leadName?: string;
  memberCount?: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}
