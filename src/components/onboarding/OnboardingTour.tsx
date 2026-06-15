"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Check, MousePointerClick } from "lucide-react";
import { getArrowStyle } from "@/static/onboarding-tour-data";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";
/* ──────────────────────────────────────────────────────────────
   Re-export để các trang khác import như cũ:
   import { startOnboardingTour, useTourStep } from "@/components/onboarding/OnboardingTour";
────────────────────────────────────────────────────────────── */
export {
  START_TOUR_EVENT,
  TOUR_STEP_EVENT,
  startOnboardingTour,
  dispatchTourStep,
} from "@/static/onboarding-tour-data";
export { useTourStep } from "@/hooks/useOnboardingTour";

/* ──────────────────────────────────────────────────────────────
   Main Component — chỉ còn render theo `phase`
────────────────────────────────────────────────────────────── */
export function OnboardingTour() {
  const { phase, activeView, handleStart, handleSkip, handleFinish, handleNext, handlePrev } =
    useOnboardingTour();
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const container = document.createElement("div");
    container.className = "onboarding-tour-portal";
    document.body.appendChild(container);
    setPortalContainer(container);
    return () => {
      document.body.removeChild(container);
    };
  }, []);

  if (phase === "hidden" || !portalContainer) return null;

  /* ── Welcome Prompt ── */
  if (phase === "prompt") {
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

  /* ── Completion Modal ── */
  if (phase === "completed") {
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
  if (phase === "waiting") {
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
  const v = activeView!;
  const {
    step,
    isSubStep,
    title,
    desc,
    badge,
    targetRect,
    tooltipStyle,
    subStepNumber,
    totalDisplay,
    currentProgress,
    totalSubSteps,
    stepIndex,
    isFirst,
    isLast,
    isAtSubEntry,
  } = v;

  const P = 8;

  const tourContent = (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay + Spotlight */}
      {targetRect ? (
        <div
          className="fixed rounded-lg transition-all duration-300"
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
        <div className="absolute inset-0 bg-black/65" onClick={handleFinish} />
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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalDisplay }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === stepIndex ? "w-4 bg-blue-600" : i < stepIndex ? "w-1.5 bg-blue-300" : "w-1.5 bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleFinish}
              className="ml-2 text-[11px] text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
              title="Thoát hướng dẫn"
            >
              Thoát
            </button>
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
                <>
                  Hoàn thành <Check className="w-3.5 h-3.5" />
                </>
              ) : isAtSubEntry ? (
                <>
                  Bấm vào <MousePointerClick className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Tiếp <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(tourContent, portalContainer);
}
