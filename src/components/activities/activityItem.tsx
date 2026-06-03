"use client";

import {
  Phone,
  Mail,
  Users,
  FileText,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Activity } from "@/models/activityModel";
import { useDeleteActivity } from "@/hooks/useActivities";
import { useToast } from "@/helper/toastHelper";

const TYPE_ICONS = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: FileText,
  system: Zap,
} as const;

function getBadge(activity: Activity): string | null {
  if (!activity.isAutoSync) return null;
  if (activity.source === "gmail") return "Auto · Gmail";
  if (activity.source === "calendar") return "Auto · Calendar";
  if (activity.source === "system") return "Auto";
  return "Auto";
}

function getTitle(activity: Activity): string {
  switch (activity.type) {
    case "call":
      return `Cuộc gọi — ${activity.outcome ?? ""}`;
    case "email":
      return activity.subject ?? "Email";
    case "meeting":
      return activity.summary ?? "Meeting";
    case "note":
      return "Ghi chú";
    case "system":
      return activity.summary ?? "Sự kiện hệ thống";
    default:
      return activity.type;
  }
}

function getBody(activity: Activity): string | null {
  switch (activity.type) {
    case "call":
      return [
        activity.durationMinutes != null ? `${activity.durationMinutes} phút` : null,
        activity.note,
      ]
        .filter(Boolean)
        .join(" · ") || null;
    case "email":
      return activity.summary ?? null;
    case "meeting":
      return [
        activity.location,
        activity.attendees?.length ? `Tham dự: ${activity.attendees.join(", ")}` : null,
        activity.nextSteps ? `Bước tiếp: ${activity.nextSteps}` : null,
      ]
        .filter(Boolean)
        .join(" · ") || null;
    case "note":
      return activity.body ?? null;
    case "system":
      return activity.summary ?? null;
    default:
      return null;
  }
}

interface ActivityItemProps {
  activity: Activity;
  compact?: boolean;
}

export function ActivityItem({ activity, compact }: ActivityItemProps) {
  const Icon = TYPE_ICONS[activity.type] ?? FileText;
  const badge = getBadge(activity);
  const body = getBody(activity);
  const deleteActivity = useDeleteActivity();
  const { toast } = useToast();
  const canDelete = activity.source === "manual";
  const timeLabel = format(new Date(activity.occurredAt), compact ? "HH:mm" : "HH:mm · dd/MM/yyyy", {
    locale: vi,
  });

  const handleDelete = () => {
    if (!confirm("Xóa hoạt động này?")) return;
    deleteActivity.mutate(activity.id, {
      onSuccess: () => toast({ title: "Đã xóa hoạt động" }),
      onError: () => toast({ title: "Không thể xóa", variant: "destructive" }),
    });
  };

  return (
    <div className="group flex gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--crm-primary-light)] text-[var(--crm-primary)]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[13px] font-medium text-gray-900">{getTitle(activity)}</p>
          {badge && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
              {badge}
            </span>
          )}
          {activity.type === "email" && activity.direction && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
              {activity.direction === "inbound" ? (
                <ArrowDownLeft className="h-3 w-3" />
              ) : (
                <ArrowUpRight className="h-3 w-3" />
              )}
              {activity.direction === "inbound" ? "Đến" : "Đi"}
            </span>
          )}
        </div>
        {body && (
          <p className="mt-0.5 text-[12px] text-gray-600 line-clamp-3">{body}</p>
        )}
        <p className="mt-1 text-[11px] text-gray-400">
          {activity.createdByName || "—"} · {timeLabel}
        </p>
      </div>
      {canDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteActivity.isPending}
          className="shrink-0 self-start rounded p-1.5 text-gray-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:opacity-50"
          aria-label="Xóa hoạt động"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
