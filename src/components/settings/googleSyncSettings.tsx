"use client";

import { Loader2, Mail, Calendar } from "lucide-react";
import { useGoogleConnect, useGoogleDisconnect, useGoogleStatus } from "@/hooks/useGoogle";
import { useToast } from "@/helper/toastHelper";

export function GoogleSyncSettings() {
  const { data: status, isLoading } = useGoogleStatus();
  const connect = useGoogleConnect();
  const disconnect = useGoogleDisconnect();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--crm-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-5">
      <div>
        <h2 className="text-[15px] font-semibold text-card-foreground">Gmail & Google Calendar</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Tự động đồng bộ email và lịch họp liên quan đến contact khách hàng vào timeline.
        </p>
      </div>

      {status?.connected ? (
        <div className="space-y-3">
          <p className="text-[13px] text-foreground">
            Đã kết nối: <span className="font-medium">{status.email}</span>
          </p>
          <div className="flex flex-wrap gap-2 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1">
              <Mail className="h-3.5 w-3.5" />
              Gmail {status.gmailSyncEnabled ? "bật" : "tắt"}
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1">
              <Calendar className="h-3.5 w-3.5" />
              Calendar {status.calendarSyncEnabled ? "bật" : "tắt"}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              disconnect.mutate(undefined, {
                onSuccess: () => toast({ title: "Đã ngắt kết nối Google" }),
                onError: () =>
                  toast({ title: "Không thể ngắt kết nối", variant: "destructive" }),
              })
            }
            disabled={disconnect.isPending}
            className="rounded-lg border border-red-200 px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-500/10 disabled:opacity-50"
          >
            {disconnect.isPending ? "Đang xử lý..." : "Ngắt kết nối"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            connect.mutate(undefined, {
              onError: () =>
                toast({
                  title: "Không thể bắt đầu kết nối",
                  description: "Kiểm tra cấu hình Google OAuth trên server.",
                  variant: "destructive",
                }),
            })
          }
          disabled={connect.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--crm-primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {connect.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Kết nối Gmail & Calendar
        </button>
      )}
    </div>
  );
}
