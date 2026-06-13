"use client";

import Link from "next/link";
import type { Deal } from "@/models/dealModel";

interface DealListViewProps {
  deals: Deal[];
}

const stageConfig: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  Lead:        { label: "Lead",        bg: "#F1EFE8", color: "#444441", dot: "#888780" },
  Qualified:   { label: "Qualified",   bg: "#EAF3DE", color: "#3B6D11", dot: "#639922" },
  Proposal:    { label: "Proposal",    bg: "#E6F1FB", color: "#185FA5", dot: "#378ADD" },
  Negotiation: { label: "Negotiation", bg: "#FAEEDA", color: "#854F0B", dot: "#BA7517" },
  Won:         { label: "Won",         bg: "#E1F5EE", color: "#0F6E56", dot: "#1D9E75" },
};

export function DealListView({ deals }: DealListViewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-[13.5px]">
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "50%" }} />
          <col style={{ width: "26%" }} />
          <col style={{ width: "24%" }} />
        </colgroup>

        <thead>
          <tr className="border-b border-border bg-muted">
            {[
              { label: "Tiêu đề", align: "left" as const },
              { label: "Giai đoạn", align: "left" as const },
              { label: "", align: "right" as const },
            ].map(({ label, align }, i) => (
              <th
                key={i}
                className="px-3.5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                style={{ textAlign: align }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {deals.map((deal) => {
            const stage = stageConfig[deal.stage] ?? stageConfig["Qualified"];

            return (
              <tr
                key={deal.id}
                className="border-b border-border hover:bg-muted transition-colors"
              >
                {/* Title + subtitle */}
                <td className="px-3.5 py-[11px]">
                  <span
                    title={deal.title}
                    className="block overflow-hidden text-ellipsis whitespace-nowrap font-medium text-foreground"
                  >
                    {deal.title}
                  </span>
                  <span className="block text-[11.5px] text-muted-foreground mt-0.5">
                    {[deal.customerName, deal.ownerName].filter(Boolean).join(" · ")}
                  </span>
                </td>

                {/* Stage badge */}
                <td className="px-3.5 py-[11px]">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 9px",
                      borderRadius: 20,
                      fontSize: 11.5,
                      fontWeight: 500,
                      background: stage.bg,
                      color: stage.color,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: stage.dot,
                        flexShrink: 0,
                      }}
                    />
                    {stage.label}
                  </span>
                </td>

                {/* View detail button */}
                <td className="px-3.5 py-[11px] text-right">
                  <Link
                    href={`/deals/${deal.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#B5D4F4] bg-[#E6F1FB] px-2.5 py-1.5 text-[12px] font-medium text-[#185FA5] no-underline whitespace-nowrap hover:bg-[#D0E5F8] transition-colors"
                  >
                    Xem chi tiết
                  </Link>
                </td>
              </tr>
            );
          })}

          {deals.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                Không có deals.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}