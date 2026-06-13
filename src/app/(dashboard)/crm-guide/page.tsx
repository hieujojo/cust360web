"use client";

import Image from "next/image";
import { useState } from "react";
import {
  modules,
  priorityConfig,
  quickGuideSteps,
  type Priority,
  type Feature,
  type Module,
} from "../../../static/crm-guide-data";
import MindMap from "../../../components/crm-guide/MindMap";
import { startOnboardingTour } from "@/components/onboarding/OnboardingTour";

// ─── Components ──────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = priorityConfig[priority];
  return (
    <span
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}30`,
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "99px",
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {priority} · {cfg.label}
    </span>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        overflow: "hidden",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 16px rgba(0,0,0,0.07)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")
      }
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--card-foreground)" }}>
            {feature.name}
          </span>
        </div>
        <span style={{ color: "var(--muted-foreground)", fontSize: "16px", flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          <p style={{ margin: "0 0 10px", fontSize: "13.5px", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
            {feature.description}
          </p>
          {feature.salesTip && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                background: "hsl(var(--success-bg))",
                border: "1px solid hsl(var(--success-border))",
                borderRadius: "8px",
                padding: "10px 12px",
              }}
            >
              <span style={{ fontSize: "14px", flexShrink: 0 }}>💡</span>
              <p style={{ margin: 0, fontSize: "13px", color: "hsl(var(--success-text))", lineHeight: 1.5 }}>
                <strong>Tip cho Sales:</strong> {feature.salesTip}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ModuleSection({ module }: { module: Module }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section style={{ marginBottom: "32px" }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          background: `linear-gradient(135deg, ${module.color}18, ${module.color}08)`,
          border: `1px solid ${module.color}30`,
          borderRadius: "12px",
          cursor: "pointer",
          textAlign: "left",
          marginBottom: collapsed ? 0 : "12px",
        }}
      >
        <span style={{ fontSize: "22px" }}>{module.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: module.color,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Module {module.id}
            </span>
          </div>
          <h2
            style={{
              margin: "2px 0 0",
              fontSize: "17px",
              fontWeight: 700,
              color: "var(--foreground)",
            }}
          >
            {module.title}
          </h2>
          <p style={{ margin: "1px 0 0", fontSize: "12px", color: "var(--muted-foreground)" }}>
            {module.subtitle}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "12px",
              background: module.color,
              color: "#fff",
              padding: "2px 9px",
              borderRadius: "99px",
              fontWeight: 600,
            }}
          >
            {module.features.length} tính năng
          </span>
          <span style={{ color: "var(--muted-foreground)" }}>{collapsed ? "▼" : "▲"}</span>
        </div>
      </button>

      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {module.features.map((f) => (
            <FeatureCard key={f.name} feature={f} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const totalFeatures = modules.reduce((sum, m) => sum + m.features.length, 0);
const totalP0 = modules.reduce(
  (sum, m) => sum + m.features.filter((f) => f.priority === "P0").length,
  0
);

export default function CRMGuide() {
  const [activeTab, setActiveTab] = useState<"guide" | "features" | "mindmap">("guide");
  const [search, setSearch] = useState("");
  const [isFileOpen, setIsFileOpen] = useState(false);
  const [isPreviewHover, setIsPreviewHover] = useState(false);
  
  // Có thể dùng ảnh (.png/.jpg) hoặc tài liệu (.pdf) đều được
  const fileSrc = "/docs/mind-map.pdf"; 
  const isPdf = fileSrc.toLowerCase().endsWith(".pdf");

  const filteredModules = modules
    .map((mod) => ({
      ...mod,
      features: mod.features.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.description.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((mod) => mod.features.length > 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header - Full width, outside padding */}
      <header
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)",
          padding: "40px 24px 32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          marginLeft: "-24px",
          marginRight: "-24px",
          marginTop: "-24px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #3B82F620 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8B5CF620 0%, transparent 50%)",
          }}
        />
        <div style={{ position: "relative", maxWidth: "720px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#3B82F620",
              border: "1px solid #3B82F640",
              padding: "4px 14px",
              borderRadius: "99px",
              marginBottom: "16px",
            }}
          >
            <span style={{ color: "#60A5FA", fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em" }}>
              HƯỚNG DẪN SỬ DỤNG
            </span>
          </div>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "clamp(24px, 5vw, 36px)",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            CRM Customer 360
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: "15px", color: "#94A3B8", lineHeight: 1.6 }}>
            Hướng dẫn dành cho Sales · {modules.length} modules · {totalFeatures} tính năng · Web
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Modules", value: String(modules.length) },
              { label: "Tính năng", value: String(totalFeatures) },
              { label: "Ưu tiên cao (P0)", value: String(totalP0) },
              { label: "Nền tảng", value: "Web" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#fff" }}>{s.value}</div>
                <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <div
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            gap: "0",
          }}
        >
          {(
            [
              { id: "guide", label: "🚀 Bắt đầu nhanh" },
              { id: "features", label: "📦 Tất cả tính năng" },
              { id: "mindmap", label: "🗺️ Sơ đồ MindMap" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "14px 20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? "var(--foreground)" : "var(--muted-foreground)",
                borderBottom: activeTab === tab.id ? "2px solid #3B82F6" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: activeTab === "mindmap" ? "1400px" : "800px", margin: "0 auto", padding: "32px 24px 80px", transition: "max-width 0.3s" }}>
        {/* ── Quick Guide Tab ── */}
        {activeTab === "guide" && (
          <div>
            <div
              style={{
                background: "hsl(var(--info-bg))",
                border: "1px solid hsl(var(--info-border))",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "28px",
                display: "flex",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "18px", flexShrink: 0 }}>👋</span>
              <p style={{ margin: 0, fontSize: "14px", color: "hsl(var(--info-text))", lineHeight: 1.6 }}>
                Đây là trang hướng dẫn sử dụng CRM Customer 360 phiên bản Web. Mobile hiện đang
                tạm hoãn (pending) và chưa được đề cập trong tài liệu này. Tài khoản của bạn được
                Admin tạo — kiểm tra email để nhận thông tin đăng nhập.
              </p>
            </div>

            <div className="flex justify-between items-center mb-5">
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--foreground)" }}>
                Hướng dẫn cho người dùng sử dụng  
              </h2>
              <button
                onClick={startOnboardingTour}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
              >
                <span>🎯</span>
                Xem lại Onboarding Tour
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
              {quickGuideSteps.map((s) => (
                <div
                  key={s.step}
                  style={{
                    display: "flex",
                    gap: "16px",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#3B82F6",
                      background: "rgba(59,130,246,0.12)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      flexShrink: 0,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {s.step}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--foreground)", marginBottom: "4px" }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: "13.5px", color: "var(--muted-foreground)", lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Features Tab ── */}
        {activeTab === "features" && (
          <div>
            {/* Search */}
            <div style={{ marginBottom: "24px", position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "16px",
                  pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                placeholder="Tìm tính năng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  fontSize: "14px",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  outline: "none",
                  background: "var(--background)",
                  boxSizing: "border-box",
                  color: "var(--foreground)",
                }}
              />
            </div>

            {filteredModules.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted-foreground)" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
                <div style={{ fontWeight: 600 }}>Không tìm thấy tính năng nào</div>
                <div style={{ fontSize: "13px", marginTop: "4px" }}>Thử từ khóa khác</div>
              </div>
            ) : (
              filteredModules.map((mod) => <ModuleSection key={mod.id} module={mod} />)
            )}
               {/* Module overview */}
            <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 700, color: "var(--foreground)" }}>
              Tổng quan các module
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "12px",
              }}
            >
              {modules.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => setActiveTab("features")}
                  style={{
                    background: "var(--card)",
                    border: `1px solid ${mod.color}30`,
                    borderRadius: "12px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 20px ${mod.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "none";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "8px" }}>{mod.icon}</div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: mod.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "4px",
                    }}
                  >
                    Module {mod.id}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)" }}>{mod.title}</div>
                  <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "6px" }}>
                    {mod.features.length} tính năng
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                position: "relative",
                width: "100%",
                marginTop: "24px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid var(--border)",
                cursor: "pointer",
                background: "var(--muted)",
              }}
              onMouseEnter={() => setIsPreviewHover(true)}
              onMouseLeave={() => setIsPreviewHover(false)}
            >
              <button
                type="button"
                onClick={() => setIsFileOpen(true)}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "block",
                  width: "100%",
                  position: "relative",
                }}
              >
                {/* Hiển thị PDF hoặc Ảnh */}
                {isPdf ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "16px",
                      height: "220px",
                      width: "100%",
                      background: "var(--muted)",
                    }}
                  >
                    {/* PDF Icon */}
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        background: "#EF4444",
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
                        position: "relative",
                      }}
                    >
                      <span style={{ color: "#fff", fontWeight: 900, fontSize: "18px", letterSpacing: "-0.04em" }}>PDF</span>
                      <div
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          width: "20px",
                          height: "20px",
                          background: "#fff",
                          border: "2px solid #EF4444",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--foreground)" }}>
                        {fileSrc.split("/").pop()}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "4px" }}>
                        Bấm vào để xem toàn bộ nội dung
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={fileSrc}
                    alt="Mind Map"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                )}
                
                {/* Lớp Overlay khi hover */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isPreviewHover ? 1 : 0,
                    transition: "all 0.2s",
                    background: "rgba(226, 232, 240, 0.7)", // Nền xám nhẹ
                    backdropFilter: "blur(2px)",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    style={{
                      background: "var(--card)",
                      color: "var(--foreground)",
                      padding: "8px 16px",
                      borderRadius: "99px",
                      fontSize: "14px",
                      fontWeight: 600,
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    Bấm vào để mở to ra nhé
                  </span>
                </div>
              </button>
            </div>

            {isFileOpen && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 1000,
                  backgroundColor: "rgba(15, 23, 42, 0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "1200px",
                    height: "90vh",
                    background: "var(--card)",
                    borderRadius: "18px",
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: "0 28px 80px rgba(15, 23, 42, 0.35)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                  >
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)" }}>
                      {isPdf ? "PDF Preview" : "Image Preview"}
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <a
                        href={fileSrc}
                        download={isPdf ? "MindMap_CRM360.pdf" : "MindMap_CRM360.png"}
                        style={{
                          border: "1px solid #3B82F6",
                          background: "rgba(59,130,246,0.12)",
                          color: "#3B82F6",
                          borderRadius: "999px",
                          padding: "10px 16px",
                          cursor: "pointer",
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>⬇️</span> Tải xuống
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsFileOpen(false)}
                        style={{
                          border: "1px solid var(--border)",
                          background: "var(--muted)",
                          color: "var(--foreground)",
                          borderRadius: "999px",
                          padding: "10px 16px",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      flex: 1,
                      background: "var(--muted)",
                    }}
                  >
                    {isPdf ? (
                      <iframe
                        src={fileSrc}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        title="PDF Viewer"
                      />
                    ) : (
                      <img
                        src={fileSrc}
                        alt="Mind Map"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MindMap Tab ── */}
        {activeTab === "mindmap" && (
          <div style={{ height: "calc(100vh - 300px)", minHeight: "600px", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", position: "relative" }}>
            <MindMap />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "20px 24px",
          textAlign: "center",
          background: "var(--card)",
        }}
      >
        <p style={{ margin: 0, fontSize: "12px", color: "var(--muted-foreground)" }}>
          CRM Customer 360 · Feature Spec v3.0 · 2025 · {modules.length} Modules · {totalFeatures} Features · Web only (Mobile pending)
        </p>
      </footer>
    </div>
  );
}
