"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import confetti from "canvas-confetti";
import {
  START_TOUR_EVENT,
  TOUR_STEP_EVENT,
  TOUR_STEPS,
  dispatchTourStep,
  calcTooltipStyle,
  type TourStep,
  type SubStep,
} from "../static/onboarding-tour-data";

/* ──────────────────────────────────────────────────────────────
   Hook để các trang khác lắng nghe step hiện tại của tour
   (dùng để page tự mở panel/tab tương ứng)
────────────────────────────────────────────────────────────── */
export function useTourStep(callback: (tourId: string) => void) {
  useEffect(() => {
    const handler = (e: Event) => {
      callback((e as CustomEvent<{ tourId: string }>).detail.tourId);
    };
    window.addEventListener(TOUR_STEP_EVENT, handler);
    return () => window.removeEventListener(TOUR_STEP_EVENT, handler);
  }, [callback]);
}

/* ──────────────────────────────────────────────────────────────
   useOnboardingTour
   - phase: trạng thái hiện tại để component quyết định render gì
   - activeView: dữ liệu đã tính sẵn cho overlay khi phase === "active"
────────────────────────────────────────────────────────────── */
export type TourPhase = "hidden" | "prompt" | "completed" | "waiting" | "active";

export interface ActiveTourView {
  step: TourStep;
  stepIndex: number;
  subIndex: number;
  isSubStep: boolean;
  currentSubStep: SubStep | null;
  title: string;
  desc: string;
  badge?: string;
  targetRect: DOMRect | null;
  tooltipStyle: React.CSSProperties;
  subStepNumber: string;
  totalDisplay: number;
  currentProgress: number;
  totalSubSteps: number;
  isFirst: boolean;
  isLast: boolean;
  isAtSubEntry: boolean;
}

