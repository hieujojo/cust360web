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
    <div
      style={{
        overflow: "hidden",
        borderRadius: 12,
        border: "0.5px solid #e5e7eb",
        background: "#fff",
        fontSize: 13.5,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "50%" }} />
          <col style={{ width: "26%" }} />
          <col style={{ width: "24%" }} />
        </colgroup>

        <thead>
          <tr style={{ borderBottom: "0.5px solid #f0f0f0", background: "#f9fafb" }}>
            {[
              { label: "Tiêu đề", align: "left" as const },
              { label: "Giai đoạn", align: "left" as const },
              { label: "", align: "right" as const },
            ].map(({ label, align }, i) => (
              <th
                key={i}
                style={{
                  padding: "10px 14px",
                  textAlign: align,
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#9ca3af",
                }}
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
                style={{ borderBottom: "0.5px solid #f0f0f0" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Title + subtitle */}
                <td style={{ padding: "11px 14px" }}>
                  <span
                    title={deal.title}
                    style={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: 500,
                      color: "#111827",
                    }}
                  >
                    {deal.title}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 11.5,
                      color: "#9ca3af",
                      marginTop: 2,
                    }}
                  >
                    {[deal.customerName, deal.ownerName].filter(Boolean).join(" · ")}
                  </span>
                </td>

                {/* Stage badge */}
                <td style={{ padding: "11px 14px" }}>
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
                <td style={{ padding: "11px 14px", textAlign: "right" }}>
                  <Link
                    href={`/deals/${deal.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#185FA5",
                      textDecoration: "none",
                      padding: "5px 10px",
                      borderRadius: 7,
                      border: "0.5px solid #B5D4F4",
                      background: "#E6F1FB",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Xem chi tiết
                  </Link>
                </td>
              </tr>
            );
          })}

          {deals.length === 0 && (
            <tr>
              <td
                colSpan={3}
                style={{ padding: "40px 16px", textAlign: "center", color: "#9ca3af" }}
              >
                Không có deals.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}