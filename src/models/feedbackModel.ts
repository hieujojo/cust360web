export type FeedbackType = "customer" | "internal";
export type FeedbackStatus = "open" | "in_progress" | "resolved" | "closed";
export type FeedbackCategory = "feature_request" | "improvement" | "complaint" | "praise" | "other";

export interface FeedbackReply {
  id: string;
  feedbackId: string;
  content: string;
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  createdAt: Date;
}

export interface Feedback {
  id: string;
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  content: string;
  status: FeedbackStatus;
  isAnonymous: boolean;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  customerId?: string;
  customerName?: string;
  replies: FeedbackReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeedbackRequest {
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  content: string;
  isAnonymous: boolean;
  customerId?: string;
}

export interface CreateReplyRequest {
  content: string;
  isAnonymous: boolean;
}
