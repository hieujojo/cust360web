"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationList } from "./notificationList";

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading } = useNotifications(
    user?.organizationId,
    user?.id
  );

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative rounded-lg p-1.5 transition-colors hover:bg-gray-100"
          aria-label="Thông báo"
        >
          <Bell className="h-[18px] w-[18px] text-gray-500" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1",
                "bg-[var(--crm-danger)] text-[10px] font-semibold leading-none text-white ring-2 ring-white"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[360px] overflow-hidden p-0"
      >
        <NotificationList
          userId={user.id}
          notifications={notifications}
          loading={loading}
          unreadCount={unreadCount}
          onClose={() => setOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
