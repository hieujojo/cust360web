"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Clock,
  User,
  FileText,
  MessageSquare,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { useDeal } from "@/hooks/useDeals";
import { DealFormDialog } from "@/components/deals/dealFormDialog";
import { useQuotations, useDeleteQuotation } from "@/hooks/useQuotations";
import { QuotationFormDialog } from "@/components/deals/quotationFormDialog";
import type { Quotation } from "@/models/quotationModel";
import { useCustomer360 } from "@/hooks/useCustomers";
import { TimelineTab } from "@/components/activities/timelineTab";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const vnd = (value: number, currency = "VND") =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(value);

const localDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("vi-VN") : "—";

const localDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("vi-VN") : "—";

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: deal, isLoading } = useDeal(id);
  const { data: customer360 } = useCustomer360(deal?.customerId ?? "");
  const contactMap = Object.fromEntries(
    (customer360?.tabs.contacts ?? []).map((c: any) => [c.id, c]),
  );
  const [editOpen, setEditOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);

  const { data: quotations = [], isLoading: loadingQuotes } = useQuotations(id);
  const deleteQuote = useDeleteQuotation(id);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-500">
        Đang tải...
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-red-500">
        Không tìm thấy deal.
      </div>
    );
  }

  // FIX 3 + Kanban parity: guard stageHistory
  const history = deal.stageHistory ?? [];

  // Days in current stage — reuse same logic as KanbanBoard
  const rawDate = history[0]?.changedAt ?? deal.updatedAt;
  const lastChangedAt = rawDate ? new Date(rawDate) : new Date();
  const daysInStage = differenceInCalendarDays(new Date(), lastChangedAt);
  const daysLabel = isNaN(daysInStage) ? "—" : `${daysInStage} ngày`;

  // Stuck threshold per stage — mirrors KanbanBoard default
  const STUCK_DEFAULTS: Record<string, number> = {
    Lead: 7,
    Qualified: 7,
    Proposal: 10,
    Negotiation: 14,
    Won: 999,
  };
  const threshold = STUCK_DEFAULTS[deal.stage] ?? 7;
  const isStuck =
    !isNaN(daysInStage) && daysInStage > threshold && deal.stage !== "Won";

  // FIX 4: Expected revenue
  const expectedRevenue = (deal.value ?? 0) * ((deal.probability ?? 0) / 100);

  return (
    <div className="space-y-5 pb-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/pipeline"
            className="rounded-lg p-2 text-gray-500 hover:bg-slate-100"
            aria-label="Quay lại Pipeline"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{deal.title}</h1>
              {isStuck && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  Stuck {daysLabel}
                </span>
              )}
            </div>
            {/* FIX: link tới customer detail */}
            <Link
              href={`/customers/${deal.customerId}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {deal.customerName}
            </Link>
          </div>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" />
          Chỉnh sửa
        </button>
      </div>

      {/* ── Stage progress bar ── */}
      <StageProgressBar currentStage={deal.stage} />

      {/* ── Key metrics grid ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Info label="Giai đoạn" value={deal.stage} />
        <Info label="Người phụ trách" value={deal.ownerName ?? "—"} />
        <Info
          label="Giá trị hợp đồng"
          value={vnd(deal.value ?? 0, deal.currency)}
        />
        {/* FIX 4: Expected revenue */}
        <Info
          label="Doanh thu kỳ vọng"
          value={vnd(expectedRevenue, deal.currency)}
          sub={`Xác suất ${deal.probability ?? 0}%`}
          highlight
        />
        <Info
          label="Ngày chốt dự kiến"
          value={localDate(deal.expectedCloseDate)}
        />
        <Info
          label="Thời gian ở stage"
          value={daysLabel}
          sub={isStuck ? "Quá ngưỡng cảnh báo" : undefined}
          danger={isStuck}
        />
      </div>

      {/* FIX 2: Notes section */}
      {(deal.notes ?? "").trim().length > 0 && (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Ghi chú
          </h2>
          <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
            {deal.notes}
          </p>
        </section>
      )}

      {/* ── Stage History ── */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Lịch sử giai đoạn
        </h2>

        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có lịch sử.</p>
        ) : (
          <ol className="relative border-l border-border pl-5 space-y-4">
            {history.map((item, idx) => (
              <li key={`${item.changedAt}-${idx}`} className="relative">
                {/* Timeline dot */}
                <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-card bg-blue-400 ring-1 ring-border" />
                <div className="rounded-lg bg-muted px-3 py-2">
                  <div className="text-sm font-medium text-foreground">
                    {item.stage}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {localDateTime(item.changedAt)}
                    {item.changedBy ? ` · ${item.changedBy}` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
          <User className="h-4 w-4 text-muted-foreground" />
          Contacts liên quan
        </h2>

        {!deal.contacts || deal.contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có contacts.</p>
        ) : (
          <ul className="divide-y divide-border">
            {deal.contacts.map((id: string) => {
              const c = contactMap[id];
              if (!c) return null;
              return (
                <li key={id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {c.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                  </div>
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      {c.email}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          Hoạt động (Activities)
        </h2>
        <TimelineTab customerId={deal.customerId} />
      </section>

      {/* ── Quotations ── */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Báo giá (Quotations)
          </h2>
          <button
            onClick={() => {
              setEditingQuote(null);
              setQuoteOpen(true);
            }}
            className="text-xs font-medium text-[var(--crm-primary)] hover:underline"
          >
            + Thêm báo giá
          </button>
        </div>

        {loadingQuotes ? (
          <p className="text-sm text-muted-foreground">Đang tải báo giá...</p>
        ) : quotations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có báo giá.</p>
        ) : (
          <ul className="divide-y divide-border">
            {quotations.map((q) => {
              let badgeColor = "bg-muted text-muted-foreground";
              if (q.status === "Sent") badgeColor = "bg-blue-500/15 text-blue-500";
              if (q.status === "Accepted") badgeColor = "bg-emerald-500/15 text-emerald-500";
              if (q.status === "Rejected") badgeColor = "bg-red-500/15 text-red-500";

              return (
                <li
                  key={q.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-mono text-sm font-medium text-foreground">
                      {q.code}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeColor}`}
                      >
                        {q.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {vnd(
                          q.items.reduce(
                            (sum, item) => sum + item.quantity * item.unitPrice,
                            0,
                          ),
                          q.currency,
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Phiên bản {q.version}
                      </span>
                      {q.validUntil && (
                        <span className="text-xs text-muted-foreground">
                          Hết hạn{" "}
                          {new Date(q.validUntil).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 text-muted-foreground">
                    <button
                      onClick={() => {
                        setEditingQuote(q);
                        setQuoteOpen(true);
                      }}
                      className="rounded p-1.5 hover:bg-muted hover:text-blue-500"
                      aria-label="Sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Bạn có chắc muốn xóa báo giá này?")) {
                          deleteQuote.mutate(q.id);
                        }
                      }}
                      className="rounded p-1.5 hover:bg-muted hover:text-red-500"
                      aria-label="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <DealFormDialog open={editOpen} onOpenChange={setEditOpen} deal={deal} />
      <QuotationFormDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        dealId={id}
        quotation={editingQuote}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// StageProgressBar
// ─────────────────────────────────────────────

const STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Won"];

function StageProgressBar({ currentStage }: { currentStage: string }) {
  const currentIdx = STAGES.indexOf(currentStage);

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-1">
        {STAGES.map((stage, idx) => {
          const isActive = idx === currentIdx;
          const isDone = idx < currentIdx;
          return (
            <div key={stage} className="flex flex-1 items-center gap-1">
              <div className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={[
                    "h-1.5 w-full rounded-full transition-colors",
                    isDone
                      ? "bg-blue-500"
                      : isActive
                        ? "bg-blue-400"
                        : "bg-muted",
                  ].join(" ")}
                />
                <span
                  className={[
                    "text-xs",
                    isActive
                      ? "font-semibold text-blue-500"
                      : isDone
                        ? "text-blue-400"
                        : "text-muted-foreground",
                  ].join(" ")}
                >
                  {stage}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <ChevronRight className="h-3 w-3 flex-shrink-0 text-muted-foreground/40" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Info card
// ─────────────────────────────────────────────

function Info({
  label,
  value,
  sub,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-4",
        highlight ? "border-blue-500/20 bg-blue-500/10" : "bg-card border-border",
        danger ? "border-red-500/20 bg-red-500/10" : "",
      ].join(" ")}
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={[
          "mt-1 text-sm font-semibold",
          highlight
            ? "text-blue-500"
            : danger
              ? "text-red-500"
              : "text-foreground",
        ].join(" ")}
      >
        {value}
      </p>
      {sub && (
        <p
          className={[
            "mt-0.5 text-xs",
            danger ? "text-red-400" : "text-muted-foreground",
          ].join(" ")}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
