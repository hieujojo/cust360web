export type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Rejected";

export interface QuotationItem {
  description: string;
  category?: string;
  quantity: number;
  unitPrice: number;
}

export interface Quotation {
  id: string;
  dealId: string;
  code: string;
  currency: string;
  status: QuotationStatus;
  notes?: string;
  items: QuotationItem[];
  version: number;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuotationRequest {
  currency: string;
  notes?: string;
  status?: QuotationStatus;
  items: QuotationItem[];
  validUntil?: Date;
}

export type UpdateQuotationRequest = Partial<CreateQuotationRequest>;
