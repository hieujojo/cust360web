"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { useState } from "react";
import type { Deal, PipelineStage } from "@/models/dealModel";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface KanbanBoardProps {
  deals: Deal[];
  stages: PipelineStage[];
  onChangeStage: (dealId: string, stage: string) => void;
}

// ─────────────────────────────────────────────
// KanbanBoard
// ─────────────────────────────────────────────

export function KanbanBoard({ deals, stages, onChangeStage }: KanbanBoardProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const byStage = stages.map((stage) => ({
    stage,
    items: deals.filter((d) => d.stage === stage.name),
  }));

  // FIX 1: DragStart — lưu deal đang kéo để render DragOverlay
  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal ?? null);
  };

  // FIX 1: DragEnd — tìm targetStage theo stage.id từ over.id (droppable column)
  // over.id ở đây là id của StageColumn (useDroppable), không phải deal.id
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDeal(null);
    const activeId = event.active.id as string;
    const overId = event.over?.id as string | undefined;
    if (!overId) return;

    // over có thể là stage.id (thả vào cột trống) hoặc deal.id (thả lên deal khác)
    // Cần tìm stage chứa deal đích, hoặc stage có id trùng overId
    const targetByStageId = stages.find((s) => s.id === overId);
    if (targetByStageId) {
      onChangeStage(activeId, targetByStageId.name);
      return;
    }

    // Nếu thả lên một deal khác → tìm stage của deal đó
    const targetDeal = deals.find((d) => d.id === overId);
    if (targetDeal) {
      const targetByDealStage = stages.find((s) => s.name === targetDeal.stage);
      if (targetByDealStage) {
        onChangeStage(activeId, targetByDealStage.name);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {byStage.map(({ stage, items }) => (
          <StageColumn key={stage.id} stage={stage} items={items} />
        ))}
      </div>

      {/* FIX 2 + 5: DragOverlay — preview deal đang kéo, tránh flicker */}
      <DragOverlay>
        {activeDeal ? (
          <DealCard deal={activeDeal} stage={stages.find((s) => s.name === activeDeal.stage)!} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ─────────────────────────────────────────────
// StageColumn — FIX 1 + 5: useDroppable + isOver highlight
// ─────────────────────────────────────────────

function StageColumn({ stage, items }: { stage: PipelineStage; items: Deal[] }) {
  // FIX 1: Đặt droppable id = stage.id để handleDragEnd nhận đúng
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setDropRef}
      className={[
        "rounded-xl border p-3 transition-colors duration-150",
        // FIX 5: visual feedback khi kéo qua cột
        isOver
          ? "border-blue-400 bg-blue-50 ring-2 ring-blue-300"
          : "bg-white",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium" style={{ color: stage.color }}>
          {stage.name}
        </h3>
        <span className="text-xs text-gray-500">{items.length}</span>
      </div>

      <SortableContext items={items.map((x) => x.id)} strategy={rectSortingStrategy}>
        <div className="min-h-20 space-y-2">
          {items.map((deal) => (
            <DealCard key={deal.id} deal={deal} stage={stage} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// ─────────────────────────────────────────────
// DealCard — FIX 2, 3, 4
// ─────────────────────────────────────────────

function DealCard({
  deal,
  stage,
  isOverlay = false,
}: {
  deal: Deal;
  stage: PipelineStage;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Ẩn card gốc khi đang kéo (DragOverlay sẽ thay thế)
    opacity: isDragging ? 0 : 1,
  };

  // FIX 3: Guard tránh Invalid Date → NaN ngày
  const rawDate = deal.stageHistory?.[0]?.changedAt ?? deal.updatedAt;
  const lastChangedAt = rawDate ? new Date(rawDate) : new Date();
  const daysInStage = differenceInCalendarDays(new Date(), lastChangedAt);
  const daysLabel = isNaN(daysInStage) ? "—" : `${daysInStage} ngày`;

  // FIX 4: Fallback threshold = 7 ngày nếu stage chưa config
  const threshold = stage.stuckThreshold ?? 7;
  const isStuck = !isNaN(daysInStage) && daysInStage > threshold;

  return (
    <div
      ref={setNodeRef}
      style={isOverlay ? undefined : style}
      className={[
        "rounded-lg border bg-slate-50 p-3 text-sm",
        isOverlay ? "rotate-1 shadow-lg cursor-grabbing opacity-95" : "cursor-grab active:cursor-grabbing",
      ].join(" ")}
      // FIX 2: attributes (aria) tetap di wrapper, tapi listeners TIDAK di sini
      {...attributes}
    >
      {/* FIX 2: Drag handle riêng — Link bebas diklik tanpa konflik dnd */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/deals/${deal.id}`}
          className="font-medium text-gray-900 hover:text-[var(--crm-primary)] leading-snug"
          // Hentikan propagasi agar drag listener di handle tidak ikut terpanggil
          onClick={(e) => e.stopPropagation()}
        >
          {deal.title}
        </Link>

        {/* Handle kéo — chỉ vùng này trigger drag */}
        <span
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing select-none flex-shrink-0 mt-0.5"
          aria-label="Kéo để di chuyển deal"
          title="Kéo để di chuyển"
        >
          ⠿
        </span>
      </div>

      <p className="mt-1 text-xs text-gray-500">
        {deal.customerName || "Chưa có khách hàng"}
      </p>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-semibold">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: deal.currency ?? "VND",
          }).format(deal.value ?? 0)}
        </span>
        <span className="text-xs text-gray-500">
          {deal.ownerName || "Chưa phân công"}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-gray-500">{daysLabel}</span>
        {isStuck && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-600 font-medium">
            Stuck
          </span>
        )}
      </div>
    </div>
  );
}