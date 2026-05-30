  import { apiClient } from "@/lib/api/client";
  import { SALES_ENDPOINTS } from "@/lib/api/endpoints";
  import type {
    ChangeDealStageRequest,
    CreateDealRequest,
    Deal,
    DealListParams,
    PipelineStage,
    UpdateDealRequest,
    UpsertPipelineStageRequest,
  } from "@/models/dealModel";

  export class DealService {
    async list(params?: DealListParams): Promise<Deal[]> {
      const response = await apiClient.get<Deal[]>(SALES_ENDPOINTS.DEALS, { params });
      return response.data;
    }

    async detail(id: string): Promise<Deal> {
      const response = await apiClient.get<Deal>(SALES_ENDPOINTS.DEAL_DETAIL(id));
      return response.data;
    }

    async create(payload: CreateDealRequest): Promise<Deal> {
      const response = await apiClient.post<Deal>(SALES_ENDPOINTS.CREATE_DEAL, payload);
      return response.data;
    }

    async update(id: string, payload: UpdateDealRequest): Promise<Deal> {
      const response = await apiClient.put<Deal>(SALES_ENDPOINTS.UPDATE_DEAL(id), payload);
      return response.data;
    }

    async delete(id: string): Promise<void> {
      await apiClient.delete(SALES_ENDPOINTS.DELETE_DEAL(id));
    }

    async patchStage(id: string, payload: ChangeDealStageRequest): Promise<Deal> {
      const response = await apiClient.patch<Deal>(SALES_ENDPOINTS.PATCH_STAGE(id), payload);
      return response.data;
    }

    async getStats(): Promise<DealStats> {
      const response = await apiClient.get<DealStats>(SALES_ENDPOINTS.DEALS_STATS);
      return response.data;
    }

    async getPipelineStages(): Promise<PipelineStage[]> {
      const response = await apiClient.get<PipelineStage[]>(SALES_ENDPOINTS.PIPELINE_STAGES);
      return response.data;
    }

    async createPipelineStage(payload: UpsertPipelineStageRequest): Promise<PipelineStage[]> {
      const response = await apiClient.post<PipelineStage[]>(SALES_ENDPOINTS.PIPELINE_STAGES, payload);
      return response.data;
    }

    async updatePipelineStage(id: string, payload: UpsertPipelineStageRequest): Promise<PipelineStage[]> {
      const response = await apiClient.put<PipelineStage[]>(SALES_ENDPOINTS.PIPELINE_STAGE_DETAIL(id), payload);
      return response.data;
    }

    async deletePipelineStage(id: string): Promise<PipelineStage[]> {
      const response = await apiClient.delete<PipelineStage[]>(SALES_ENDPOINTS.PIPELINE_STAGE_DETAIL(id));
      return response.data;
    }

    async reorderPipelineStages(stageIds: string[]): Promise<PipelineStage[]> {
      const response = await apiClient.put<PipelineStage[]>(SALES_ENDPOINTS.PIPELINE_STAGE_REORDER, { stageIds });
      return response.data;
    }
  }

