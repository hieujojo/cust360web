"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ActivityFeed } from "./activityFeed";
import { ActivityFormDialog } from "./activityFormDialog";

interface TimelineTabProps {
  customerId: string;
  dealId?: string;
  compact?: boolean;
}

export function TimelineTab({ customerId, dealId, compact }: TimelineTabProps) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex shrink-0 justify-end">
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--crm-primary)] px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Ghi hoạt động
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <ActivityFeed customerId={customerId} dealId={dealId} compact={compact} />
      </div>

      <ActivityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customerId={customerId}
        dealId={dealId}
      />
    </div>
  );
}
