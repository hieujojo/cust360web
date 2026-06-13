export type MindMapNode = {
  id: string;
  title: string;
  level: number;
  parentId?: string | null;
  childrenIds: string[];
};

export const rootId = 'd826bd09-484b-4771-8c00-abb2f84a3710';

export const initialNodesData: MindMapNode[] = [
  {
    "id": "76c0e696-5164-4a6e-a693-13c6be3552ff",
    "title": "Bao gồm khoảng 26 tính năng, phân chia thành 6 module.",
    "level": 2,
    "parentId": "c368620a-d87f-49d5-bc4e-1ef37d7b9993",
    "childrenIds": []
  },
  {
    "id": "e458ee69-5e9e-449d-9e48-7e87c9a7f202",
    "title": "Hỗ trợ nền tảng Web và Mobile.",
    "level": 2,
    "parentId": "c368620a-d87f-49d5-bc4e-1ef37d7b9993",
    "childrenIds": []
  },
  {
    "id": "c50f75cc-9aa3-4ece-92c6-d53874d2fe73",
    "title": "Mục tiêu: tập trung, gọn nhẹ, hiệu quả.",
    "level": 2,
    "parentId": "c368620a-d87f-49d5-bc4e-1ef37d7b9993",
    "childrenIds": []
  },
  {
    "id": "c368620a-d87f-49d5-bc4e-1ef37d7b9993",
    "title": "Tổng quan",
    "level": 1,
    "parentId": "d826bd09-484b-4771-8c00-abb2f84a3710",
    "childrenIds": [
      "76c0e696-5164-4a6e-a693-13c6be3552ff",
      "e458ee69-5e9e-449d-9e48-7e87c9a7f202",
      "c50f75cc-9aa3-4ece-92c6-d53874d2fe73"
    ]
  },
  {
    "id": "12df7247-70c6-48cb-aed2-778813552660",
    "title": "Do Admin cấp, không có tự đăng ký hay Google OAuth.",
    "level": 3,
    "parentId": "500288cf-1544-4b47-b098-68443c7e9fe1",
    "childrenIds": []
  },
  {
    "id": "22e1a1b0-d2db-4a22-b9a3-9258ef191bd7",
    "title": "Flow đơn giản bằng mật khẩu phù hợp với môi trường tổ chức.",
    "level": 3,
    "parentId": "500288cf-1544-4b47-b098-68443c7e9fe1",
    "childrenIds": []
  },
  {
    "id": "500288cf-1544-4b47-b098-68443c7e9fe1",
    "title": "Tài khoản",
    "level": 2,
    "parentId": "ac78f2a1-a040-4c75-84ee-8eb083ed0f77",
    "childrenIds": [
      "12df7247-70c6-48cb-aed2-778813552660",
      "22e1a1b0-d2db-4a22-b9a3-9258ef191bd7"
    ]
  },
  {
    "id": "e3336efe-1021-402c-aacd-348aba05e5ac",
    "title": "Admin tạo tài khoản với email, role, phòng ban, tên, chức vụ, mật khẩu.",
    "level": 3,
    "parentId": "e4f9539f-8828-4037-93ac-3d9a2cfe748b",
    "childrenIds": []
  },
  {
    "id": "75060fda-7baa-4528-b747-3b4afc721254",
    "title": "Phân quyền dựa trên 3 role: Owner (1), Admin (2), User (3).",
    "level": 3,
    "parentId": "e4f9539f-8828-4037-93ac-3d9a2cfe748b",
    "childrenIds": []
  },
  {
    "id": "a78d3d1a-c876-49d6-a0f1-89b069398275",
    "title": "Phân quyền theo phòng ban: user chỉ thấy dữ liệu phòng mình; Owner & Admin thấy toàn bộ.",
    "level": 3,
    "parentId": "e4f9539f-8828-4037-93ac-3d9a2cfe748b",
    "childrenIds": []
  },
  {
    "id": "14332c53-a6e6-46c9-9d3b-ceab0f861aa3",
    "title": "Kích hoạt hoặc vô hiệu hóa tài khoản nhân viên; vô hiệu hóa khiến token bị từ chối ngay.",
    "level": 3,
    "parentId": "e4f9539f-8828-4037-93ac-3d9a2cfe748b",
    "childrenIds": []
  },
  {
    "id": "e4f9539f-8828-4037-93ac-3d9a2cfe748b",
    "title": "Các tính năng chính",
    "level": 2,
    "parentId": "ac78f2a1-a040-4c75-84ee-8eb083ed0f77",
    "childrenIds": [
      "e3336efe-1021-402c-aacd-348aba05e5ac",
      "75060fda-7baa-4528-b747-3b4afc721254",
      "a78d3d1a-c876-49d6-a0f1-89b069398275",
      "14332c53-a6e6-46c9-9d3b-ceab0f861aa3"
    ]
  },
  {
    "id": "ac78f2a1-a040-4c75-84ee-8eb083ed0f77",
    "title": "Module 1: Xác Thực & Phân Quyền (Authentication & Authorization)",
    "level": 1,
    "parentId": "d826bd09-484b-4771-8c00-abb2f84a3710",
    "childrenIds": [
      "500288cf-1544-4b47-b098-68443c7e9fe1",
      "e4f9539f-8828-4037-93ac-3d9a2cfe748b"
    ]
  },
  {
    "id": "e8700036-1324-46dd-846d-438665667803",
    "title": "Tất cả tính năng xoay quanh tài liệu khách hàng trong MongoDB.",
    "level": 3,
    "parentId": "76025053-db3f-401a-87fb-9285a185c9e3",
    "childrenIds": []
  },
  {
    "id": "5c9a69b4-6552-4a5a-9fc8-45eb88407010",
    "title": "Phân quyền kết hợp Role & Department.",
    "level": 3,
    "parentId": "76025053-db3f-401a-87fb-9285a185c9e3",
    "childrenIds": []
  },
  {
    "id": "76025053-db3f-401a-87fb-9285a185c9e3",
    "title": "Khách hàng là trung tâm hệ thống",
    "level": 2,
    "parentId": "9c255033-35bf-43d4-b761-e2f835c953aa",
    "childrenIds": [
      "e8700036-1324-46dd-846d-438665667803",
      "5c9a69b4-6552-4a5a-9fc8-45eb88407010"
    ]
  },
  {
    "id": "bca53915-a66b-4f10-9884-1f37abd0e606",
    "title": "Hồ sơ khách hàng: tên, mã tự sinh, trạng thái, nguồn, người sở hữu, phòng ban, trường tuỳ chỉnh.",
    "level": 3,
    "parentId": "4770516b-0cdc-48f7-98d7-47ac0279d93a",
    "childrenIds": []
  },
  {
    "id": "f52377c7-ea27-4fe9-9ca9-1c03064ac0b3",
    "title": "Phân quyền xem theo Role (User giới hạn phòng, Admin & Owner toàn quyền).",
    "level": 3,
    "parentId": "4770516b-0cdc-48f7-98d7-47ac0279d93a",
    "childrenIds": []
  },
  {
    "id": "5793efaf-7a7f-4b97-b7ee-a3772ff58091",
    "title": "Tìm kiếm khách hàng full-text, hỗ trợ lỗi gõ, kết quả nhanh.",
    "level": 3,
    "parentId": "4770516b-0cdc-48f7-98d7-47ac0279d93a",
    "childrenIds": []
  },
  {
    "id": "be800ff5-627e-468d-b9f5-1083d763dd70",
    "title": "Danh sách khách hàng có sắp xếp, lọc.",
    "level": 3,
    "parentId": "4770516b-0cdc-48f7-98d7-47ac0279d93a",
    "childrenIds": []
  },
  {
    "id": "e3a42d4b-4a13-4b11-b624-4c60a3937a74",
    "title": "Customer 360 view gồm tab thông tin, liên hệ, giao dịch, lịch sử, ticket.",
    "level": 3,
    "parentId": "4770516b-0cdc-48f7-98d7-47ac0279d93a",
    "childrenIds": []
  },
  {
    "id": "e7ee1824-5ab5-495b-a5d8-5b8be507f26d",
    "title": "Contact nhúng trong khách hàng với nhiều contact, có trường chi tiết.",
    "level": 3,
    "parentId": "4770516b-0cdc-48f7-98d7-47ac0279d93a",
    "childrenIds": []
  },
  {
    "id": "7aefa016-dedf-4908-bb70-509b8fc4acdc",
    "title": "Thay đổi trạng thái khách hàng với log hoạt động tự động.",
    "level": 3,
    "parentId": "4770516b-0cdc-48f7-98d7-47ac0279d93a",
    "childrenIds": []
  },
  {
    "id": "4770516b-0cdc-48f7-98d7-47ac0279d93a",
    "title": "Tính năng chính",
    "level": 2,
    "parentId": "9c255033-35bf-43d4-b761-e2f835c953aa",
    "childrenIds": [
      "bca53915-a66b-4f10-9884-1f37abd0e606",
      "f52377c7-ea27-4fe9-9ca9-1c03064ac0b3",
      "5793efaf-7a7f-4b97-b7ee-a3772ff58091",
      "be800ff5-627e-468d-b9f5-1083d763dd70",
      "e3a42d4b-4a13-4b11-b624-4c60a3937a74",
      "e7ee1824-5ab5-495b-a5d8-5b8be507f26d",
      "7aefa016-dedf-4908-bb70-509b8fc4acdc"
    ]
  },
  {
    "id": "9c255033-35bf-43d4-b761-e2f835c953aa",
    "title": "Module 2: Quản Lý Khách Hàng (Customer Management)",
    "level": 1,
    "parentId": "d826bd09-484b-4771-8c00-abb2f84a3710",
    "childrenIds": [
      "76025053-db3f-401a-87fb-9285a185c9e3",
      "4770516b-0cdc-48f7-98d7-47ac0279d93a"
    ]
  },
  {
    "id": "d04068fd-9a21-478d-be56-4b0f761792b6",
    "title": "Quy trình hiển thị trực quan, có bảng Kanban realtime.",
    "level": 3,
    "parentId": "6861e82f-1834-4cc8-88f5-68f7d027e427",
    "childrenIds": []
  },
  {
    "id": "05032140-0307-44cc-936d-43072fd63c52",
    "title": "Hỗ trợ báo giá nhanh từ giao dịch.",
    "level": 3,
    "parentId": "6861e82f-1834-4cc8-88f5-68f7d027e427",
    "childrenIds": []
  },
  {
    "id": "6861e82f-1834-4cc8-88f5-68f7d027e427",
    "title": "Đặc điểm nổi bật",
    "level": 2,
    "parentId": "a99f6a6e-6aed-431d-b135-61443af1f79e",
    "childrenIds": [
      "d04068fd-9a21-478d-be56-4b0f761792b6",
      "05032140-0307-44cc-936d-43072fd63c52"
    ]
  },
  {
    "id": "895fcc3f-d784-4559-a42f-1ee2f8a4e8d4",
    "title": "Tạo/ sửa giao dịch với thông tin chi tiết và form rút gọn trên mobile.",
    "level": 3,
    "parentId": "60b9cea8-6835-4cf8-9b43-b79fc902c660",
    "childrenIds": []
  },
  {
    "id": "670a02df-7ce2-4eb5-8184-78e3bdcc475c",
    "title": "Cấu hình các giai đoạn pipeline bởi admin.",
    "level": 3,
    "parentId": "60b9cea8-6835-4cf8-9b43-b79fc902c660",
    "childrenIds": []
  },
  {
    "id": "00460d41-00a6-4617-863e-8a10553e8ed2",
    "title": "Kanban board kéo thả trực quan (web).",
    "level": 3,
    "parentId": "60b9cea8-6835-4cf8-9b43-b79fc902c660",
    "childrenIds": []
  },
  {
    "id": "27353cd9-ed60-48d0-8bfe-4cb23751e7f0",
    "title": "Danh sách giao dịch với bộ lọc, sắp xếp, xem chi tiết.",
    "level": 3,
    "parentId": "60b9cea8-6835-4cf8-9b43-b79fc902c660",
    "childrenIds": []
  },
  {
    "id": "9c93fe13-9ab2-4af7-aa96-a265eee47435",
    "title": "Trang chi tiết giao dịch có đầy đủ timeline, lịch sử giai đoạn, liên hệ, báo giá.",
    "level": 3,
    "parentId": "60b9cea8-6835-4cf8-9b43-b79fc902c660",
    "childrenIds": []
  },
  {
    "id": "60b9cea8-6835-4cf8-9b43-b79fc902c660",
    "title": "Tính năng",
    "level": 2,
    "parentId": "a99f6a6e-6aed-431d-b135-61443af1f79e",
    "childrenIds": [
      "895fcc3f-d784-4559-a42f-1ee2f8a4e8d4",
      "670a02df-7ce2-4eb5-8184-78e3bdcc475c",
      "00460d41-00a6-4617-863e-8a10553e8ed2",
      "27353cd9-ed60-48d0-8bfe-4cb23751e7f0",
      "9c93fe13-9ab2-4af7-aa96-a265eee47435"
    ]
  },
  {
    "id": "a99f6a6e-6aed-431d-b135-61443af1f79e",
    "title": "Module 3: Quy Trình Bán Hàng & Giao Dịch (Sales Pipeline & Deals)",
    "level": 1,
    "parentId": "d826bd09-484b-4771-8c00-abb2f84a3710",
    "childrenIds": [
      "6861e82f-1834-4cc8-88f5-68f7d027e427",
      "60b9cea8-6835-4cf8-9b43-b79fc902c660"
    ]
  },
  {
    "id": "7cc793bd-d0ef-49bd-a52e-57dc3131c03b",
    "title": "Ghi nhật ký cuộc gọi, email, cuộc họp, ghi chú với các trường chi tiết.",
    "level": 3,
    "parentId": "8c0d0d9b-4995-41b5-b5f6-86142c7cd0f0",
    "childrenIds": []
  },
  {
    "id": "ad952ca6-8b0c-4eb9-a6ca-da1f159eb1a0",
    "title": "Tự động ghi các sự kiện hệ thống như thay đổi giai đoạn, tạo/giải quyết ticket.",
    "level": 3,
    "parentId": "8c0d0d9b-4995-41b5-b5f6-86142c7cd0f0",
    "childrenIds": []
  },
  {
    "id": "794d291f-d77e-4e50-980b-13d57fa00368",
    "title": "Giao diện timeline theo thứ tự thời gian, có icon, tên người log, hỗ trợ kéo cuộn vô tận.",
    "level": 3,
    "parentId": "8c0d0d9b-4995-41b5-b5f6-86142c7cd0f0",
    "childrenIds": []
  },
  {
    "id": "6d3a3798-4dd0-419d-9463-29609e864cc7",
    "title": "Đồng bộ tự động Gmail & Google Calendar cho email và cuộc họp liên quan khách hàng mà không cần thao tác thủ công.",
    "level": 3,
    "parentId": "8c0d0d9b-4995-41b5-b5f6-86142c7cd0f0",
    "childrenIds": []
  },
  {
    "id": "8c0d0d9b-4995-41b5-b5f6-86142c7cd0f0",
    "title": "Tính năng log",
    "level": 2,
    "parentId": "b594e94e-3e3b-47ef-8b4f-240cc784ac05",
    "childrenIds": [
      "7cc793bd-d0ef-49bd-a52e-57dc3131c03b",
      "ad952ca6-8b0c-4eb9-a6ca-da1f159eb1a0",
      "794d291f-d77e-4e50-980b-13d57fa00368",
      "6d3a3798-4dd0-419d-9463-29609e864cc7"
    ]
  },
  {
    "id": "b594e94e-3e3b-47ef-8b4f-240cc784ac05",
    "title": "Module 4: Nhật Ký Hoạt Động & Lịch Sử Khách Hàng",
    "level": 1,
    "parentId": "d826bd09-484b-4771-8c00-abb2f84a3710",
    "childrenIds": [
      "8c0d0d9b-4995-41b5-b5f6-86142c7cd0f0"
    ]
  },
  {
    "id": "90993b29-5e79-47f2-bb58-b626308dce9a",
    "title": "Trung tâm thông báo trong ứng dụng với biểu tượng chuông, số lượng thông báo chưa đọc.",
    "level": 3,
    "parentId": "74eddf77-5b50-4f80-a632-d05c70eef935",
    "childrenIds": []
  },
  {
    "id": "3c27e7b6-f971-4670-81f5-067fd82894da",
    "title": "Đồng bộ realtime pipeline khi giao dịch thay đổi giai đoạn, mọi user cùng tổ chức thấy ngay.",
    "level": 3,
    "parentId": "74eddf77-5b50-4f80-a632-d05c70eef935",
    "childrenIds": []
  },
  {
    "id": "cf1b7d28-5286-4899-8075-171dd253782d",
    "title": "Thông báo khi giao dịch được phân công người chịu trách nhiệm cả trên web và mobile.",
    "level": 3,
    "parentId": "74eddf77-5b50-4f80-a632-d05c70eef935",
    "childrenIds": []
  },
  {
    "id": "74eddf77-5b50-4f80-a632-d05c70eef935",
    "title": "Các tính năng realtime",
    "level": 2,
    "parentId": "8d0de3fa-d77e-4e3d-a71a-9b9e00e1cedc",
    "childrenIds": [
      "90993b29-5e79-47f2-bb58-b626308dce9a",
      "3c27e7b6-f971-4670-81f5-067fd82894da",
      "cf1b7d28-5286-4899-8075-171dd253782d"
    ]
  },
  {
    "id": "8d0de3fa-d77e-4e3d-a71a-9b9e00e1cedc",
    "title": "Module 5: Realtime & Thông Báo",
    "level": 1,
    "parentId": "d826bd09-484b-4771-8c00-abb2f84a3710",
    "childrenIds": [
      "74eddf77-5b50-4f80-a632-d05c70eef935"
    ]
  },
  {
    "id": "36489d8a-d88d-4c61-a964-65e382313fad",
    "title": "Quản lý hồ sơ tổ chức: tên, logo, múi giờ, tiền tệ, ngôn ngữ.",
    "level": 3,
    "parentId": "4b04ba76-fb7e-406d-9b69-7f34d6ec372d",
    "childrenIds": []
  },
  {
    "id": "8bbb1c8f-4126-4bb6-884d-ecc2680d2fac",
    "title": "Quản lý phòng ban: thêm, sửa, xoá, gán quản lý phòng.",
    "level": 3,
    "parentId": "4b04ba76-fb7e-406d-9b69-7f34d6ec372d",
    "childrenIds": []
  },
  {
    "id": "b2618c58-bdfc-4849-b47d-f831d220055e",
    "title": "Quản lý người dùng: danh sách, tạo tài khoản, vô hiệu hóa, đặt lại mật khẩu.",
    "level": 3,
    "parentId": "4b04ba76-fb7e-406d-9b69-7f34d6ec372d",
    "childrenIds": []
  },
  {
    "id": "5341302d-61df-4e74-a61f-76a22799fdb8",
    "title": "Cấu hình giai đoạn pipeline: thêm, đổi tên, sắp xếp, màu sắc, xác định ngưỡng thời gian stuck.",
    "level": 3,
    "parentId": "4b04ba76-fb7e-406d-9b69-7f34d6ec372d",
    "childrenIds": []
  },
  {
    "id": "4b04ba76-fb7e-406d-9b69-7f34d6ec372d",
    "title": "Cấu hình tổ chức",
    "level": 2,
    "parentId": "304c717d-46f3-4fd2-a354-30cb034a7f89",
    "childrenIds": [
      "36489d8a-d88d-4c61-a964-65e382313fad",
      "8bbb1c8f-4126-4bb6-884d-ecc2680d2fac",
      "b2618c58-bdfc-4849-b47d-f831d220055e",
      "5341302d-61df-4e74-a61f-76a22799fdb8"
    ]
  },
  {
    "id": "304c717d-46f3-4fd2-a354-30cb034a7f89",
    "title": "Module 6: Cấu Hình & Quản Trị",
    "level": 1,
    "parentId": "d826bd09-484b-4771-8c00-abb2f84a3710",
    "childrenIds": [
      "4b04ba76-fb7e-406d-9b69-7f34d6ec372d"
    ]
  },
  {
    "id": "2f4a2e97-c1ac-409a-8c5e-854ff8b28c9a",
    "title": "P0 (quan trọng nhất): 19 tính năng",
    "level": 3,
    "parentId": "db825d52-f8fc-4ed6-970f-027bca50fa7c",
    "childrenIds": []
  },
  {
    "id": "b3aacafc-8c1a-44b3-8957-0ca0d2562a3f",
    "title": "P1 + P2 (cao & trung bình): 7 tính năng",
    "level": 3,
    "parentId": "db825d52-f8fc-4ed6-970f-027bca50fa7c",
    "childrenIds": []
  },
  {
    "id": "211194ce-b60c-49eb-bc6b-4fa25e0c6f04",
    "title": "Không có tính năng P3 (mức nâng cao) được đưa vào giai đoạn hiện tại.",
    "level": 3,
    "parentId": "db825d52-f8fc-4ed6-970f-027bca50fa7c",
    "childrenIds": []
  },
  {
    "id": "db825d52-f8fc-4ed6-970f-027bca50fa7c",
    "title": "Tổng 26 tính năng, phân bổ ưu tiên:",
    "level": 2,
    "parentId": "3270259b-c5f0-481a-8fc5-f931995c6135",
    "childrenIds": [
      "2f4a2e97-c1ac-409a-8c5e-854ff8b28c9a",
      "b3aacafc-8c1a-44b3-8957-0ca0d2562a3f",
      "211194ce-b60c-49eb-bc6b-4fa25e0c6f04"
    ]
  },
  {
    "id": "cf359edf-a2e1-469d-9f68-3a32c1fadd3f",
    "title": "Web + Mobile: Modules 1, 2, 4, 5",
    "level": 3,
    "parentId": "973a50d7-c1bb-4328-9e41-875737198f1f",
    "childrenIds": []
  },
  {
    "id": "9eec8342-5576-4724-9433-ec53603817a8",
    "title": "Web (kanban) và Mobile (list): Module 3",
    "level": 3,
    "parentId": "973a50d7-c1bb-4328-9e41-875737198f1f",
    "childrenIds": []
  },
  {
    "id": "7c1296b6-4290-4a7d-b7d4-e04782067ba4",
    "title": "Chỉ Web: Module 6",
    "level": 3,
    "parentId": "973a50d7-c1bb-4328-9e41-875737198f1f",
    "childrenIds": []
  },
  {
    "id": "973a50d7-c1bb-4328-9e41-875737198f1f",
    "title": "Phân bố tính năng trên nền tảng:",
    "level": 2,
    "parentId": "3270259b-c5f0-481a-8fc5-f931995c6135",
    "childrenIds": [
      "cf359edf-a2e1-469d-9f68-3a32c1fadd3f",
      "9eec8342-5576-4724-9433-ec53603817a8",
      "7c1296b6-4290-4a7d-b7d4-e04782067ba4"
    ]
  },
  {
    "id": "3270259b-c5f0-481a-8fc5-f931995c6135",
    "title": "Tóm tắt ma trận tính năng",
    "level": 1,
    "parentId": "d826bd09-484b-4771-8c00-abb2f84a3710",
    "childrenIds": [
      "db825d52-f8fc-4ed6-970f-027bca50fa7c",
      "973a50d7-c1bb-4328-9e41-875737198f1f"
    ]
  },
  {
    "id": "8360092a-90d6-4793-bdb2-1cb06fa6aa4d",
    "title": "P0: Không có thì không thể ra mắt, xây dựng đầu tiên và đúng cách.",
    "level": 2,
    "parentId": "32728b6b-020d-44ea-92a5-eae5b1f16e98",
    "childrenIds": []
  },
  {
    "id": "7e483bed-ff54-40ee-a4f9-292130e1f3be",
    "title": "P1: Cần thiết cho hiệu quả công việc hàng ngày, xây dựng trong các pha đầu.",
    "level": 2,
    "parentId": "32728b6b-020d-44ea-92a5-eae5b1f16e98",
    "childrenIds": []
  },
  {
    "id": "82b13e10-a575-4304-be2f-b65bd2bc5218",
    "title": "P2: Tạo sự khác biệt, phát triển khi các yếu tố P0, P1 đã ổn định.",
    "level": 2,
    "parentId": "32728b6b-020d-44ea-92a5-eae5b1f16e98",
    "childrenIds": []
  },
  {
    "id": "b3a88f71-53e0-4327-883b-a07f25d351bb",
    "title": "P3: Giá trị lâu dài, xây dựng khi có phản hồi người dùng hoặc có thời gian.",
    "level": 2,
    "parentId": "32728b6b-020d-44ea-92a5-eae5b1f16e98",
    "childrenIds": []
  },
  {
    "id": "32728b6b-020d-44ea-92a5-eae5b1f16e98",
    "title": "Nguyên tắc ưu tiên phát triển tính năng",
    "level": 1,
    "parentId": "d826bd09-484b-4771-8c00-abb2f84a3710",
    "childrenIds": [
      "8360092a-90d6-4793-bdb2-1cb06fa6aa4d",
      "7e483bed-ff54-40ee-a4f9-292130e1f3be",
      "82b13e10-a575-4304-be2f-b65bd2bc5218",
      "b3a88f71-53e0-4327-883b-a07f25d351bb"
    ]
  },
  {
    "id": "d826bd09-484b-4771-8c00-abb2f84a3710",
    "title": "CRM CUSTOMER 360 - Tính Năng",
    "level": 0,
    "parentId": null,
    "childrenIds": [
      "c368620a-d87f-49d5-bc4e-1ef37d7b9993",
      "ac78f2a1-a040-4c75-84ee-8eb083ed0f77",
      "9c255033-35bf-43d4-b761-e2f835c953aa",
      "a99f6a6e-6aed-431d-b135-61443af1f79e",
      "b594e94e-3e3b-47ef-8b4f-240cc784ac05",
      "8d0de3fa-d77e-4e3d-a71a-9b9e00e1cedc",
      "304c717d-46f3-4fd2-a354-30cb034a7f89",
      "3270259b-c5f0-481a-8fc5-f931995c6135",
      "32728b6b-020d-44ea-92a5-eae5b1f16e98"
    ]
  }
];
