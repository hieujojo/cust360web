"use client";

import { useState } from "react";
import { Plus, MessageSquare, Users, Building2 } from "lucide-react";
import { useFeedbacks } from "@/hooks/useFeedback";
import { FeedbackCard } from "@/components/feedback/feedbackCard";
import { CreateFeedbackDialog } from "@/components/feedback/createFeedbackDialog";
import type { FeedbackType } from "@/models/feedbackModel";

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState<FeedbackType>("customer");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: feedbacks = [], isLoading } = useFeedbacks(activeTab);

  const stats = {
    customer: feedbacks.filter((f) => f.type === "customer").length,
    internal: feedbacks.filter((f) => f.type === "internal").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium text-foreground">Góp ý & Phản hồi</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Tổng hợp và quản lý góp ý từ khách hàng và người dùng nội bộ
          </p>
        </div>
        <button
          data-tour="feedback-create"
          onClick={() => setCreateDialogOpen(true)}
          className="h-9 px-4 text-[13px] font-medium text-white bg-[var(--crm-primary)] rounded-lg hover:bg-[#14528F] transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tạo góp ý
        </button>
      </div>

      {/* Tabs */}
      <div data-tour="feedback-tabs" className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("customer")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "customer"
              ? "border-[var(--crm-primary)] text-[var(--crm-primary)]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Khách hàng
          {stats.customer > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
              {stats.customer}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("internal")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "internal"
              ? "border-[var(--crm-primary)] text-[var(--crm-primary)]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Nội bộ
          {stats.internal > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 text-xs font-medium">
              {stats.internal}
            </span>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="crm-stat-card">
          <p className="stat-label">Tổng góp ý</p>
          <p className="stat-value">{feedbacks.length}</p>
        </div>
        <div className="crm-stat-card">
          <p className="stat-label">Đang mở</p>
          <p className="stat-value text-blue-600 dark:text-blue-400">
            {feedbacks.filter((f) => f.status === "open").length}
          </p>
        </div>
        <div className="crm-stat-card">
          <p className="stat-label">Đang xử lý</p>
          <p className="stat-value text-yellow-600 dark:text-yellow-400">
            {feedbacks.filter((f) => f.status === "in_progress").length}
          </p>
        </div>
        <div className="crm-stat-card">
          <p className="stat-label">Đã giải quyết</p>
          <p className="stat-value text-green-600 dark:text-green-400">
            {feedbacks.filter((f) => f.status === "resolved").length}
          </p>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 bg-card rounded-xl border border-border">
            <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[var(--crm-primary)] border-t-transparent" />
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              Chưa có góp ý nào trong mục {activeTab === "customer" ? "Khách hàng" : "Nội bộ"}
            </p>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--crm-primary)] text-white text-sm font-medium hover:bg-[#14528F] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tạo góp ý đầu tiên
            </button>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))
        )}
      </div>

      {/* Create Dialog */}
      <CreateFeedbackDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        type={activeTab}
      />
    </div>
  );
}