export function useOnboardingTour() {
  const router = useRouter();
  const pathname = usePathname();

  const [hasChecked, setHasChecked] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0); // Index trong TOUR_STEPS
  const [subIndex, setSubIndex] = useState(-1); // -1 = sidebar step, >=0 = sub-step
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [waitingForNav, setWaitingForNav] = useState(false);
  const prevPathRef = useRef(pathname);
  const navStartRef = useRef<number>(0); // mốc thời gian bắt đầu router.push, dùng để đo log
  const pendingPrevSubIndexRef = useRef<number | null>(null); // sub-step đích khi quay lại step trước

  /* ── Init: check mobile, check đã xem onboarding chưa, lắng nghe START_TOUR_EVENT ── */
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

  /* ── Khi router.push hoàn tất (pathname đổi) → vào sub-step đúng
     - handleNext  → pendingPrevSubIndexRef = null  → setSubIndex(0)
     - handlePrev  → pendingPrevSubIndexRef = N     → setSubIndex(N)
  ── */
  useEffect(() => {
    if (!waitingForNav) return;
    if (pathname !== prevPathRef.current) {
      console.log(
        `[tour] pathname đổi sau ${Date.now() - navStartRef.current}ms (${prevPathRef.current} -> ${pathname})`
      );
      prevPathRef.current = pathname;
      setWaitingForNav(false);
      setSubIndex(pendingPrevSubIndexRef.current ?? 0);
      pendingPrevSubIndexRef.current = null;
    }
  }, [pathname, waitingForNav]);

  /* ── Safety net: nếu sau 8s pathname vẫn chưa đổi (trang đích fetch quá lâu / kẹt),
     tự thoát khỏi "waiting" để không treo UI vô thời hạn ── */
  useEffect(() => {
    if (!waitingForNav) return;
    const t = setTimeout(() => {
      console.warn(
        `[tour] navigation timeout sau ${Date.now() - navStartRef.current}ms, fallback thoát waiting`
      );
      prevPathRef.current = pathname;
      setWaitingForNav(false);
      setSubIndex(pendingPrevSubIndexRef.current ?? 0);
      pendingPrevSubIndexRef.current = null;
    }, 8000);
    return () => clearTimeout(t);
  }, [waitingForNav, pathname]);

  /* ── Tìm element theo data-tour và cập nhật targetRect ── */
  const updateRect = useCallback(() => {
    if (!isActive) return;
    if (stepIndex >= TOUR_STEPS.length) return;

    const step = TOUR_STEPS[stepIndex];
    const currentTourId = subIndex === -1 ? step.id : step.subSteps[subIndex]?.tourId ?? "";

    // Dispatch trước để trang kịp mở panel / switch tab
    dispatchTourStep(currentTourId);

    const selector =
      subIndex === -1
        ? `[data-tour="${step.id}"]`
        : `[data-tour="${step.subSteps[subIndex]?.tourId}"]`;

    // Retry tối đa 5 lần cách nhau 150ms, chờ panel animate xong
    const tryFindEl = (attempt = 0) => {
      const el = document.querySelector(selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else if (attempt < 5) {
        setTimeout(() => tryFindEl(attempt + 1), 150);
      } else {
        setTargetRect(null);
      }
    };

    tryFindEl();
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

  /* ── Re-measure khi page báo hiệu panel đã sẵn sàng (sau animation) ── */
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ tourId: string }>).detail;
      if (stepIndex >= TOUR_STEPS.length) return;
      const step = TOUR_STEPS[stepIndex];
      const currentTourId = subIndex === -1 ? step.id : step.subSteps[subIndex]?.tourId ?? "";
      if (detail.tourId === currentTourId) {
        const selector = `[data-tour="${currentTourId}"]`;
        const el = document.querySelector(selector);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
        }
      }
    };
    window.addEventListener(TOUR_STEP_EVENT, handler);
    return () => window.removeEventListener(TOUR_STEP_EVENT, handler);
  }, [isActive, stepIndex, subIndex]);

  /* ── Nhấn ESC để thoát tour ── */
  useEffect(() => {
    if (!isActive) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsActive(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isActive]);

  /* ── Prompt handlers ── */
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

  const handleFinish = () => setIsActive(false);

  const triggerConfetti = () => {
    const end = Date.now() + 1500;
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EC4899"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  /* Navigate đến page khi bấm "Bấm vào" ở sidebar step */
  const handleNavigateAndContinue = () => {
    const step = TOUR_STEPS[stepIndex];

    // Nếu đã ở đúng trang rồi thì khỏi push, vào sub-step luôn (tránh treo oan 8s)
    if (pathname === step.href) {
      console.log(`[tour] đã ở sẵn ${step.href}, bỏ qua navigation`);
      setSubIndex(0);
      return;
    }

    console.log(`[tour] router.push -> ${step.href}`);
    prevPathRef.current = pathname;
    navStartRef.current = Date.now();
    pendingPrevSubIndexRef.current = null; // Next luôn vào sub-step 0
    setWaitingForNav(true);
    router.push(step.href);
  };

  /* Next trong sub-steps, hoặc chuyển sang sidebar step kế tiếp */
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
      const prevStepIndex = stepIndex - 1;
      const prevStep = TOUR_STEPS[stepIndex - 1];
      setStepIndex(prevStepIndex);

      const lastSubIndex = prevStep.subSteps.length - 1;

      if (pathname !== prevStep.href) {
        console.log(`[tour] router.push (prev) -> ${prevStep.href}`);
        prevPathRef.current = pathname;
        navStartRef.current = Date.now();
        pendingPrevSubIndexRef.current = lastSubIndex; // Vào sub-step cuối của step trước
        setWaitingForNav(true);
        router.push(prevStep.href);
      } else {
        // Đã ở đúng trang, vào sub-step cuối luôn
        setSubIndex(lastSubIndex);
      }
    }
  };

  /* ──────────────────────────────────────────────────────────────
     Derive phase + activeView — component chỉ cần render theo phase
  ────────────────────────────────────────────────────────────── */
  let phase: TourPhase = "hidden";
  let activeView: ActiveTourView | null = null;

  if (hasChecked && !isMobile) {
    if (showPrompt) {
      phase = "prompt";
    } else if (isActive) {
      if (stepIndex >= TOUR_STEPS.length) {
        phase = "completed";
      } else if (waitingForNav) {
        phase = "waiting";
      } else {
        phase = "active";

        const step = TOUR_STEPS[stepIndex];
        const isSubStep = subIndex >= 0;
        const currentSubStep = isSubStep ? step.subSteps[subIndex] : null;
        const preferredPos = (currentSubStep?.position ?? "right") as
          | "right"
          | "left"
          | "bottom"
          | "top";

        const P = 8;
        const tooltipStyle: React.CSSProperties = targetRect
          ? { ...calcTooltipStyle(targetRect, preferredPos, P), position: "fixed", width: 320 }
          : {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 320,
            };

        const totalSubSteps = TOUR_STEPS.reduce((s, st) => s + 1 + st.subSteps.length, 0);
        const currentProgress =
          TOUR_STEPS.slice(0, stepIndex).reduce((s, st) => s + 1 + st.subSteps.length, 0) +
          (subIndex === -1 ? 0 : 1 + subIndex);

        const sidebarStepNumber = stepIndex + 1;
        const subStepNumber = isSubStep
          ? `${sidebarStepNumber}.${subIndex + 1}`
          : `${sidebarStepNumber}`;

        activeView = {
          step,
          stepIndex,
          subIndex,
          isSubStep,
          currentSubStep,
          title: isSubStep ? currentSubStep!.title : step.title,
          desc: isSubStep ? currentSubStep!.desc : step.desc,
          badge: !isSubStep ? step.badge : undefined,
          targetRect,
          tooltipStyle,
          subStepNumber,
          totalDisplay: TOUR_STEPS.length,
          currentProgress,
          totalSubSteps,
          isFirst: stepIndex === 0 && subIndex === -1,
          isLast: stepIndex === TOUR_STEPS.length - 1 && subIndex === step.subSteps.length - 1,
          isAtSubEntry: subIndex === -1,
        };
      }
    }
  }

  return {
    phase,
    activeView,
    handleStart,
    handleSkip,
    handleFinish,
    handleNext,
    handlePrev,
  };
}