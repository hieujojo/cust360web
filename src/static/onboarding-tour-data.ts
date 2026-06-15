/* ──────────────────────────────────────────────────────────────
   onboarding-tour-data.ts
   - Public events / API để trigger tour
   - TOUR_STEPS: dữ liệu tĩnh mô tả từng bước hướng dẫn
   - Helper functions tính toán vị trí tooltip/arrow (pure functions)
────────────────────────────────────────────────────────────── */

/* ── Public events ── */
export const START_TOUR_EVENT = "START_ONBOARDING_TOUR";
export const TOUR_STEP_EVENT = "TOUR_STEP_CHANGED";

export const startOnboardingTour = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(START_TOUR_EVENT));
  }
};

export const dispatchTourStep = (tourId: string) => {
  window.dispatchEvent(new CustomEvent(TOUR_STEP_EVENT, { detail: { tourId } }));
};

/* ──────────────────────────────────────────────────────────────
   Tour data structure
────────────────────────────────────────────────────────────── */
export interface SubStep {
  tourId: string; // data-tour attribute trên element trong page
  title: string;
  desc: string;
  position?: "right" | "left" | "bottom" | "top";
}

export interface TourStep {
  id: string; // data-tour attribute trên Sidebar item
  sidebarLabel: string;
  href: string; // Trang sẽ navigate đến
  title: string; // Tiêu đề của sidebar step
  desc: string; // Mô tả ngắn khi spotlight sidebar
  badge?: string;
  subSteps: SubStep[]; // Các bước hướng dẫn trong trang
}

