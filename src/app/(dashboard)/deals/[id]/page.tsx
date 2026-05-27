"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { useDeal } from "@/hooks/useDeals";
import { DealFormDialog } from "@/components/deals/dealFormDialog";

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: deal, isLoading } = useDeal(id);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <div className="py-10 text-center">Đang tải...</div>;
  if (!deal) return <div className="py-10 text-center text-red-500">Không tìm thấy deal.</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pipeline" className="rounded-lg p-2 hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{deal.title}</h1>
            <p className="text-sm text-gray-500">{deal.customerName}</p>
          </div>
        </div>
        <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm">
          <Pencil className="h-4 w-4" />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Info label="Stage" value={deal.stage} />
        <Info label="Owner" value={deal.ownerName} />
        <Info label="Value" value={new Intl.NumberFormat("vi-VN", { style: "currency", currency: deal.currency }).format(deal.value)} />
        <Info label="Probability" value={`${deal.probability}%`} />
        <Info label="Expected Close Date" value={deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString("vi-VN") : "-"} />
      </div>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold">Activity Timeline / Stage History</h2>
        <div className="space-y-2 text-sm">
          {deal.stageHistory.map((item, idx) => (
            <div key={`${item.changedAt}-${idx}`} className="rounded-lg bg-slate-50 p-2">
              <div className="font-medium">{item.stage}</div>
              <div className="text-xs text-gray-500">
                {new Date(item.changedAt).toLocaleString("vi-VN")} bởi {item.changedBy}
              </div>
            </div>
          ))}
          {deal.stageHistory.length === 0 && <p className="text-gray-500">Chưa có history.</p>}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold">Linked Contacts</h2>
        {deal.contacts.length ? (
          <ul className="list-disc pl-5 text-sm">
            {deal.contacts.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Không có contacts.</p>
        )}
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold">Quotations</h2>
        {deal.quotations.length ? (
          <ul className="list-disc pl-5 text-sm">
            {deal.quotations.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Không có quotations.</p>
        )}
      </section>

      <DealFormDialog open={editOpen} onOpenChange={setEditOpen} deal={deal} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

