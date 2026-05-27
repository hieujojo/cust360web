"use client";

import { useMemo, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/helper/authHelper";
import {
  useCreatePipelineStage,
  useDeletePipelineStage,
  usePipelineStages,
  useReorderPipelineStages,
  useUpdatePipelineStage,
} from "@/hooks/useDeals";
import { useToast } from "@/helper/toastHelper";

export default function PipelineSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: stages = [] } = usePipelineStages();
  const createStage = useCreatePipelineStage();
  const updateStage = useUpdatePipelineStage();
  const deleteStage = useDeletePipelineStage();
  const reorderStages = useReorderPipelineStages();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#2563eb");
  const [newThreshold, setNewThreshold] = useState(7);
  const [localOrder, setLocalOrder] = useState<string[]>([]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const ordered = useMemo(() => {
    const ids = localOrder.length ? localOrder : stages.map((s) => s.id);
    return ids.map((id) => stages.find((s) => s.id === id)).filter(Boolean) as typeof stages;
  }, [localOrder, stages]);

  if (!isAdmin(user)) return <div className="py-10 text-center text-gray-500">Chỉ admin mới được cấu hình pipeline stages.</div>;

  const onDragEnd = async (event: DragEndEvent) => {
    const overId = event.over?.id as string | undefined;
    if (!overId || event.active.id === overId) return;
    const oldIdx = ordered.findIndex((s) => s.id === event.active.id);
    const newIdx = ordered.findIndex((s) => s.id === overId);
    const next = arrayMove(ordered, oldIdx, newIdx).map((s) => s.id);
    setLocalOrder(next);
    try {
      await reorderStages.mutateAsync(next);
    } catch {
      toast({ title: "Lỗi", description: "Không thể reorder.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Pipeline Stages</h1>

      <div className="flex items-end gap-2 rounded-xl border bg-white p-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs">Tên stage</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-9 w-full rounded border px-3 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs">Màu</label>
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-9 rounded border px-2" />
        </div>
        <div>
          <label className="mb-1 block text-xs">Stuck days</label>
          <input
            type="number"
            value={newThreshold}
            onChange={(e) => setNewThreshold(Number(e.target.value))}
            className="h-9 w-24 rounded border px-3 text-sm"
          />
        </div>
        <button
          onClick={async () => {
            await createStage.mutateAsync({ name: newName, color: newColor, stuckThreshold: newThreshold });
            setNewName("");
          }}
          className="inline-flex h-9 items-center gap-1 rounded bg-[var(--crm-primary)] px-3 text-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Thêm
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ordered.map((s) => s.id)} strategy={rectSortingStrategy}>
          <div className="space-y-2">
            {ordered.map((stage) => (
              <StageRow
                key={stage.id}
                stage={stage}
                onChange={async (payload) => updateStage.mutateAsync({ id: stage.id, payload })}
                onDelete={async () => deleteStage.mutateAsync(stage.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function StageRow({
  stage,
  onChange,
  onDelete,
}: {
  stage: { id: string; name: string; color: string; stuckThreshold: number };
  onChange: (payload: { name: string; color: string; stuckThreshold: number }) => Promise<unknown>;
  onDelete: () => Promise<unknown>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stage.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-xl border bg-white p-3">
      <button {...attributes} {...listeners} className="rounded p-1 text-gray-400 hover:bg-slate-100">
        <GripVertical className="h-4 w-4" />
      </button>
      <input
        defaultValue={stage.name}
        className="h-9 flex-1 rounded border px-3 text-sm"
        onBlur={(e) => onChange({ name: e.target.value, color: stage.color, stuckThreshold: stage.stuckThreshold })}
      />
      <input
        type="color"
        defaultValue={stage.color}
        className="h-9 rounded border px-2"
        onBlur={(e) => onChange({ name: stage.name, color: e.currentTarget.value, stuckThreshold: stage.stuckThreshold })}
      />
      <input
        type="number"
        defaultValue={stage.stuckThreshold}
        className="h-9 w-24 rounded border px-3 text-sm"
        onBlur={(e) => onChange({ name: stage.name, color: stage.color, stuckThreshold: Number(e.currentTarget.value) })}
      />
      <button onClick={onDelete} className="rounded p-2 text-red-500 hover:bg-red-50">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

