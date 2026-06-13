"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  useDeals,
  usePatchDealStage,
  usePipelineStages,
} from "@/hooks/useDeals";
import { useAuth } from "@/hooks/useAuth";
import { usePipelineSync } from "@/hooks/usePipelineSync";
import { useToast } from "@/helper/toastHelper";
import { DealFormDialog } from "@/components/deals/dealFormDialog";
import { KanbanBoard } from "@/components/deals/kanbanBoard";
import { DealListView } from "@/components/deals/dealListView";
import type { Deal } from "@/models/dealModel";

export default function PipelinePage() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [createOpen, setCreateOpen] = useState(false);
  const [stage, setStage] = useState("");
  const [owner, setOwner] = useState("");
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const { latestEvent } = usePipelineSync(user?.organizationId);

  const { data: stages = [] } = usePipelineStages();
  const { data: deals = [], isLoading } = useDeals({
    stage: stage || undefined,
    owner: owner || undefined,
    search: search || undefined,
    sort: "updatedAt:desc",
  });
  const patchStage = usePatchDealStage();
  const [kanbanDeals, setKanbanDeals] = useState<Deal[]>([]);

  useEffect(() => {
    setKanbanDeals(deals);
  }, [JSON.stringify(deals)]);

  useEffect(() => {
    if (!latestEvent?.dealId || !latestEvent.stage) return;

    setKanbanDeals((prev) =>
      prev.map((deal) => {
        if (deal.id !== latestEvent.dealId) return deal;
        if (deal.stage === latestEvent.stage) return deal;

        const changedAt = latestEvent.createdAt.toISOString();
        return {
          ...deal,
          stage: latestEvent.stage,
          updatedAt: changedAt,
          stageHistory: [
            {
              stage: latestEvent.stage,
              changedAt,
              changedBy: latestEvent.changedBy ?? "",
            },
            ...(deal.stageHistory ?? []),
          ],
        };
      }),
    );
  }, [latestEvent]);

  const ownerOptions = useMemo(
    () =>
      Array.from(
        new Set(
          deals.map((d) =>
            JSON.stringify({ id: d.ownerId, name: d.ownerName }),
          ),
        ),
      ).map((x) => JSON.parse(x)),
    [deals],
  );

  const handleChangeStage = async (dealId: string, nextStage: string) => {
    try {
      await patchStage.mutateAsync({
        id: dealId,
        payload: { stage: nextStage },
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể chuyển stage.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Kanban realtime và danh sách deal.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          data-tour="pipeline-create-btn"
          className="inline-flex items-center gap-1 rounded-lg bg-[var(--crm-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Tạo deal
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2" data-tour="pipeline-filters">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title/notes"
          className="h-9 rounded-lg border border-border bg-background text-foreground px-3 text-sm placeholder:text-muted-foreground"
        />
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="h-9 rounded-lg border border-border bg-background text-foreground px-3 text-sm"
        >
          <option value="">All stages</option>
          {stages.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="h-9 rounded-lg border border-border bg-background text-foreground px-3 text-sm"
        >
          <option value="">All owners</option>
          {ownerOptions.map((o: { id: string; name: string }) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <div className="ml-auto flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-1.5 text-sm transition-colors ${view === "kanban" ? "bg-[var(--crm-primary)] text-white" : "bg-background text-foreground hover:bg-muted"}`}
          >
            Kanban
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-sm transition-colors border-l border-border ${view === "list" ? "bg-[var(--crm-primary)] text-white" : "bg-background text-foreground hover:bg-muted"}`}
          >
            Deal List
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground">Đang tải...</div>
      ) : view === "kanban" ? (
        <KanbanBoard
          deals={kanbanDeals}
          stages={stages}
          onChangeStage={handleChangeStage}
        />
      ) : (
        <DealListView deals={deals} />
      )}

      <DealFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
