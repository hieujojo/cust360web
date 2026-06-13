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

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDeleteDialog({
  stageName,
  onConfirm,
  onCancel,
}: {
  stageName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-xl">
        <h2 className="mb-2 text-base font-semibold text-card-foreground">Xóa stage?</h2>
        <p className="mb-1 text-sm text-muted-foreground">
          Bạn đang xóa stage <span className="font-medium text-foreground">"{stageName}"</span>.
        </p>
        <p className="mb-5 text-sm text-red-500">
          Nếu stage đang có deals, vui lòng chuyển deals sang stage khác trước khi xóa.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
  const [newProbability, setNewProbability] = useState(0);
  const [newThreshold, setNewThreshold] = useState(7);
  const [localOrder, setLocalOrder] = useState<string[]>([]);

  // ── Confirm dialog state ──
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const ordered = useMemo(() => {
    const ids = localOrder.length ? localOrder : stages.map((s) => s.id);
    return ids.map((id) => stages.find((s) => s.id === id)).filter(Boolean) as typeof stages;
  }, [localOrder, stages]);

  if (!isAdmin(user))
    return (
      <div className="py-10 text-center text-gray-500">
        Chỉ admin mới được cấu hình pipeline stages.
      </div>
    );

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

  // ── Delete handlers ──
  const handleDeleteRequest = (id: string, name: string) => {
    setConfirmTarget({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmTarget) return;
    try {
      await deleteStage.mutateAsync(confirmTarget.id);
      toast({ title: "Đã xóa", description: `Stage "${confirmTarget.name}" đã được xóa.` });
    } catch (err: any) {
      // Server trả 400 → stage đang có deals
      const msg =
        err?.response?.data?.message ||
        "Không thể xóa. Stage này đang có deals — vui lòng chuyển deals sang stage khác trước.";
      toast({ title: "Không thể xóa stage", description: msg, variant: "destructive" });
    } finally {
      setConfirmTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Pipeline Stages</h1>

      {/* ── Add new stage ── */}
      <div className="flex items-end gap-2 rounded-xl border bg-card p-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">Tên stage</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-9 w-full rounded border border-border bg-background text-foreground px-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Màu</label>
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-9 rounded border border-border px-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Xác suất %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={newProbability}
            onChange={(e) => setNewProbability(Number(e.target.value))}
            className="h-9 w-20 rounded border border-border bg-background text-foreground px-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Stuck days</label>
          <input
            type="number"
            value={newThreshold}
            onChange={(e) => setNewThreshold(Number(e.target.value))}
            className="h-9 w-24 rounded border border-border bg-background text-foreground px-3 text-sm"
          />
        </div>
        <button
          onClick={async () => {
            await createStage.mutateAsync({
              name: newName,
              color: newColor,
              defaultProbability: newProbability,
              stuckThreshold: newThreshold,
            });
            setNewName("");
          }}
          className="inline-flex h-9 items-center gap-1 rounded bg-[var(--crm-primary)] px-3 text-sm text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Thêm
        </button>
      </div>

      {/* ── Stage list ── */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ordered.map((s) => s.id)} strategy={rectSortingStrategy}>
          <div className="space-y-2">
            {ordered.map((stage) => (
              <StageRow
                key={stage.id}
                stage={stage}
                onChange={async (payload) => updateStage.mutateAsync({ id: stage.id, payload })}
                onDeleteRequest={() => handleDeleteRequest(stage.id, stage.name)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* ── Confirm dialog ── */}
      {confirmTarget && (
        <ConfirmDeleteDialog
          stageName={confirmTarget.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Stage Row ────────────────────────────────────────────────────────────────
function StageRow({
  stage,
  onChange,
  onDeleteRequest,
}: {
  stage: { id: string; name: string; color: string; defaultProbability: number; stuckThreshold: number };
  onChange: (payload: {
    name: string;
    color: string;
    defaultProbability: number;
    stuckThreshold: number;
  }) => Promise<unknown>;
  onDeleteRequest: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stage.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
      <button {...attributes} {...listeners} className="rounded p-1 text-muted-foreground hover:bg-muted">
        <GripVertical className="h-4 w-4" />
      </button>
      <input
        defaultValue={stage.name}
        className="h-9 flex-1 rounded border border-border bg-background text-foreground px-3 text-sm"
        onBlur={(e) =>
          onChange({
            name: e.target.value,
            color: stage.color,
            defaultProbability: stage.defaultProbability,
            stuckThreshold: stage.stuckThreshold,
          })
        }
      />
      <input
        type="color"
        defaultValue={stage.color}
        className="h-9 rounded border border-border px-2"
        onBlur={(e) =>
          onChange({
            name: stage.name,
            color: e.currentTarget.value,
            defaultProbability: stage.defaultProbability,
            stuckThreshold: stage.stuckThreshold,
          })
        }
      />
      <input
        type="number"
        min={0}
        max={100}
        defaultValue={stage.defaultProbability}
        className="h-9 w-16 rounded border border-border bg-background text-foreground px-2 text-sm"
        title="Xác suất %"
        onBlur={(e) =>
          onChange({
            name: stage.name,
            color: stage.color,
            defaultProbability: Number(e.currentTarget.value),
            stuckThreshold: stage.stuckThreshold,
          })
        }
      />
      <input
        type="number"
        defaultValue={stage.stuckThreshold}
        className="h-9 w-24 rounded border border-border bg-background text-foreground px-3 text-sm"
        onBlur={(e) =>
          onChange({
            name: stage.name,
            color: stage.color,
            defaultProbability: stage.defaultProbability,
            stuckThreshold: Number(e.currentTarget.value),
          })
        }
      />
      <button onClick={onDeleteRequest} className="rounded p-2 text-red-400 hover:bg-red-500/10 hover:text-red-500">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}