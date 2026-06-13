export type Priority = "P0" | "P1" | "P2" | "P3";

export const priorityConfig: Record<Priority, { label: string; bg: string; color: string }> = {
  P0: { label: "Cốt lõi", bg: "#FEE2E2", color: "#B91C1C" },
  P1: { label: "Quan trọng", bg: "#FEF3C7", color: "#B45309" },
  P2: { label: "Nâng cao", bg: "#E0E7FF", color: "#4338CA" },
  P3: { label: "Tùy chọn", bg: "#F3F4F6", color: "#374151" },
};

export type Feature = {
  name: string;
  platform: string;
  description: string;
  salesTip?: string;
  priority: Priority;
};

export type Module = {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  features: Feature[];
};

// ─── Data ────────────────────────────────────────────────────────────────────

export const modules: Module[] = [
  {
    id: 1,
    title: "Đăng nhập & Phân quyền",
    subtitle: "Authentication & Authorization",
    icon: "🔐",
    color: "#6366F1",
    features: [
      {
        name: "Admin tạo tài khoản",
        priority: "P0",
        platform: "Web",
        description:
          "Admin tạo tài khoản cho bạn với Email, Role, Department và password. Hệ thống gửi email thông báo tự động.",
        salesTip:
          "Liên hệ Admin nếu bạn chưa nhận được email kích hoạt hoặc cần đổi department.",
      },
      {
        name: "Phân quyền theo Role",
        priority: "P0",
        platform: "Web",
        description:
          "3 cấp quyền: Role 1 Owner (toàn quyền), Role 2 Admin (quản lý), Role 3 User (xem department của mình).",
        salesTip:
          "Là Sales (Role 3), bạn chỉ thấy khách hàng trong department của mình — đây là thiết kế, không phải lỗi.",
      },
      {
        name: "Giới hạn theo Department",
        priority: "P0",
        platform: "Web",
        description:
          "Bạn chỉ thấy khách hàng và deal thuộc department được gán. Owner và Admin thấy toàn bộ hệ thống.",
      },
      {
        name: "Kích hoạt / Vô hiệu hóa tài khoản",
        priority: "P0",
        platform: "Web",
        description:
          "Admin có thể vô hiệu hóa tài khoản nhân viên đã nghỉ. Token bị từ chối ngay lập tức, dữ liệu được giữ nguyên.",
      },
    ],
  },
  {
    id: 2,
    title: "Quản lý Khách hàng",
    subtitle: "Customer Management — Trung tâm hệ thống",
    icon: "👥",
    color: "#0EA5E9",
    features: [
      {
        name: "Hồ sơ Khách hàng",
        priority: "P0",
        platform: "Web",
        description:
          "Thông tin đầy đủ: Tên, Mã khách hàng (tự động tạo), Trạng thái (Lead/Active/Inactive/Churned), Nguồn, Người phụ trách, Department và Custom Fields.",
        salesTip:
          "Điền đầy đủ Nguồn khách hàng giúp team phân tích hiệu quả kênh bán hàng.",
      },
      {
        name: "Tìm kiếm Khách hàng",
        priority: "P0",
        platform: "Web",
        description:
          "Full-text search với Atlas Search (Lucene): tìm theo tên, số điện thoại, email, mã khách hàng. Chịu lỗi gõ, kết quả trả về dưới 200ms.",
        salesTip:
          'Gõ một phần tên hoặc số điện thoại là đủ — công cụ tìm kiếm rất "thông minh" với lỗi chính tả.',
      },
      {
        name: "Danh sách Khách hàng",
        priority: "P0",
        platform: "Web",
        description:
          "Bảng có sort theo Tên, Trạng thái, Người phụ trách, Ngày tạo. Lọc theo Trạng thái và Người phụ trách.",
      },
      {
        name: "Customer 360 View",
        priority: "P0",
        platform: "Web",
        description:
          "Giao diện tabbed gồm: INFO — CONTACTS — DEALS — TIMELINE — TICKETS. Sidebar hiển thị quick actions, deals đang mở và tickets đang xử lý.",
        salesTip:
          "Đây là màn hình quan trọng nhất. Trước cuộc gọi, hãy mở tab TIMELINE để nắm lịch sử tương tác với khách.",
      },
      {
        name: "Quản lý Contacts",
        priority: "P0",
        platform: "Web",
        description:
          "Mỗi khách hàng có nhiều contacts. Các trường: Tên, Vai trò, Email, Điện thoại, isPrimary. Lưu trực tiếp trong hồ sơ khách hàng.",
        salesTip:
          "Đánh dấu isPrimary cho đầu mối chính để team biết ai cần liên hệ trước.",
      },
      {
        name: "Cập nhật Trạng thái",
        priority: "P0",
        platform: "Web",
        description:
          "Chuyển trạng thái: Lead → Active → Inactive → Churned. Hệ thống tự ghi nhật ký khi trạng thái thay đổi.",
        salesTip:
          "Luôn cập nhật trạng thái đúng — báo cáo pipeline phụ thuộc vào dữ liệu này.",
      },
    ],
  },
  {
    id: 3,
    title: "Sales Pipeline & Deals",
    subtitle: "Quản lý cơ hội bán hàng",
    icon: "💼",
    color: "#F59E0B",
    features: [
      {
        name: "Tạo / Sửa Deal",
        priority: "P0",
        platform: "Web",
        description:
          "Điền: Tiêu đề, Khách hàng, Giá trị, Tiền tệ, Ngày dự kiến đóng, Người phụ trách, Stage, Xác suất, Ghi chú.",
        salesTip:
          "Điền Ngày dự kiến đóng chính xác để Manager lập kế hoạch doanh thu hàng tháng.",
      },
      {
        name: "Kanban Board",
        priority: "P0",
        platform: "Web",
        description:
          "Kéo thả deal giữa các stage (dnd-kit). Card hiển thị: Khách hàng, Giá trị, Avatar người phụ trách, Số ngày trong stage (badge đỏ nếu bị stuck quá hạn).",
        salesTip:
          "Badge đỏ = deal đang bị 'kẹt' quá lâu tại một stage. Ưu tiên xử lý ngay để không mất cơ hội.",
      },
      {
        name: "Danh sách Deal",
        priority: "P0",
        platform: "Web",
        description: "Bảng sort/filter theo stage, người phụ trách, giá trị, ngày đóng.",
      },
      {
        name: "Deal Detail Page",
        priority: "P0",
        platform: "Web",
        description:
          "Xem đầy đủ: Thông tin deal + Timeline hoạt động + Lịch sử stage + Contacts liên kết + Danh sách báo giá.",
      },
      {
        name: "Cấu hình Pipeline Stages",
        priority: "P0",
        platform: "Web (Admin only)",
        description:
          "Admin cấu hình các stage trong Settings: thêm, đổi tên, sắp xếp lại, xóa stage. Đặt màu, xác suất mặc định và ngưỡng stuck. Thay đổi có hiệu lực ngay.",
      },
    ],
  },
  {
    id: 4,
    title: "Nhật ký Hoạt động & Timeline",
    subtitle: "Activity Log & Customer Timeline",
    icon: "📋",
    color: "#10B981",
    features: [
      {
        name: "Ghi nhật ký Cuộc gọi / Email / Họp / Ghi chú",
        priority: "P0",
        platform: "Web",
        description:
          "1 form, 4 loại (chọn type để đổi fields). Cuộc gọi: kết quả + thời lượng + ghi chú. Email: tiêu đề + tóm tắt. Họp: địa điểm + người tham dự + tóm tắt + bước tiếp theo. Ghi chú: văn bản tự do.",
        salesTip:
          "Log ngay sau mỗi tương tác — không cần đợi cuối ngày. Timeline đầy đủ giúp toàn team nắm được bức tranh khách hàng.",
      },
      {
        name: "Customer Timeline UI",
        priority: "P0",
        platform: "Web",
        description:
          "Feed theo thứ tự thời gian: icon theo loại, tên người log, timestamp. Cuộn vô hạn. Nhóm theo ngày.",
      },
      {
        name: "Tự động ghi sự kiện hệ thống",
        priority: "P0",
        platform: "Web",
        description:
          "Khi deal chuyển stage, ticket được tạo/giải quyết → hệ thống tự ghi vào Timeline với badge 'Auto'. Bạn không cần làm gì.",
        salesTip:
          "Các mục 'Auto' giúp bạn theo dõi toàn bộ lịch sử mà không tốn thêm thao tác.",
      },
      {
        name: "Đồng bộ Gmail & Google Calendar",
        priority: "P0",
        platform: "Web",
        description:
          "Kết nối OAuth Gmail + Google Calendar. Hệ thống tự pull email và cuộc họp liên quan đến khách hàng → tạo activity entry tự động. Badge 'Auto · Gmail' hoặc 'Auto · Calendar'. Chỉ sync email/event có địa chỉ email khớp với contacts của khách hàng.",
        salesTip:
          "Sau khi kết nối Gmail, mọi email trao đổi với khách hàng sẽ xuất hiện tự động trong Timeline — không cần copy-paste thủ công.",
      },
    ],
  },
  {
    id: 5,
    title: "Realtime & Thông báo",
    subtitle: "Notifications & Live Sync",
    icon: "🔔",
    color: "#8B5CF6",
    features: [
      {
        name: "Trung tâm Thông báo In-App",
        priority: "P0",
        platform: "Web",
        description:
          "Icon chuông + badge đếm số chưa đọc. Dropdown: đọc/chưa đọc, click để chuyển đến ngữ cảnh liên quan. Đánh dấu tất cả đã đọc. Hiển thị tối đa 50 thông báo.",
      },
      {
        name: "Đồng bộ Pipeline Realtime",
        priority: "P0",
        platform: "Web",
        description:
          "Khi deal được di chuyển → mọi người trong cùng tổ chức thấy ngay lập tức. Card animate sang cột mới trên Kanban Board.",
        salesTip:
          "Kanban của bạn luôn là bản mới nhất — không cần refresh trang.",
      },
      {
        name: "Thông báo khi Deal được giao",
        priority: "P0",
        platform: "Web",
        description:
          "Khi deal được giao cho bạn → bell cập nhật realtime trên Web với tên khách hàng và giá trị deal.",
      },
    ],
  },
  {
    id: 6,
    title: "Cài đặt & Quản trị",
    subtitle: "Settings & Administration",
    icon: "⚙️",
    color: "#64748B",
    features: [
      {
        name: "Hồ sơ Tổ chức",
        priority: "P0",
        platform: "Web (Admin only)",
        description:
          "Tên công ty, Logo (upload S3), Múi giờ, Tiền tệ, Ngôn ngữ. Hiển thị trên toàn bộ UI và PDF báo giá.",
      },
      {
        name: "Quản lý Department",
        priority: "P0",
        platform: "Web (Admin only)",
        description:
          "Thêm, sửa, xóa departments. Gán Manager cho từng department.",
      },
      {
        name: "Quản lý Người dùng",
        priority: "P0",
        platform: "Web (Admin only)",
        description:
          "Danh sách users: active/inactive/pending. Tạo user (email + role + dept + mật khẩu tạm). Vô hiệu hóa. Reset mật khẩu.",
      },
      {
        name: "Cấu hình Pipeline Stages",
        priority: "P0",
        platform: "Web (Admin only)",
        description:
          "Thêm, đổi tên, sắp xếp, xóa stages. Đặt màu, xác suất mặc định, ngưỡng stuck (ngày). Thay đổi có hiệu lực ngay, không cần restart.",
      },
    ],
  },
];

