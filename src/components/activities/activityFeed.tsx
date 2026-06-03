"use client";

import { useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import type { Activity } from "@/models/activityModel";
import { ActivityItem } from "./activityItem";

function groupLabel(date: Date): string {
  if (isToday(date)) return "Hôm nay";
  if (isYesterday(date)) return "Hôm qua";
  return format(date, "EEEE, dd MMMM yyyy", { locale: vi });
}

function groupByDate(activities: Activity[]): { label: string; items: Activity[] }[] {
  const map = new Map<string, Activity[]>();
  for (const a of activities) {
    const d = new Date(a.occurredAt);
    const key = format(d, "yyyy-MM-dd");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return Array.from(map.entries()).map(([key, items]) => ({
    label: groupLabel(new Date(key)),
    items,
  }));
}

interface ActivityFeedProps {
  customerId: string;
  dealId?: string;
  compact?: boolean;
}

export function ActivityFeed({ customerId, dealId, compact }: ActivityFeedProps) {
  const params = useMemo(() => {
    const p: { customerId: string; dealId?: string; limit: number } = {
      customerId,
      limit: 20,
    };
    if (dealId) p.dealId = dealId;
    return p;
  }, [customerId, dealId]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useActivities(params);

  const activities = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  const groups = useMemo(() => groupByDate(activities), [activities]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--crm-primary)]" />
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-[13px] text-gray-500">Chưa có hoạt động nào</p>
        <p className="mt-1 text-[12px] text-gray-400">Ghi nhận cuộc gọi, email, meeting hoặc note</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="sticky top-0 z-10 bg-white py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {group.label}
          </p>
          <div className="divide-y divide-[var(--crm-border)]">
            {group.items.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} compact={compact} />
            ))}
          </div>
        </div>
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-[12px] font-medium text-[var(--crm-primary)] hover:underline disabled:opacity-50"
          >
            {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
          </button>
        </div>
      )}
    </div>
  );
}
