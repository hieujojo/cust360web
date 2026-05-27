export interface DealStageHistory {
  stage: string;
  changedAt: string;
  changedBy: string;
}

export interface Deal {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  value: number;
  currency: string;
  expectedCloseDate?: string;
  ownerId: string;
  ownerName: string;
  stage: string;
  probability: number;
  notes?: string;
  stageHistory: DealStageHistory[];
  contacts: string[];
  quotations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DealListParams {
  stage?: string;
  owner?: string;
  sort?: string;
  search?: string;
}

export interface CreateDealRequest {
  title: string;
  customer: string;
  value: number;
  currency: string;
  expectedCloseDate?: string;
  owner?: string;
  stage: string;
  probability: number;
  notes?: string;
  contacts?: string[];
  quotations?: string[];
}

export type UpdateDealRequest = Partial<CreateDealRequest>;

export interface ChangeDealStageRequest {
  stage: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  stuckThreshold: number;
}

export interface UpsertPipelineStageRequest {
  name: string;
  color: string;
  stuckThreshold: number;
}