// Quy trình dành cho người dùng lần đầu — bắt đầu từ Settings (cấu hình tổ chức)
// trước khi đụng tới dữ liệu khách hàng/deal.
export const quickGuideSteps = [
  {
    step: "01",
    title: "Đăng nhập lần đầu",
    desc: "Dùng email và mật khẩu tạm do Admin cấp. Kiểm tra email để nhận thông tin tài khoản, sau đó đổi mật khẩu nếu được yêu cầu.",
  },
  {
    step: "02",
    title: "Kiểm tra Hồ sơ Tổ chức (Admin)",
    desc: "Vào Settings → Hồ sơ Tổ chức: cập nhật tên công ty, logo, múi giờ, tiền tệ, ngôn ngữ. Thông tin này hiển thị trên toàn hệ thống và PDF báo giá.",
  },
  {
    step: "03",
    title: "Tạo Department & Người dùng (Admin)",
    desc: "Vào Settings → Department để tạo các phòng ban, gán Manager. Sau đó vào Quản lý Người dùng để tạo tài khoản cho từng nhân viên Sales với role và department phù hợp.",
  },
  {
    step: "04",
    title: "Cấu hình Pipeline Stages (Admin)",
    desc: "Vào Settings → Pipeline Stages để thiết lập các giai đoạn bán hàng (stage), màu sắc, xác suất mặc định và ngưỡng cảnh báo 'stuck'. Đây là nền tảng cho Kanban Board.",
  },
  {
    step: "05",
    title: "Tạo khách hàng đầu tiên",
    desc: "Vào Khách hàng → Tạo mới. Điền tên, nguồn, người phụ trách, department. Hệ thống tự tạo mã khách hàng.",
  },
  {
    step: "06",
    title: "Thêm Contacts cho khách hàng",
    desc: "Trong Customer 360, mở tab CONTACTS để thêm người liên hệ. Đánh dấu isPrimary cho đầu mối chính.",
  },
  {
    step: "07",
    title: "Tạo Deal đầu tiên",
    desc: "Trong Customer 360, mở tab DEALS → Tạo deal mới. Điền giá trị, ngày dự kiến đóng, stage, người phụ trách.",
  },
  {
    step: "08",
    title: "Dùng Kanban Board",
    desc: "Vào Pipeline → Kanban Board để kéo thả deal giữa các stage. Chú ý badge đỏ — deal đang bị 'kẹt' quá lâu cần xử lý gấp.",
  },
  {
    step: "09",
    title: "Log hoạt động vào Timeline",
    desc: "Sau mỗi cuộc gọi/email/họp với khách hàng, mở tab TIMELINE và log ngay. Chọn đúng loại (Cuộc gọi/Email/Họp/Ghi chú) để fields phù hợp hiện ra.",
  },
  {
    step: "10",
    title: "Theo dõi Thông báo",
    desc: "Xem icon chuông ở góc trên để nhận thông báo realtime khi có deal được giao cho bạn hoặc pipeline thay đổi.",
  },
];