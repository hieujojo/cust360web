"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useDeals, usePatchDealStage, usePipelineStages } from "@/hooks/useDeals";
import { useToast } from "@/helper/toastHelper";
import { DealFormDialog } from "@/components/deals/dealFormDialog";
import { KanbanBoard } from "@/components/deals/kanbanBoard";
import { DealListView } from "@/components/deals/dealListView";

export default function PipelinePage() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [createOpen, setCreateOpen] = useState(false);
  const [stage, setStage] = useState("");
  const [owner, setOwner] = useState("");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: stages = [] } = usePipelineStages();
  const { data: deals = [], isLoading } = useDeals({
    stage: stage || undefined,
    owner: owner || undefined,
    search: search || undefined,
    sort: "updatedAt:desc",
  });
  const patchStage = usePatchDealStage();

  const ownerOptions = useMemo(
    () =>
      Array.from(new Set(deals.map((d) => JSON.stringify({ id: d.ownerId, name: d.ownerName })))).map((x) =>
        JSON.parse(x),
      ),
    [deals],
  );

  const handleChangeStage = async (dealId: string, nextStage: string) => {
    try {
      await patchStage.mutateAsync({ id: dealId, payload: { stage: nextStage } });
    } catch {
      toast({ title: "Lỗi", description: "Không thể chuyển stage.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Sales Pipeline</h1>
          <p className="text-sm text-gray-500">Kanban realtime và danh sách deal.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg bg-[var(--crm-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Tạo deal
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title/notes"
          className="h-9 rounded-lg border px-3 text-sm"
        />
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="h-9 rounded-lg border px-3 text-sm">
          <option value="">All stages</option>
          {stages.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <select value={owner} onChange={(e) => setOwner(e.target.value)} className="h-9 rounded-lg border px-3 text-sm">
          <option value="">All owners</option>
          {ownerOptions.map((o: { id: string; name: string }) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <div className="ml-auto flex rounded-lg border">
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-1.5 text-sm ${view === "kanban" ? "bg-[var(--crm-primary)] text-white" : ""}`}
          >
            Kanban
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-sm ${view === "list" ? "bg-[var(--crm-primary)] text-white" : ""}`}
          >
            Deal List
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-gray-500">Đang tải...</div>
      ) : view === "kanban" ? (
        <KanbanBoard deals={deals} stages={stages} onChangeStage={handleChangeStage} />
      ) : (
        <DealListView deals={deals} />
      )}

      <DealFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

