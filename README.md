# CRM Customer 360

Hệ thống CRM Customer 360 — quản lý khách hàng, sales pipeline, hoạt động và thông báo realtime cho tổ chức. Dự án Web được build bằng **Next.js 15**.

> **Lưu ý:** Mobile app hiện đang **pending**, README này chỉ mô tả phạm vi Web.

## Tech Stack

- **Frontend:** Next.js 15 (App Router)
- **Backend API:** ASP.NET Core (Authorization policies enforce ở API layer)
- **Database:** MongoDB
- **Search:** Atlas Search (Lucene-based, full-text, typo-tolerant)
- **Realtime:** Firestore Realtime Listener (pipeline sync, notifications)
- **Kanban DnD:** dnd-kit
- **File storage:** S3 (logo, attachments)
- **Email/Calendar Integration:** Gmail & Google Calendar OAuth (auto-sync activity)

## Phân quyền (Roles)

| Role | Mô tả |
| --- | --- |
| Role 1 — Owner | Toàn quyền trên hệ thống |
| Role 2 — Admin | Xem & quản lý toàn bộ dữ liệu |
| Role 3 — User | Chỉ xem customers/deals thuộc department được gán |

Phân quyền theo Role + Department, enforce ở API layer (không chỉ ẩn UI).

## Modules & Features (Web)

### Module 1: Authentication & Authorization
- **Admin tạo tài khoản** (P0) — Admin tạo account (email, role, department, tên, chức vụ, password), hệ thống gửi email thông báo. Không có self-register hay Google OAuth.
- **Role-Based Access Control** (P0) — 3 roles (Owner/Admin/User), enforce bằng ASP.NET Core Authorization policies ở API layer.
- **Department-based Scoping** (P1) — User chỉ thấy data thuộc department mình; Owner/Admin thấy toàn bộ.
- **Activate / Deactivate User** (P1) — Vô hiệu hóa account nhân viên nghỉ, `isActive=false` → reject token ngay, không xóa data.

### Module 2: Customer Management (Trung tâm hệ thống)
Customer là entity trung tâm, lưu trong MongoDB, phân quyền theo Role + Department.

- **Customer Profile** (P0) — Name, Code (auto-gen), Status (Lead/Active/Inactive/Churned), Source, Owner, Department, Custom Fields.
- **Phân quyền theo Role** (P0) — User: chỉ dept mình; Admin: toàn bộ; Owner: toàn quyền.
- **Customer Search** (P0) — Full-text search Atlas Search: name, phone, email, code, typo-tolerant, < 200ms.
- **Customer List View** (P0) — Table sort (Name/Status/Owner/Created date), filter (Status, Owner).
- **Customer 360 View** (P0) — Tab: INFO / CONTACTS / DEALS / TIMELINE / TICKETS, sidebar quick actions + open deals + active tickets.
- **Contacts (Embedded)** (P0) — Nhiều contacts/customer, fields: Name, Role, Email, Phone, isPrimary, embed trong customer doc.
- **Customer Status** (P1) — Lead → Active → Inactive → Churned, tự log activity khi đổi status.

### Module 3: Sales Pipeline & Deals
- **Create / Edit Deal** (P0) — Title, Customer, Value, Currency, Expected Close Date, Owner, Stage, Probability, ghi chú.
- **Pipeline Stages Config** (P0) — Admin cấu hình stages trong Settings, lưu trong `organizations.pipelineStages`, áp dụng realtime không cần restart.
- **Kanban Board** (P0) — dnd-kit drag-and-drop, deal card hiển thị Customer, Value, Owner avatar, Days in stage (badge đỏ nếu stuck quá threshold).
- **Deal List View** (P0) — Table sort/filter.
- **Deal Detail Page** (P0) — Full info, activity timeline, stage history, contacts liên kết, quotations list.

### Module 4: Activity Log & Customer Timeline
- **Log Call / Email / Meeting / Note** (P0) — 1 form, 4 loại (chọn type đổi fields tương ứng).
- **Auto-log System Events** (P1) — Deal stage change, ticket created/resolved tự insert activity, hiện trong Timeline với badge "Auto".
- **Customer Timeline UI** (P0) — Chronological feed, icon theo type, infinite scroll, group by date.
- **Gmail & Calendar Auto-Sync** (P2) — OAuth Gmail + Google Calendar, tự pull email/meeting liên quan contact của customer (match theo email address) thành activity entry, badge "Auto · Gmail" / "Auto · Calendar".

### Module 5: Realtime & Notifications
- **In-App Notification Center** (P1) — Bell icon + badge count, dropdown read/unread, mark all read, max 50 notifications.
- **Pipeline Realtime Sync** (P1) — Deal move → ghi event vào Firestore `pipeline_events/{orgId}` → mọi user cùng org thấy realtime trên Kanban.
- **Deal Assignment Notify** (P1) — Deal assign → ghi notification doc trên Firestore → in-app bell update realtime.

### Module 6: Settings & Administration
Settings cấp Organization (không phải Tenant/SaaS), mỗi org tự cấu hình.

- **Organization Profile** (P0) — Company name, Logo (S3), Timezone, Currency, Language — hiển thị toàn UI và PDF báo giá.
- **Department Management** (P0) — Thêm/sửa/xóa departments, gán Manager, lưu trong `organizations.departments`.
- **User Management** (P0) — List users (active/inactive/pending), tạo user (email+role+dept+temp password), deactivate, reset password.
- **Pipeline Stages Config** (P0) — Add/rename/reorder/delete stages, set màu, default probability, stuck threshold (days), realtime.

## Priority Legend

| Priority | Ý nghĩa |
| --- | --- |
| **P0** | Critical — Must Have, build first |
| **P1** | High — Should Have, Phase 1-2 |
| **P2** | Medium — Could Have, sau khi P0+P1 stable |
| **P3** | Advanced — Nice to Have, theo feedback |

## Feature Summary (Web)

| Module | Total Features | P0 | P1+P2 |
| --- | --- | --- | --- |
| 1 — Auth & Authorization | 4 | 2 | 2 |
| 2 — Customer Management | 7 | 6 | 1 |
| 3 — Sales Pipeline & Deals | 5 | 5 | 0 |
| 4 — Activity Log | 3 | 2 | 1 |
| 5 — Realtime & Notifications | 3 | 0 | 3 |
| 6 — Settings & Admin | 4 | 4 | 0 |
| **Tổng** | **26** | **19** | **7** |

---
*Spec version 3.0 | 2025*