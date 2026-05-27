"use client";

import Link from "next/link";
import type { Deal } from "@/models/dealModel";

interface DealListViewProps {
  deals: Deal[];
}

export function DealListView({ deals }: DealListViewProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Stage</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Value</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id} className="border-b hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">
                <Link href={`/deals/${deal.id}`} className="hover:text-[var(--crm-primary)]">
                  {deal.title}
                </Link>
              </td>
              <td className="px-4 py-3">{deal.customerName}</td>
              <td className="px-4 py-3">{deal.stage}</td>
              <td className="px-4 py-3">{deal.ownerName}</td>
              <td className="px-4 py-3">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: deal.currency }).format(deal.value)}
              </td>
            </tr>
          ))}
          {deals.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                Không có deals.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

