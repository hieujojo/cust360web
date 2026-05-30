import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QuotationService } from "@/services/quotationService";
import type { CreateQuotationRequest, UpdateQuotationRequest } from "@/models/quotationModel";

const quotationService = new QuotationService();
export const quotationKeys = {
  all: (dealId: string) => ["deals", dealId, "quotations"] as const,
  detail: (dealId: string, id: string) => [...quotationKeys.all(dealId), id] as const,
};

export function useQuotations(dealId: string) {
  return useQuery({
    queryKey: quotationKeys.all(dealId),
    queryFn: () => quotationService.list(dealId),
    enabled: !!dealId,
  });
}

export function useCreateQuotation(dealId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQuotationRequest) => quotationService.create(dealId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all(dealId) });
      queryClient.invalidateQueries({ queryKey: ["deals", dealId] });
    },
  });
}

export function useUpdateQuotation(dealId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateQuotationRequest }) =>
      quotationService.update(dealId, id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all(dealId) });
      queryClient.invalidateQueries({ queryKey: quotationKeys.detail(dealId, variables.id) });
    },
  });
}

export function useDeleteQuotation(dealId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quotationService.delete(dealId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all(dealId) });
      queryClient.invalidateQueries({ queryKey: ["deals", dealId] });
    },
  });
}
