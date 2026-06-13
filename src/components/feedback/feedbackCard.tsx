"use client";

import { useState } from "react";
import { MessageSquare, User, Calendar, Tag, ChevronDown, ChevronUp, Send } from "lucide-react";
import type { Feedback } from "@/models/feedbackModel";
import { useAuth } from "@/hooks/useAuth";
import { useCreateReply } from "@/hooks/useFeedback";

interface FeedbackCardProps {
  feedback: Feedback;
  onStatusChange?: (id: string, status: string) => void;
}

const categoryLabels: Record<string, string> = {
  feature_request: "Đề xuất tính năng",
  improvement: "Cải tiến",
  complaint: "Khiếu nại",
  praise: "Khen ngợi",
  other: "Khác",
};

const categoryColors: Record<string, string> = {
  feature_request: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
  improvement: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400",
  complaint: "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400",
  praise: "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400",
  other: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
};

const statusLabels: Record<string, string> = {
  open: "Mở",
  in_progress: "Đang xử lý",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
  in_progress: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400",
  resolved: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400",
  closed: "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
};

export function FeedbackCard({ feedback, onStatusChange }: FeedbackCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { user } = useAuth();
  const createReply = useCreateReply();

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      await createReply.mutateAsync({
        feedbackId: feedback.id,
        content: replyContent,
        isAnonymous,
      });
      setReplyContent("");
      setIsAnonymous(false);
    } catch (error) {
      console.error("Failed to create reply:", error);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[feedback.category]}`}>
                <Tag className="h-3 w-3" />
                {categoryLabels[feedback.category]}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[feedback.status]}`}>
                {statusLabels[feedback.status]}
              </span>
            </div>
            <h3 className="font-medium text-foreground mb-1">{feedback.title}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {feedback.authorName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(feedback.createdAt).toLocaleDateString("vi-VN")}
              </span>
              {feedback.replies.length > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {feedback.replies.length} trả lời
                </span>
              )}
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Content */}
          <div className="p-4 bg-muted/20">
            <p className="text-sm text-foreground whitespace-pre-wrap">{feedback.content}</p>
            {feedback.customerName && (
              <p className="mt-2 text-xs text-muted-foreground">
                Khách hàng: {feedback.customerName}
              </p>
            )}
          </div>

          {/* Replies */}
          {feedback.replies.length > 0 && (
            <div className="p-4 space-y-3 border-t border-border">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Trả lời ({feedback.replies.length})
              </h4>
              {feedback.replies.map((reply) => (
                <div key={reply.id} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{reply.authorName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(reply.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          <div className="p-4 border-t border-border">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Nhập trả lời..."
              className="w-full min-h-[80px] rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--crm-primary)]"
            />
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                Trả lời ẩn danh
              </label>
              <button
                onClick={handleReply}
                disabled={!replyContent.trim() || createReply.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--crm-primary)] text-white text-sm font-medium hover:bg-[#14528F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
                {createReply.isPending ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
