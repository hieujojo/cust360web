"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import type { Deal, PipelineStage } from "@/models/dealModel";

interface KanbanBoardProps {
  deals: Deal[];
  stages: PipelineStage[];
  onChangeStage: (dealId: string, stage: string) => void;
}

export function KanbanBoard({ deals, stages, onChangeStage }: KanbanBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const byStage = stages.map((stage) => ({
    stage,
    items: deals.filter((d) => d.stage === stage.name),
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = event.active.id as string;
    const overId = event.over?.id as string | undefined;
    if (!overId) return;

    const targetStage = stages.find((s) => s.id === overId || s.name === overId);
    if (!targetStage) return;
    onChangeStage(activeId, targetStage.name);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {byStage.map(({ stage, items }) => (
          <div key={stage.id} id={stage.id} className="rounded-xl border bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium" style={{ color: stage.color }}>
                {stage.name}
              </h3>
              <span className="text-xs text-gray-500">{items.length}</span>
            </div>
            <SortableContext items={items.map((x) => x.id)} strategy={rectSortingStrategy}>
              <div className="space-y-2 min-h-20" id={stage.name}>
                {items.map((deal) => (
                  <DealCard key={deal.id} deal={deal} stage={stage} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}

function DealCard({ deal, stage }: { deal: Deal; stage: PipelineStage }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: deal.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const lastChangedAt = deal.stageHistory?.[0]?.changedAt ?? deal.updatedAt;
  const daysInStage = differenceInCalendarDays(new Date(), new Date(lastChangedAt));
  const isStuck = daysInStage > stage.stuckThreshold;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-lg border bg-slate-50 p-3 text-sm cursor-grab active:cursor-grabbing"
    >
      <Link href={`/deals/${deal.id}`} className="font-medium text-gray-900 hover:text-[var(--crm-primary)]">
        {deal.title}
      </Link>
      <p className="mt-1 text-xs text-gray-500">{deal.customerName || "Unknown customer"}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-semibold">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: deal.currency }).format(deal.value)}
        </span>
        <span className="text-xs text-gray-500">{deal.ownerName || "Unassigned"}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-gray-500">{daysInStage} ngày</span>
        {isStuck && <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-600">Stuck</span>}
      </div>
    </div>
  );
}

