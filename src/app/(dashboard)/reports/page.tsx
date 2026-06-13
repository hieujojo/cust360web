"use client";

import { useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from "recharts";
import { useDeals } from "@/hooks/useDeals";
import { usePipelineStages } from "@/hooks/useDeals";
import type { Deal } from "@/models/dealModel";
import { TrendingUp, DollarSign, BarChart3, Users, RefreshCw, Calendar } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const fmtShort = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}T`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const parseVal = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v.replace(/[^0-9.-]/g, "")) || 0;
  return 0;
};

const PALETTE = [
  "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444",
  "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1",
];

// ─── Time filter ──────────────────────────────────────────────────────────────

type Period = "month" | "quarter" | "year" | "custom";

function isInPeriod(dateStr: string | undefined, period: Period, from: Date, to: Date): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (period === "custom") return d >= from && d <= to;
  const now = new Date();
  if (period === "month") {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    const dq = Math.floor(d.getMonth() / 3);
    return d.getFullYear() === now.getFullYear() && dq === q;
  }
  return d.getFullYear() === now.getFullYear();
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card border-border shadow-sm" style={{
      borderRadius: 14, border: "1px solid var(--border)",
      padding: "20px 24px", display: "flex", gap: 16, alignItems: "flex-start",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--foreground)", lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

function Table({ cols, rows }: { cols: string[]; rows: (string | number)[][] }) {
  return (
    <div className="bg-card" style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr className="bg-muted">
            {cols.map((c, i) => (
              <th key={i} style={{
                padding: "10px 16px", textAlign: i === 0 ? "left" : "right",
                fontWeight: 600, color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)",
                whiteSpace: "nowrap",
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-card" : "bg-muted/50"}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: "10px 16px", textAlign: ci === 0 ? "left" : "right",
                  color: "var(--card-foreground)", borderBottom: "1px solid var(--border)",
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1E293B", color: "#fff", borderRadius: 10,
      padding: "10px 14px", fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color ?? "#fff" }}>
          {p.name}: <strong>{typeof p.value === "number" && p.value > 9999 ? fmtShort(p.value) + " ₫" : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

// ─── TAB 1: Pipeline Overview ─────────────────────────────────────────────────

function TabPipeline({ deals }: { deals: Deal[] }) {
  const { data: stages = [] } = usePipelineStages();

  const stageOrder = stages.map(s => s.name);

  const stageMap = useMemo(() => {
    const m: Record<string, { count: number; total: number }> = {};
    deals.forEach(d => {
      const v = parseVal(d.value);
      if (!m[d.stage]) m[d.stage] = { count: 0, total: 0 };
      m[d.stage].count++;
      m[d.stage].total += v;
    });
    return m;
  }, [deals]);

  const totalValue = deals.reduce((s, d) => s + parseVal(d.value), 0);
  const totalDeals = deals.length;
  const avgValue = totalDeals > 0 ? totalValue / totalDeals : 0;

  const chartData = stageOrder
    .filter(s => stageMap[s])
    .map(s => ({ name: s, "Tổng giá trị": stageMap[s].total, "Số deals": stageMap[s].count }));

  // also add stages not in order
  Object.keys(stageMap).forEach(s => {
    if (!stageOrder.includes(s)) chartData.push({ name: s, "Tổng giá trị": stageMap[s].total, "Số deals": stageMap[s].count });
  });

  const tableRows = chartData.map((r, i) => [
    r.name,
    r["Số deals"],
    fmtVND(r["Tổng giá trị"]),
    totalValue > 0 ? `${((r["Tổng giá trị"] / totalValue) * 100).toFixed(1)}%` : "0%",
  ]);

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
        <StatCard label="Tổng số deals" value={totalDeals.toString()} icon={BarChart3} color="#3B82F6" />
        <StatCard label="Tổng giá trị" value={fmtShort(totalValue) + " ₫"} sub={fmtVND(totalValue)} icon={DollarSign} color="#10B981" />
        <StatCard label="Giá trị TB / deal" value={fmtShort(avgValue) + " ₫"} sub={fmtVND(avgValue)} icon={TrendingUp} color="#8B5CF6" />
      </div>

      <Section title="Giá trị theo giai đoạn">
        {chartData.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "40px 0" }}>Không có dữ liệu</div>
        ) : (
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickFormatter={fmtShort} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Tổng giá trị" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {chartData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Section>

      <Section title="Bảng chi tiết theo giai đoạn">
        <Table
          cols={["Giai đoạn", "Số deals", "Tổng giá trị", "% trên tổng"]}
          rows={tableRows}
        />
      </Section>
    </div>
  );
}

// ─── TAB 2: Revenue Forecast ──────────────────────────────────────────────────

function TabForecast({ deals }: { deals: Deal[] }) {
  const now = new Date();

  const monthData = useMemo(() => {
    const m: Record<string, number> = {};
    // Initialize next 6 months
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      m[key] = 0;
    }
    deals.forEach(d => {
      if (!d.expectedCloseDate) return;
      const cd = new Date(d.expectedCloseDate);
      const key = `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, "0")}`;
      if (key in m) {
        m[key] += parseVal(d.value) * (d.probability / 100);
      }
    });
    return Object.entries(m)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => {
        const [y, mo] = key.split("-");
        const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("vi-VN", { month: "short", year: "numeric" });
        return { name: label, "Dự báo": Math.round(val) };
      });
  }, [deals]);

  const totalForecast = monthData.reduce((s, d) => s + d["Dự báo"], 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
        <StatCard label="Tổng dự báo 6 tháng" value={fmtShort(totalForecast) + " ₫"} sub={fmtVND(totalForecast)} icon={TrendingUp} color="#10B981" />
        <StatCard label="Deals có ngày đóng" value={deals.filter(d => d.expectedCloseDate).length.toString()} icon={Calendar} color="#F59E0B" />
      </div>

      <Section title="Doanh thu dự báo theo tháng (value × probability)">
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tickFormatter={fmtShort} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="Dự báo" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="Bảng chi tiết dự báo">
        <Table
          cols={["Tháng", "Doanh thu dự báo"]}
          rows={monthData.map(r => [r.name, fmtVND(r["Dự báo"])])}
        />
      </Section>
    </div>
  );
}

// ─── TAB 3: Sales Performance ─────────────────────────────────────────────────

function TabSales({ deals }: { deals: Deal[] }) {
  const ownerMap = useMemo(() => {
    const m: Record<string, { name: string; count: number; total: number; probSum: number }> = {};
    deals.forEach(d => {
      const key = d.ownerId;
      const name = d.ownerName || d.ownerId || "Chưa gán";
      if (!m[key]) m[key] = { name, count: 0, total: 0, probSum: 0 };
      m[key].count++;
      m[key].total += parseVal(d.value);
      m[key].probSum += d.probability;
    });
    return Object.values(m).sort((a, b) => b.total - a.total);
  }, [deals]);

  const chartData = ownerMap.map(o => ({
    name: o.name.length > 16 ? o.name.slice(0, 16) + "…" : o.name,
    "Tổng giá trị": o.total,
    "Số deals": o.count,
  }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
        <StatCard label="Số sales" value={ownerMap.length.toString()} icon={Users} color="#6366F1" />
        <StatCard
          label="Người dẫn đầu"
          value={ownerMap[0]?.name ?? "—"}
          sub={ownerMap[0] ? fmtVND(ownerMap[0].total) : ""}
          icon={TrendingUp}
          color="#F59E0B"
        />
      </div>

      <Section title="So sánh giá trị giữa các Sales">
        {chartData.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "40px 0" }}>Không có dữ liệu</div>
        ) : (
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} angle={-20} textAnchor="end" interval={0} />
                <YAxis tickFormatter={fmtShort} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Tổng giá trị" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {chartData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Section>

      <Section title="Bảng xếp hạng Sales">
        <Table
          cols={["Sales", "Số deals", "Tổng giá trị", "Xác suất TB"]}
          rows={ownerMap.map(o => [
            o.name,
            o.count,
            fmtVND(o.total),
            `${Math.round(o.probSum / o.count)}%`,
          ])}
        />
      </Section>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "pipeline", label: "📊 Tổng quan Pipeline" },
  { id: "forecast", label: "📈 Dự báo Doanh thu" },
  { id: "sales", label: "🏆 Hiệu suất Sales" },
] as const;

type TabId = typeof TABS[number]["id"];

const PERIODS: { id: Period; label: string }[] = [
  { id: "month", label: "Tháng này" },
  { id: "quarter", label: "Quý này" },
  { id: "year", label: "Năm này" },
  { id: "custom", label: "Tùy chọn" },
];

export default function ReportsPage() {
  const [tab, setTab] = useState<TabId>("pipeline");
  const [period, setPeriod] = useState<Period>("year");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { data: rawDeals = [], isLoading, isError, refetch } = useDeals();

  const from = customFrom ? new Date(customFrom) : new Date(0);
  const to = customTo ? new Date(customTo) : new Date();

  // Filter: exclude deleted, apply time period on createdAt
  const deals = useMemo<Deal[]>(() => {
    return rawDeals.filter(d => {
      if ((d as any).isDeleted) return false;
      return isInPeriod(d.createdAt, period, from, to);
    });
  }, [rawDeals, period, customFrom, customTo]);

  return (
    <div className="min-h-screen bg-background" style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)", margin: 0 }}>Báo cáo</h1>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)", margin: "4px 0 0" }}>
              Phân tích dữ liệu pipeline & hiệu suất team sales
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="bg-card border-border hover:bg-accent hover:text-accent-foreground"
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              border: "1px solid var(--border)", borderRadius: 8,
              fontSize: 13, fontWeight: 600, color: "var(--foreground)", cursor: "pointer",
            }}
          >
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </div>

      {/* Time filter bar */}
      <div className="bg-card border-border" style={{
        borderRadius: 12, border: "1px solid var(--border)",
        padding: "12px 16px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      }} data-tour="reports-filter">
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)", marginRight: 4 }}>Lọc theo:</span>
        {PERIODS.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={period === p.id ? "bg-primary/10 text-primary border-primary" : "bg-muted text-muted-foreground border-border hover:bg-accent"}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
              borderWidth: "1px", borderStyle: "solid",
              transition: "all 0.15s",
            }}
          >
            {p.label}
          </button>
        ))}
        {period === "custom" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 8 }}>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="bg-background text-foreground border-border"
              style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", fontSize: 13 }} />
            <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>—</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              className="bg-background text-foreground border-border"
              style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", fontSize: 13 }} />
          </div>
        )}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" }}>
          {isLoading ? "Đang tải..." : `${deals.length} deals`}
        </span>
      </div>

      {/* Error */}
      {isError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-[10px] p-3 mb-5 text-destructive text-[13px] flex gap-2 items-center">
          <RefreshCw size={16} /> Không thể tải dữ liệu. Hãy kiểm tra kết nối và thử lại.
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-muted animate-pulse" style={{ height: 90, borderRadius: 14 }} />
          ))}
        </div>
      )}

      {/* Tab nav */}
      {!isLoading && (
        <>
          <div data-tour="reports-tabs" className="bg-card border-border" style={{
            borderRadius: 12, border: "1px solid var(--border)",
            padding: "4px", marginBottom: 20, display: "inline-flex", gap: 2,
          }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={tab === t.id ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
                style={{
                  padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", border: "none", transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-card border-border shadow-sm" style={{
            borderRadius: 14, border: "1px solid var(--border)",
            padding: "24px",
          }}>
            {tab === "pipeline" && <TabPipeline deals={deals} />}
            {tab === "forecast" && <TabForecast deals={deals} />}
            {tab === "sales" && <TabSales deals={deals} />}
          </div>
        </>
      )}
    </div>
  );
}
