import { apiClient } from "@/lib/api/client";
import { SALES_ENDPOINTS } from "@/lib/api/endpoints";
import type { Quotation, CreateQuotationRequest, UpdateQuotationRequest } from "@/models/quotationModel";

export class QuotationService {
  async list(dealId: string): Promise<Quotation[]> {
    const response = await apiClient.get<Quotation[]>(SALES_ENDPOINTS.QUOTATIONS(dealId));
    return response.data;
  }

  async detail(dealId: string, id: string): Promise<Quotation> {
    const response = await apiClient.get<Quotation>(SALES_ENDPOINTS.QUOTATION_DETAIL(dealId, id));
    return response.data;
  }

  async create(dealId: string, payload: CreateQuotationRequest): Promise<Quotation> {
    const response = await apiClient.post<Quotation>(SALES_ENDPOINTS.QUOTATIONS(dealId), payload);
    return response.data;
  }

  async update(dealId: string, id: string, payload: UpdateQuotationRequest): Promise<Quotation> {
    const response = await apiClient.put<Quotation>(SALES_ENDPOINTS.QUOTATION_DETAIL(dealId, id), payload);
    return response.data;
  }

  async delete(dealId: string, id: string): Promise<void> {
    await apiClient.delete(SALES_ENDPOINTS.QUOTATION_DETAIL(dealId, id));
  }
}
