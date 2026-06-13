"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, MousePointerClick } from "lucide-react";
import confetti from "canvas-confetti";

/* ──────────────────────────────────────────────────────────────
   Public API — dùng để trigger lại tour từ trang /crm-guide
────────────────────────────────────────────────────────────── */
export const START_TOUR_EVENT = "START_ONBOARDING_TOUR";

export const startOnboardingTour = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(START_TOUR_EVENT));
  }
};

/* ──────────────────────────────────────────────────────────────
   Tour data structure
────────────────────────────────────────────────────────────── */
interface SubStep {
  tourId: string;       // data-tour attribute trên element trong page
  title: string;
  desc: string;
  position?: "right" | "left" | "bottom" | "top";
}

interface TourStep {
  id: string;           // data-tour attribute trên Sidebar item
  sidebarLabel: string;
  href: string;         // Trang sẽ navigate đến
  title: string;        // Tiêu đề của sidebar step
  desc: string;         // Mô tả ngắn khi spotlight sidebar
  badge?: string;
  subSteps: SubStep[];  // Các bước hướng dẫn trong trang
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "tour-dashboard",
    sidebarLabel: "Dashboard",
    href: "/dashboard",
    title: "🏠 Trang tổng quan",
    desc: "Bấm vào Dashboard để xem nhanh toàn bộ hoạt động: số khách hàng, deals đang mở, phòng ban và hoạt động hôm nay.",
    subSteps: [
      {
        tourId: "dashboard-stats",
        title: "📊 Thống kê tổng quan",
        desc: "4 ô số liệu cho bạn thấy ngay: Tổng khách hàng, Deals đang mở, Phòng ban và Hoạt động hôm nay. Dữ liệu được cập nhật realtime.",
      },
      {
        tourId: "dashboard-account-info",
        title: "👤 Thông tin tài khoản",
        desc: "Chi tiết tài khoản, email, chức vụ và phòng ban của bạn trong hệ thống CRM.",
      },
    ],
  },
  {
    id: "tour-customers",
    sidebarLabel: "Khách hàng",
    href: "/customers",
    title: "👥 Quản lý khách hàng",
    desc: "Bấm vào Khách hàng để xem toàn bộ danh sách. Bạn có thể tạo mới, lọc, tìm kiếm và phân công người phụ trách.",
    subSteps: [
      {
        tourId: "customers-stats",
        title: "📈 Thống kê khách hàng",
        desc: "4 chỉ số: Tổng, Tiềm năng (Lead), Đang hoạt động (Active) và Rời bỏ (Churned). Nhìn qua đây để nắm sức khỏe khách hàng tổng thể.",
      },
      {
        tourId: "customers-filters",
        title: "🔍 Bộ lọc & Tìm kiếm",
        desc: "Dùng thanh tìm kiếm và dropdown để lọc khách hàng theo: Trạng thái, Người phụ trách, Phòng ban. Bạn cũng có thể tìm kiếm theo tên hoặc mã khách hàng.",
      },
      {
        tourId: "customers-create-btn",
        title: "➕ Tạo khách hàng mới",
        desc: "Bấm nút này để tạo khách hàng đầu tiên của bạn! Điền thông tin cơ bản như tên, email, số điện thoại và chọn người phụ trách.",
        position: "left",
      },
    ],
  },
  {
    id: "tour-pipeline",
    sidebarLabel: "Pipeline",
    href: "/pipeline",
    title: "📊 Sales Pipeline",
    desc: "Bấm vào Pipeline để xem Kanban board. Theo dõi từng deal qua các giai đoạn từ Lead đến Won theo thời gian thực.",
    subSteps: [
      {
        tourId: "pipeline-filters",
        title: "⚙️ Bộ lọc Pipeline",
        desc: "Tìm kiếm deal, lọc theo giai đoạn (stage) hoặc người phụ trách. Bạn còn có thể chuyển đổi giữa chế độ Kanban (kéo thả) và Deal List.",
      },
      {
        tourId: "pipeline-create-btn",
        title: "➕ Tạo Deal mới",
        desc: "Bấm nút này để tạo deal mới. Nhập tên deal, giá trị, xác suất thành công và chọn giai đoạn phù hợp.",
        position: "left",
      },
    ],
  },
  {
    id: "tour-reports",
    sidebarLabel: "Báo cáo",
    href: "/reports",
    title: "📈 Báo cáo & Phân tích",
    desc: "Bấm vào Báo cáo để xem phân tích pipeline, dự báo doanh thu và hiệu suất từng thành viên sales.",
    subSteps: [
      {
        tourId: "reports-filter",
        title: "🗓️ Bộ lọc thời gian",
        desc: "Lọc dữ liệu theo Tháng này, Quý này, Năm này hoặc tùy chọn khoảng ngày bất kỳ. Dữ liệu biểu đồ sẽ cập nhật ngay lập tức.",
      },
      {
        tourId: "reports-tabs",
        title: "📋 Ba tab phân tích",
        desc: "Tổng quan Pipeline — Dự báo Doanh thu — Hiệu suất Sales. Mỗi tab cho bạn góc nhìn khác nhau về team.",
      },
    ],
  },
  {
    id: "tour-settings",
    sidebarLabel: "Cài đặt",
    href: "/settings",
    title: "⚙️ Cài đặt hệ thống",
    desc: "Bấm vào Cài đặt để cấu hình hệ thống trước khi cho team sử dụng. (Chỉ dành cho Admin)",
    badge: "Admin",
    subSteps: [
      {
        tourId: "settings-cards",
        title: "🗂️ Các mục cài đặt",
        desc: "Hồ sơ tổ chức, Phòng ban, Người dùng, Pipeline Stages, Gmail & Calendar. Hãy thiết lập theo thứ tự này để team có thể sử dụng hệ thống ngay.",
      },
    ],
  },
];

