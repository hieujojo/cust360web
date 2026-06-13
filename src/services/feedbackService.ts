import { apiClient } from "@/lib/api/client";
import type {
  Feedback,
  FeedbackReply,
  CreateFeedbackRequest,
  CreateReplyRequest,
} from "@/models/feedbackModel";

interface PagedFeedbackResponse {
  items: Feedback[];
  pagination: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export class FeedbackService {
  async getFeedbacks(type?: string): Promise<Feedback[]> {
    const params: any = {};
    if (type) params.type = type;

    const response = await apiClient.get<PagedFeedbackResponse>("/feedback", { params });
    
    return response.data.items.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      replies: item.replies.map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt),
      })),
    }));
  }

  async getFeedbackById(id: string): Promise<Feedback> {
    const response = await apiClient.get<Feedback>(`/feedback/${id}`);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      replies: response.data.replies.map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt),
      })),
    };
  }

  async createFeedback(data: CreateFeedbackRequest): Promise<Feedback> {
    const response = await apiClient.post<Feedback>("/feedback", data);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      replies: [],
    };
  }

  async addReply(feedbackId: string, data: CreateReplyRequest): Promise<void> {
    await apiClient.post(`/feedback/${feedbackId}/reply`, {
      content: data.content,
      isAnonymous: data.isAnonymous,
    });
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await apiClient.patch(`/feedback/${id}/status`, { status });
  }

  async deleteFeedback(id: string): Promise<void> {
    await apiClient.delete(`/feedback/${id}`);
  }
}