export const TOUR_STEPS: TourStep[] = [
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
        desc: "5 ô số liệu cho bạn thấy ngay: Tổng khách hàng, Deals đang mở, Phòng ban và Hoạt động hôm nay và số lượng người dùng của trang web. Dữ liệu được cập nhật realtime.",
      },
      {
        tourId: "dashboard-account-info",
        title: "👤 Thông tin tài khoản",
        desc: "Chi tiết tài khoản, email, chức vụ và phòng ban của bạn trong hệ thống CRM.",
      },
      {
        tourId: "dashboard-theme-toggle",
        title: "🌙 Thanh công cụ trên cùng",
        desc: "Gồm 3 nút: nút chuyển nền Sáng/Tối, nút thông báo (nhận thông báo khi có deal được giao cho bạn), và nút tài khoản để xem hồ sơ cá nhân, đổi mật khẩu hoặc đăng xuất.",
        position: "bottom",
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
        tourId: "customers-create-btn",
        title: "➕ Tạo khách hàng mới",
        desc: "Bấm nút này để tạo khách hàng đầu tiên của bạn! Điền thông tin cơ bản như tên, email, số điện thoại và chọn người phụ trách.",
        position: "left",
      },
      {
        tourId: "customers-filters",
        title: "🔍 Bộ lọc & Tìm kiếm",
        desc: "Dùng thanh tìm kiếm và dropdown để lọc khách hàng theo: Trạng thái, Người phụ trách, Phòng ban. Bạn cũng có thể tìm kiếm theo tên hoặc mã khách hàng.",
      },
      {
        tourId: "customers-toolbar",
        title: "⚙️ Thanh công cụ danh sách",
        desc: "Gồm nút Export để xuất danh sách khách hàng ra file Excel, và 2 nút chuyển đổi giao diện giữa dạng Bảng (table) và dạng Lưới (grid) cho phù hợp với thói quen làm việc.",
        position: "bottom",
      },
      {
        tourId: "customers-row-actions",
        title: "👁️ Xem & Chỉnh sửa khách hàng",
        desc: "Mỗi dòng có 2 nút: nút Mắt để xem chi tiết, nút Bút để chỉnh sửa nhanh trạng thái. Bạn cũng có thể bấm thẳng vào tên khách hàng để mở nhanh.",
        position: "left",
      },
      {
        tourId: "customers-detail-info",
        title: "📋 Tab Info — Thông tin cơ bản",
        desc: "Hiển thị email, số điện thoại, người phụ trách, nguồn khách hàng và ngày tạo. Bấm vào từng trường để chỉnh sửa trực tiếp.",
        position: "left",
      },
      {
        tourId: "customers-detail-contacts",
        title: "👤 Tab Contacts — Đầu mối liên hệ",
        desc: "Mỗi khách hàng có thể có nhiều đầu mối liên hệ. Người được đánh dấu Primary là liên hệ chính. Thêm, sửa, xoá đầu mối ngay tại đây.",
        position: "left",
      },
      {
        tourId: "customers-detail-deals",
        title: "💰 Tab Deals — Deals liên quan",
        desc: "Toàn bộ deals đang gắn với khách hàng này, kèm giai đoạn hiện tại. Bấm vào deal để chuyển thẳng sang Pipeline và xem chi tiết.",
        position: "left",
      },
      {
        tourId: "customers-detail-timeline",
        title: "⚡ Tab Timeline — Lịch sử hoạt động",
        desc: "Ghi lại toàn bộ tương tác với khách hàng: ghi chú thủ công, email và lịch họp. Các mục có nhãn \"Auto\" nghĩa là đã được đồng bộ tự động từ Gmail hoặc Google Calendar — bạn không cần nhập tay. Để kích hoạt tính năng này, vào Cài đặt hệ thống và kết nối tài khoản Google.",
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
      {
        tourId: "pipeline-deal-card",
        title: "🃏 Xem chi tiết một Deal",
        desc: "Bấm vào bất kỳ card deal nào trên Kanban để mở trang chi tiết. Tại đây bạn có thể cập nhật giá trị, giai đoạn, ghi chú và toàn bộ lịch sử trao đổi với khách hàng — đây là tính năng quan trọng nhất của CRM360!",
        position: "right",
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
    id: "tour-feedback",
    sidebarLabel: "Góp ý",
    href: "/feedback",
    title: "💬 Góp ý & Phản hồi",
    desc: "Nơi bạn có thể gửi phản hồi, báo lỗi hoặc đóng góp ý kiến để cải thiện hệ thống.",
    subSteps: [
      {
        tourId: "feedback-create",
        title: "📣 Tạo góp ý",
        desc: "Bấm vào đây để tạo góp ý hoặc phản hồi mới. Bạn có thể gửi góp ý ẩn danh nếu muốn.",
      },
      {
        tourId: "feedback-tabs",
        title: "👥 Khách hàng & Nội bộ",
        desc: "Góp ý được chia thành 2 loại: từ khách hàng bên ngoài và từ nhân viên nội bộ.",
      }
    ],
  },
  {
    id: "tour-users",
    sidebarLabel: "Quản lý người dùng",
    href: "/users",
    title: "👥 Quản lý người dùng",
    desc: "Thêm mới, phân quyền và quản lý tài khoản của các thành viên trong hệ thống.",
    badge: "Admin",
    subSteps: [
      {
        tourId: "users-create",
        title: "🛡️ Tạo người dùng",
        desc: "Tạo tài khoản mới cho nhân viên. Bạn có thể phân quyền Admin hoặc User.",
      },
      {
        tourId: "users-filter",
        title: "🔍 Bộ lọc tìm kiếm",
        desc: "Lọc nhanh người dùng theo Trạng thái hoạt động hoặc theo Phòng ban.",
      }
    ],
  },
  {
    id: "tour-guide",
    sidebarLabel: "Hướng dẫn sử dụng",
    href: "/crm-guide",
    title: "📖 Hướng dẫn sử dụng",
    desc: "Tài liệu hướng dẫn chi tiết toàn bộ các tính năng của CRM360.",
    subSteps: [
      {
        tourId: "guide-tabs",
        title: "📚 Các mục hướng dẫn",
        desc: "Khám phá Hướng dẫn nhanh, xem Tất cả tính năng, hoặc xem Sơ đồ Mindmap tổng quan hệ thống.",
      },
      {
        tourId: "guide-tour-btn",
        title: "🎯 Xem lại Onboarding",
        desc: "Bất cứ lúc nào bạn cần, hãy bấm vào đây để xem lại toàn bộ hướng dẫn hệ thống này.",
      }
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
   Tooltip / arrow position calculation (pure functions)
────────────────────────────────────────────────────────────── */
export function calcTooltipStyle(
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

  const centerV = Math.max(
    20,
    Math.min(rect.top + rect.height / 2 - TOOLTIP_H / 2, window.innerHeight - TOOLTIP_H - 20)
  );
  const centerH = Math.max(
    20,
    Math.min(rect.left + rect.width / 2 - TOOLTIP_W / 2, window.innerWidth - TOOLTIP_W - 20)
  );

  switch (pos) {
    case "right":
      return { top: centerV, left: rect.right + p + margin };
    case "left":
  return { top: centerV, left: rect.left - p - margin - TOOLTIP_W };
    case "bottom":
      return { top: rect.bottom + p + margin, left: centerH };
    case "top":
      return { bottom: window.innerHeight - rect.top + p + margin, left: centerH, top: "auto" };
    default:
      return { top: centerV, left: rect.right + p + margin };
  }
}

export function getArrowStyle(
  rect: DOMRect,
  tooltipStyle: React.CSSProperties,
  p: number
): React.CSSProperties {
  if (
    tooltipStyle.left !== "auto" &&
    typeof tooltipStyle.left === "number" &&
    tooltipStyle.left < rect.left
  ) {
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
  const arrowLeft = Math.max(
    16,
    rect.left + rect.width / 2 - (typeof tooltipStyle.left === "number" ? tooltipStyle.left : 0) - 8
  );
  return { top: -8, left: arrowLeft, transform: "rotate(135deg)" };
}