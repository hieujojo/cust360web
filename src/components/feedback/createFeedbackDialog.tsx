"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateFeedback } from "@/hooks/useFeedback";
import { useToast } from "@/helper/toastHelper";
import type { FeedbackType, FeedbackCategory } from "@/models/feedbackModel";

interface CreateFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: FeedbackType;
}

const categories: { value: FeedbackCategory; label: string }[] = [
  { value: "feature_request", label: "Đề xuất tính năng" },
  { value: "improvement", label: "Cải tiến" },
  { value: "complaint", label: "Khiếu nại" },
  { value: "praise", label: "Khen ngợi" },
  { value: "other", label: "Khác" },
];

export function CreateFeedbackDialog({ open, onOpenChange, type }: CreateFeedbackDialogProps) {
  const { toast } = useToast();
  const createFeedback = useCreateFeedback();

  const [category, setCategory] = useState<FeedbackCategory>("feature_request");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (!open) {
      setCategory("feature_request");
      setTitle("");
      setContent("");
      setIsAnonymous(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ tiêu đề và nội dung",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFeedback.mutateAsync({
        type,
        category,
        title: title.trim(),
        content: content.trim(),
        isAnonymous,
      });

      toast({
        title: "Thành công",
        description: "Đã gửi góp ý của bạn",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi góp ý. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-card shadow-xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Tạo góp ý mới - {type === "customer" ? "Khách hàng" : "Nội bộ"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Loại góp ý *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
              className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crm-primary)]"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề ngắn gọn..."
              className="w-full rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crm-primary)]"
              maxLength={200}
            />
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {title.length}/200
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Nội dung *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả chi tiết góp ý của bạn..."
              className="w-full min-h-[150px] rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--crm-primary)]"
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {content.length}/2000
            </p>
          </div>

          {/* Anonymous */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="anonymous" className="text-sm text-foreground cursor-pointer">
              Gửi ẩn danh (tên của bạn sẽ không hiển thị)
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-border bg-card text-foreground hover:bg-muted px-4 py-2 text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createFeedback.isPending}
              className="inline-flex items-center gap-1 rounded-lg bg-[var(--crm-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[#14528F] disabled:opacity-50"
            >
              {createFeedback.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Gửi góp ý
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
