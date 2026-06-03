"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X } from "lucide-react";
import { useCreateActivity } from "@/hooks/useActivities";
import type { ActivityType } from "@/models/activityModel";
import { useToast } from "@/helper/toastHelper";

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "call", label: "Cuộc gọi" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "note", label: "Ghi chú" },
];

const baseSchema = z.object({
  type: z.enum(["call", "email", "meeting", "note"]),
  occurredAt: z.string().optional(),
  outcome: z.string().optional(),
  durationMinutes: z.union([z.number().min(0), z.nan()]).optional(),
  note: z.string().optional(),
  subject: z.string().optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
  attendees: z.string().optional(),
  nextSteps: z.string().optional(),
  body: z.string().optional(),
});

type FormValues = z.infer<typeof baseSchema>;

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  dealId?: string;
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  customerId,
  dealId,
}: ActivityFormDialogProps) {
  const { toast } = useToast();
  const createActivity = useCreateActivity();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      type: "call",
      occurredAt: new Date().toISOString().slice(0, 16),
    },
  });

  const type = watch("type");

  useEffect(() => {
    if (!open) return;
    reset({
      type: "call",
      occurredAt: new Date().toISOString().slice(0, 16),
    });
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (values.type === "call" && !values.outcome?.trim()) {
        toast({ title: "Outcome là bắt buộc", variant: "destructive" });
        return;
      }
      if (values.type === "email" && !values.subject?.trim()) {
        toast({ title: "Subject là bắt buộc", variant: "destructive" });
        return;
      }
      if (values.type === "meeting" && !values.summary?.trim()) {
        toast({ title: "Summary là bắt buộc", variant: "destructive" });
        return;
      }
      if (values.type === "note" && !values.body?.trim()) {
        toast({ title: "Nội dung note là bắt buộc", variant: "destructive" });
        return;
      }

      await createActivity.mutateAsync({
        type: values.type,
        customerId,
        dealId,
        occurredAt: values.occurredAt
          ? new Date(values.occurredAt).toISOString()
          : undefined,
        outcome: values.outcome,
        durationMinutes: values.durationMinutes,
        note: values.note,
        subject: values.subject,
        summary: values.summary,
        location: values.location,
        attendees: values.attendees
          ? values.attendees.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        nextSteps: values.nextSteps,
        body: values.body,
      });

      toast({ title: "Đã ghi hoạt động" });
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "Không thể lưu",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    }
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-[15px] font-semibold text-gray-900">Ghi hoạt động</h2>
          <button type="button" onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <Field label="Loại">
            <select
              {...register("type")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px]"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Thời gian">
            <input
              type="datetime-local"
              {...register("occurredAt")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px]"
            />
          </Field>

          {type === "call" && (
            <>
              <Field label="Kết quả *">
                <input
                  {...register("outcome")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px]"
                  placeholder="VD: Đã liên hệ, không nghe máy..."
                />
              </Field>
              <Field label="Thời lượng (phút)">
                <input
                  type="number"
                  min={0}
                  {...register("durationMinutes", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px]"
                />
              </Field>
              <Field label="Ghi chú">
                <textarea
                  {...register("note")}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px]"
                />
              </Field>
            </>
          )}

          {type === "email" && (
            <>
              <Field label="Tiêu đề *">
                <input
                  {...register("subject")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px]"
                />
              </Field>
              <Field label="Tóm tắt">
                <textarea
                  {...register("summary")}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px]"
                />
              </Field>
            </>
          )}

          {type === "meeting" && (
            <>
              <Field label="Địa điểm">
                <input
                  {...register("location")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px]"
                />
              </Field>
              <Field label="Người tham dự (phân cách bằng dấu phẩy)">
                <input
                  {...register("attendees")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px]"
                />
              </Field>
              <Field label="Tóm tắt *">
                <textarea
                  {...register("summary")}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px]"
                />
              </Field>
              <Field label="Bước tiếp theo">
                <textarea
                  {...register("nextSteps")}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px]"
                />
              </Field>
            </>
          )}

          {type === "note" && (
            <Field label="Nội dung *">
              <textarea
                {...register("body")}
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px]"
              />
            </Field>
          )}

          {errors.type && (
            <p className="text-[12px] text-red-500">{errors.type.message}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createActivity.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--crm-primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {createActivity.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}
