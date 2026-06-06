"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/hooks/useNotifications";
import { NotificationService } from "@/services/notificationService";

const notificationService = new NotificationService();

interface NotificationListProps {
  userId: string;
  notifications: NotificationItem[];
  loading: boolean;
  unreadCount: number;
  onClose?: () => void;
}

function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: vi });
}

export function NotificationList({
  userId,
  notifications,
  loading,
  unreadCount,
  onClose,
}: NotificationListProps) {
  const router = useRouter();
  const [marking, setMarking] = useState(false);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    setMarking(true);
    try {
      await notificationService.markAllRead(userId);
    } catch (error) {
      console.error("[NotificationList] markAllRead failed:", error);
    } finally {
      setMarking(false);
    }
  }, [userId]);

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.contextUrl) return;

    try {
      await notificationService.markAllRead(userId);
    } catch (error) {
      console.error("[NotificationList] markAllRead on item click failed:", error);
    }

    onClose?.();
    router.push(item.contextUrl);
  };

  return (
    <div className="flex w-[360px] flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--crm-border)] px-4 py-3">
        <div>
          <p className="text-[13px] font-medium text-gray-900">Thông báo</p>
          {unreadCount > 0 && (
            <p className="text-[11px] text-gray-500">{unreadCount} chưa đọc</p>
          )}
        </div>
        <button
          type="button"
          disabled={unreadCount === 0 || marking}
          onClick={markAllRead}
          className={cn(
            "shrink-0 text-[11px] font-medium text-[var(--crm-primary)] transition-opacity",
            (unreadCount === 0 || marking) && "cursor-not-allowed opacity-40"
          )}
        >
          {marking ? "Đang cập nhật..." : "Đánh dấu tất cả đã đọc"}
        </button>
      </div>

      <div className="max-h-[min(420px,70vh)] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
            <Bell className="h-8 w-8 text-gray-300" />
            <p className="text-[13px] text-gray-500">Chưa có thông báo</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--crm-border)]">
            {notifications.slice(0, 50).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                    !item.isRead && "bg-blue-50/60 hover:bg-blue-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-[13px] leading-snug text-gray-900",
                        !item.isRead && "font-medium"
                      )}
                    >
                      {item.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-gray-400">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-[12px] leading-snug text-gray-600 line-clamp-2">
                    {item.body}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