/* ──────────────────────────────────────────────────────────────
   Tooltip position calculation
────────────────────────────────────────────────────────────── */
function calcTooltipStyle(
  rect: DOMRect,
  preferredPos: "right" | "left" | "bottom" | "top",
  p: number
): React.CSSProperties {
  const TOOLTIP_W = 320;
  const TOOLTIP_H = 200;
  const margin = 16;

  // Prefer right, fallback to left then bottom
  const spaceRight = window.innerWidth - rect.right - p - margin;
  const spaceLeft = rect.left - p - margin;
  const spaceBottom = window.innerHeight - rect.bottom - p - margin;
  const spaceTop = rect.top - p - margin;

  let pos = preferredPos;
  if (pos === "right" && spaceRight < TOOLTIP_W) pos = spaceLeft >= TOOLTIP_W ? "left" : "bottom";
  if (pos === "left" && spaceLeft < TOOLTIP_W) pos = spaceRight >= TOOLTIP_W ? "right" : "bottom";
  if (pos === "bottom" && spaceBottom < TOOLTIP_H) pos = "top";
  if (pos === "top" && spaceTop < TOOLTIP_H) pos = "bottom";

  const centerV = Math.max(20, Math.min(rect.top + rect.height / 2 - TOOLTIP_H / 2, window.innerHeight - TOOLTIP_H - 20));
  const centerH = Math.max(20, Math.min(rect.left + rect.width / 2 - TOOLTIP_W / 2, window.innerWidth - TOOLTIP_W - 20));

  switch (pos) {
    case "right":  return { top: centerV, left: rect.right + p + margin };
    case "left":   return { top: centerV, right: window.innerWidth - rect.left + p + margin, left: "auto" };
    case "bottom": return { top: rect.bottom + p + margin, left: centerH };
    case "top":    return { bottom: window.innerHeight - rect.top + p + margin, left: centerH, top: "auto" };
    default:       return { top: centerV, left: rect.right + p + margin };
  }
}

function getArrowStyle(rect: DOMRect, tooltipStyle: React.CSSProperties, p: number): React.CSSProperties {
  if (tooltipStyle.left !== "auto" && typeof tooltipStyle.left === "number" && tooltipStyle.left > rect.right) {
    // Arrow on left side of tooltip
    const arrowTop = Math.max(16, rect.top + rect.height / 2 - (Number(tooltipStyle.top) || 0) - 8);
    return { top: arrowTop, left: -8 };
  }
  if (typeof tooltipStyle.right === "number") {
    // Arrow on right side of tooltip
    const arrowTop = Math.max(16, rect.top + rect.height / 2 - (Number(tooltipStyle.top) || 0) - 8);
    return { top: arrowTop, right: -8, left: "auto", transform: "rotate(225deg)" };
  }
  // Arrow on top
  const arrowLeft = Math.max(16, rect.left + rect.width / 2 - (typeof tooltipStyle.left === "number" ? tooltipStyle.left : 0) - 8);
  return { top: -8, left: arrowLeft, transform: "rotate(135deg)" };
}

