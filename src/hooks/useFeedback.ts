import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateFeedbackRequest, CreateReplyRequest, FeedbackType } from "@/models/feedbackModel";
import { FeedbackService } from "@/services/feedbackService";

const feedbackService = new FeedbackService();

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useFeedbacks(type?: FeedbackType) {
  return useQuery({
    queryKey: ["feedbacks", type],
    queryFn: () => feedbackService.getFeedbacks(type),
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeedbackRequest) => feedbackService.createFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedbackId, content, isAnonymous }: { feedbackId: string; content: string; isAnonymous: boolean }) => 
      feedbackService.addReply(feedbackId, { content, isAnonymous }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
}

export function useUpdateFeedbackStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      feedbackService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
}