/* ──────────────────────────────────────────────────────────────
   Main Component
────────────────────────────────────────────────────────────── */
export function OnboardingTour() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasChecked, setHasChecked] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);      // Index trong TOUR_STEPS (0–4)
  const [subIndex, setSubIndex] = useState(-1);       // -1 = sidebar step, >=0 = sub-step
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [waitingForNav, setWaitingForNav] = useState(false);
  const prevPathRef = useRef(pathname);

  /* ── Init ── */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeen) setShowPrompt(true);
    setHasChecked(true);

    const handleStartTour = () => {
      if (window.innerWidth >= 768) {
        setShowPrompt(false);
        setIsActive(true);
        setStepIndex(0);
        setSubIndex(-1);
      }
    };
    window.addEventListener(START_TOUR_EVENT, handleStartTour);
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener(START_TOUR_EVENT, handleStartTour);
    };
  }, []);

  /* ── Detect navigation completion ── */
  useEffect(() => {
    if (!waitingForNav) return;
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      setWaitingForNav(false);
      setSubIndex(0); // Chuyển vào sub-step đầu tiên
    }
  }, [pathname, waitingForNav]);

  /* ── Find element & update rect ── */
  const updateRect = useCallback(() => {
    if (!isActive) return;
    if (stepIndex >= TOUR_STEPS.length) return;

    const step = TOUR_STEPS[stepIndex];
    const selector = subIndex === -1
      ? `[data-tour="${step.id}"]`
      : `[data-tour="${step.subSteps[subIndex]?.tourId}"]`;

    const el = document.querySelector(selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setTargetRect(null);
    }
  }, [isActive, stepIndex, subIndex]);

  useEffect(() => {
    const timer = setTimeout(updateRect, 200);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [updateRect]);

  /* ── Handlers ── */
  const handleStart = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowPrompt(false);
    if (!isMobile) {
      setIsActive(true);
      setStepIndex(0);
      setSubIndex(-1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowPrompt(false);
  };

  const handleFinish = () => {
    setIsActive(false);
  };

  const triggerConfetti = () => {
    const end = Date.now() + 1500;
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  /* Navigate to page when clicking "Bấm vào" */
  const handleNavigateAndContinue = () => {
    const step = TOUR_STEPS[stepIndex];
    prevPathRef.current = pathname;
    setWaitingForNav(true);
    router.push(step.href);
  };

  /* Next within sub-steps, or move to next main step */
  const handleNext = () => {
    const step = TOUR_STEPS[stepIndex];

    if (subIndex === -1) {
      // Đang ở sidebar step — navigate đến page
      handleNavigateAndContinue();
      return;
    }

    const nextSubIndex = subIndex + 1;
    if (nextSubIndex < step.subSteps.length) {
      setSubIndex(nextSubIndex);
    } else {
      // Xong sub-steps của step này → chuyển step tiếp theo
      const nextStepIndex = stepIndex + 1;
      if (nextStepIndex >= TOUR_STEPS.length) {
        // Hoàn thành tour
        setStepIndex(TOUR_STEPS.length);
        setSubIndex(-1);
        triggerConfetti();
      } else {
        setStepIndex(nextStepIndex);
        setSubIndex(-1);
      }
    }
  };

  const handlePrev = () => {
    if (subIndex > 0) {
      setSubIndex(subIndex - 1);
    } else if (subIndex === 0) {
      setSubIndex(-1); // Back to sidebar step
    } else if (subIndex === -1 && stepIndex > 0) {
      // Go to last sub-step of previous step
      const prevStep = TOUR_STEPS[stepIndex - 1];
      setStepIndex(stepIndex - 1);
      setSubIndex(prevStep.subSteps.length - 1);
    }
  };

  /* ── Progress calc ── */
  const totalSubSteps = TOUR_STEPS.reduce((s, st) => s + 1 + st.subSteps.length, 0);
  const currentProgress = TOUR_STEPS.slice(0, stepIndex).reduce((s, st) => s + 1 + st.subSteps.length, 0)
    + (subIndex === -1 ? 0 : 1 + subIndex);

  /* ── Early returns ── */
  if (!hasChecked || isMobile) return null;

  /* ── Welcome Prompt ── */
  if (showPrompt) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-center">
            <div className="text-4xl mb-2">👋</div>
            <h2 className="text-xl font-bold text-white mb-1">Chào mừng đến với CRM360</h2>
            <p className="text-blue-100 text-sm">Hệ thống quản lý khách hàng dành riêng cho Sales</p>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-1 text-center">
              Bạn có muốn bắt đầu phần hướng dẫn sử dụng không?
            </p>
            <p className="text-gray-400 text-xs mb-5 text-center">5 bước · khoảng 3 phút</p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleStart}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Bắt đầu hướng dẫn →
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl transition-colors text-sm"
              >
                Bỏ qua, tự khám phá
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isActive) return null;

  /* ── Completion Modal ── */
  if (stepIndex >= TOUR_STEPS.length) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-4">
            🎯
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Bạn đã sẵn sàng!</h3>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Tour hoàn thành. Bạn có thể xem lại hướng dẫn chi tiết tại mục{" "}
            <span className="font-semibold text-blue-600">"Hướng dẫn sử dụng"</span> bất cứ lúc nào.
          </p>
          <button
            onClick={handleFinish}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            Bắt đầu sử dụng CRM360 →
          </button>
        </div>
      </div>
    );
  }

  /* ── Waiting for navigation ── */
  if (waitingForNav) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 flex items-center gap-4 shadow-2xl">
          <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
          <span className="text-gray-700 font-medium text-sm">Đang chuyển trang...</span>
        </div>
      </div>
    );
  }

  /* ── Active Tour Overlay ── */
  const step = TOUR_STEPS[stepIndex];
  const isSubStep = subIndex >= 0;
  const currentSubStep = isSubStep ? step.subSteps[subIndex] : null;
  const preferredPos = (currentSubStep?.position ?? "right") as "right" | "left" | "bottom" | "top";

  const P = 8;
  const tooltipStyle: React.CSSProperties = targetRect
    ? { ...calcTooltipStyle(targetRect, preferredPos, P), position: "absolute", width: 320 }
    : { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 320 };

  // Count for display
  const sidebarStepNumber = stepIndex + 1;
  const subStepNumber = isSubStep ? `${sidebarStepNumber}.${subIndex + 1}` : `${sidebarStepNumber}`;
  const totalDisplay = TOUR_STEPS.length;

  const isFirst = stepIndex === 0 && subIndex === -1;
  const isLast = stepIndex === TOUR_STEPS.length - 1 && subIndex === step.subSteps.length - 1;
  const isAtSubEntry = subIndex === -1; // sidebar step — cần click để navigate

  const title = isSubStep ? currentSubStep!.title : step.title;
  const desc = isSubStep ? currentSubStep!.desc : step.desc;
  const badge = !isSubStep ? step.badge : undefined;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay + Spotlight */}
      {targetRect ? (
        <div
          className="absolute rounded-lg transition-all duration-300"
          style={{
            top: targetRect.top - P,
            left: targetRect.left - P,
            width: targetRect.width + P * 2,
            height: targetRect.height + P * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
            border: "2px solid #3B82F6",
            borderRadius: isSubStep ? 8 : 10,
          }}
        >
          <div
            className="absolute inset-0 rounded-lg"
            style={{ boxShadow: "0 0 24px 4px rgba(59,130,246,0.5)" }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-black/65" />
      )}

      {/* Tooltip */}
      <div
        className="pointer-events-auto bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={tooltipStyle}
      >
        {/* Arrow */}
        {targetRect && (
          <div
            className="absolute w-3.5 h-3.5 bg-white rotate-45 border-l border-b border-gray-100"
            style={getArrowStyle(targetRect, tooltipStyle, P)}
          />
        )}

        {/* Header */}
        <div className="px-5 pt-4 pb-3 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
              Bước {subStepNumber} / {totalDisplay}
            </span>
            {badge && (
              <span className="bg-orange-100 text-orange-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
            {isSubStep && (
              <span className="text-[11px] text-gray-400 font-medium ml-auto">{step.sidebarLabel}</span>
            )}
          </div>
          <h4 className="text-[15px] font-bold text-gray-900 mb-1.5 leading-tight">{title}</h4>
          <p className="text-[13px] text-gray-600 leading-relaxed">{desc}</p>

          {/* Click hint for sidebar steps */}
          {isAtSubEntry && (
            <div className="mt-3 flex items-center gap-2 bg-blue-50 text-blue-700 text-[12px] font-medium rounded-lg px-3 py-2">
              <MousePointerClick className="w-3.5 h-3.5 shrink-0" />
              <span>Bấm "Bấm vào" để chuyển vào trang và tiếp tục hướng dẫn</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="px-5 pb-3">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentProgress / totalSubSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          {/* Dots */}
          <div className="flex items-center gap-1">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === stepIndex ? "w-4 bg-blue-600" : i < stepIndex ? "w-1.5 bg-blue-300" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              {isLast ? (
                <>Hoàn thành <Check className="w-3.5 h-3.5" /></>
              ) : isAtSubEntry ? (
                <>Bấm vào <MousePointerClick className="w-3.5 h-3.5" /></>
              ) : (
                <>Tiếp <ChevronRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
