# KẾ HOẠCH GĐ3 — SaaS Hoàn Chỉnh / Thương Mại Hóa

> Tài liệu phân tích chi tiết Giai đoạn 3 của hệ thống MedBoard  
> Ngày tạo: 2026-04-03  
> Trạng thái: DRAFT — Chờ duyệt trước khi triển khai

---

## 1. TỔNG QUAN GĐ3

### 1.1. Mục tiêu

Chuyển MedBoard từ **hệ thống quản lý nội trú đơn cơ sở** thành **nền tảng SaaS hoàn chỉnh** có khả năng:

- Phục vụ **nhiều bệnh viện/cơ sở** trên cùng hạ tầng (multi-tenant)
- **Thương mại hóa** với gói dịch vụ (Basic/Pro/Enterprise)
- **Tự động hóa** điều phối giường thông qua rule engine + AI
- **Tích hợp** hệ thống bên ngoài (HIS/EMR)
- **Kiểm soát** toàn diện với audit nâng cao và SLA monitoring

### 1.2. Phạm vi tính năng (từ Brief)

| # Brief | Tên tính năng | Phân hệ |
|---------|--------------|---------|
| 28 | Quy tắc phân bổ giường | Xếp giường & điều phối |
| 53 | Bắt buộc hoàn thành biểu mẫu (workflow gate) | Checklist / biểu mẫu |
| 68 | Cấu hình rule xếp giường | Danh mục & cấu hình |
| 69 | Quản lý nội dung hiển thị dashboard | Danh mục & cấu hình |
| 76 | Quản lý phiên đăng nhập | Bảo mật |
| 81 | Báo cáo theo khoa/phòng/bác sĩ | Báo cáo |
| 90 | Subdomain / domain riêng | SaaS nền tảng |
| 91 | Quản lý gói dịch vụ | SaaS nền tảng |
| 92 | Giới hạn tài nguyên theo gói | SaaS nền tảng |
| 93 | Kết nối HIS/EMR | Tích hợp |
| 96 | QR tại phòng/giường | Tích hợp |
| 97 | AI gợi ý xếp giường | AI & tự động |
| 98 | Rule engine nghiệp vụ | AI & tự động |
| 99 | Theo dõi SLA xử lý hồ sơ | Giám sát & vận hành |
| 100 | Audit nâng cao | Giám sát & vận hành |

**Tổng: 15 tính năng brief → chia thành 6 cụm triển khai**

### 1.3. Hiện trạng nền tảng (đã có)

| Hạng mục | Trạng thái |
|----------|-----------|
| Multi-tenant schema | ✅ Bảng `tenants` đã tạo, `users.tenant_id` đã có |
| Access Platform (module/capability/group/policy) | ✅ Đã triển khai đầy đủ |
| Role templates + 5-layer policy resolver | ✅ Hoạt động |
| Audit log cơ bản | ✅ `audit_logs` + `access_audit_logs` |
| System config key-value | ✅ `system_config` table |
| Notification service + web push | ✅ Cơ bản |
| Checklist template system | ✅ 7-item discharge checklist |
| Department-scoped data | ⚠️ Schema có, enforcement chưa đầy đủ |

---

## 2. KIẾN TRÚC KỸ THUẬT GĐ3

### 2.1. Sơ đồ hệ thống mục tiêu

```
┌─────────────────────────────────────────────────────────┐
│                    LOAD BALANCER / CDN                   │
│            (subdomain routing: *.medboard.vn)            │
├──────────┬─────────────┬──────────────┬─────────────────┤
│  BV An   │  BV Bình    │  BV Châu     │  Admin Portal   │
│  Giang   │  Dương      │  Đốc         │  (super-admin)  │
│  .medboard.vn          │              │                 │
├──────────┴─────────────┴──────────────┴─────────────────┤
│                    API GATEWAY                           │
│         (tenant resolution + rate limit + auth)          │
├──────────┬──────────────┬─────────────┬─────────────────┤
│  Core    │  Rule Engine │  AI Service │  Integration    │
│  API     │  (workflow)  │  (bed rec)  │  Hub (HIS/EMR)  │
├──────────┴──────────────┴─────────────┴─────────────────┤
│              MySQL (shared DB, tenant isolation)          │
│              + Redis (cache, session, queue)              │
└─────────────────────────────────────────────────────────┘
```

### 2.2. Thay đổi hạ tầng cần thiết

| Thành phần | Hiện tại | GĐ3 |
|-----------|---------|------|
| Database | MySQL single DB | MySQL + row-level tenant isolation |
| Cache | In-memory Map | Redis (session, cache, queue) |
| Web Server | IIS reverse proxy | IIS + wildcard SSL + subdomain routing |
| Background Jobs | Không có | Bull queue (Redis) cho SLA monitor, AI jobs |
| File Storage | Không có | Local/S3 cho báo cáo xuất file |

---

## 3. DANH SÁCH TÍNH NĂNG CHI TIẾT

### CỤM A — RULE ENGINE & TỰ ĐỘNG HÓA (Ưu tiên cao nhất)

> Nền tảng cho nhiều tính năng khác. Triển khai đầu tiên.

#### A1. Rule Engine nghiệp vụ (#98)

**Mục đích:** Hệ thống quy tắc có thể cấu hình, tự động thực thi theo sự kiện.

| Thành phần | Chi tiết |
|-----------|---------|
| **Bảng DB mới** | `rules`, `rule_conditions`, `rule_actions`, `rule_execution_logs` |
| **Rule Builder UI** | Admin tạo rule bằng giao diện kéo thả (IF condition THEN action) |
| **Event System** | Hook vào các sự kiện: patient_admitted, bed_assigned, discharge_requested, checklist_completed |
| **Condition Types** | So sánh field (==, >, <, contains), kiểm tra trạng thái, kiểm tra thời gian, kiểm tra capability |
| **Action Types** | Gửi notification, chuyển trạng thái, gán giường, chặn bước tiếp theo, ghi audit log |
| **Execution Mode** | Sync (chặn flow) hoặc Async (background queue) |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| A1.1 | Thiết kế schema `rules`, `rule_conditions`, `rule_actions` | DB | S |
| A1.2 | Tạo migration SQL cho rule engine tables | DB | S |
| A1.3 | Backend: Rule evaluation engine (condition parser + action executor) | BE | L |
| A1.4 | Backend: Event dispatcher (hook vào patient/bed/discharge flows) | BE | M |
| A1.5 | Backend: Rule CRUD API (create, update, delete, toggle, list) | BE | M |
| A1.6 | Backend: Rule execution log API | BE | S |
| A1.7 | Frontend: Rule Builder page (condition editor + action selector) | FE | L |
| A1.8 | Frontend: Rule execution log viewer | FE | S |
| A1.9 | Seed: Tạo 5 rule mẫu (phòng đầy → notify, checklist thiếu → chặn ra viện, etc.) | DB | S |

#### A2. Quy tắc phân bổ giường (#28, #68)

**Mục đích:** Cấu hình rule tự động xếp giường theo giới tính, chuyên khoa, mức ưu tiên.

| Thành phần | Chi tiết |
|-----------|---------|
| **Bảng DB mới** | `bed_allocation_rules` (priority, conditions_json, target_filter_json) |
| **Rule Conditions** | Giới tính bệnh nhân, khoa, loại phòng, số giường trống, tag bệnh nhân |
| **Target Filter** | Lọc phòng/giường theo room_type, department, floor, tag |
| **Scoring** | Mỗi rule cho điểm → chọn giường điểm cao nhất |
| **Fallback** | Nếu không có rule match → hiện danh sách giường trống như hiện tại |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| A2.1 | Schema `bed_allocation_rules` + migration | DB | S |
| A2.2 | Backend: Bed allocation scoring engine | BE | M |
| A2.3 | Backend: Hook vào assign bed flow (suggest + auto-assign mode) | BE | M |
| A2.4 | Backend: Allocation rule CRUD API | BE | S |
| A2.5 | Frontend: Allocation Rule config page (admin) | FE | M |
| A2.6 | Frontend: "Gợi ý giường thông minh" trong AssignBedModal | FE | M |
| A2.7 | Test: Unit test cho scoring engine | Test | S |

#### A3. Bắt buộc hoàn thành biểu mẫu — Workflow Gate (#53)

**Mục đích:** Chặn chuyển bước nếu checklist/biểu mẫu chưa hoàn thành.

| Thành phần | Chi tiết |
|-----------|---------|
| **Cơ chế** | Dùng Rule Engine (A1) với condition: checklist_status != 'complete' → action: block_transition |
| **Gate Points** | Trước ra viện, trước chuyển phòng, trước chuyển khoa |
| **UI** | Modal cảnh báo hiển thị mục còn thiếu khi user cố gắng thực hiện hành động bị chặn |
| **Config** | Admin bật/tắt gate cho từng bước qua System Config |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| A3.1 | Backend: Workflow gate middleware (kiểm tra rule trước khi thực hiện action) | BE | M |
| A3.2 | Backend: Gate check API (preview what's blocking) | BE | S |
| A3.3 | Frontend: BlockedActionModal (hiện lý do + mục thiếu) | FE | S |
| A3.4 | Tích hợp vào discharge flow + transfer flow | BE+FE | M |

---

### CỤM B — MULTI-TENANT & SaaS (Nền tảng thương mại)

#### B1. Multi-tenant hoàn chỉnh (#88, #89)

**Mục đích:** Mỗi bệnh viện/cơ sở dùng chung hệ thống nhưng dữ liệu tách biệt.

| Thành phần | Chi tiết |
|-----------|---------|
| **Tenant Resolution** | Middleware xác định tenant từ subdomain hoặc header `X-Tenant-ID` |
| **Data Isolation** | Tất cả query thêm `WHERE tenant_id = ?` (row-level isolation) |
| **Tenant Scoped Tables** | rooms, beds, patients, admissions, departments, checklist_templates, notifications, audit_logs |
| **Shared Tables** | users (cross-tenant admin), feature_modules, capabilities, system-level config |
| **Tenant Admin UI** | Super-admin tạo/quản lý tenant, view usage stats |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| B1.1 | Migration: Thêm `tenant_id` vào tất cả bảng chưa có | DB | M |
| B1.2 | Backend: Tenant resolution middleware (subdomain → tenant_id) | BE | M |
| B1.3 | Backend: Tenant-scoped DB helper (auto-inject tenant_id vào mọi query) | BE | L |
| B1.4 | Backend: Refactor tất cả service → dùng tenant-scoped query | BE | XL |
| B1.5 | Backend: Tenant CRUD API (super-admin) | BE | M |
| B1.6 | Frontend: Super Admin → Tenant Management page | FE | M |
| B1.7 | Frontend: Tenant switcher (cho super-admin) | FE | S |
| B1.8 | Migration: Seed 3 tenant mẫu + dữ liệu riêng | DB | M |
| B1.9 | Test: Kiểm tra data isolation giữa tenant | Test | M |

#### B2. Subdomain / Domain riêng (#90)

**Mục đích:** Mỗi đơn vị truy cập qua `bvangiang.medboard.vn` hoặc domain riêng.

| Thành phần | Chi tiết |
|-----------|---------|
| **IIS Config** | Wildcard binding `*.medboard.vn` + SSL Let's Encrypt wildcard |
| **DNS** | Wildcard A record `*.medboard.vn` → VPS IP |
| **Custom Domain** | CNAME mapping từ domain riêng → `tenantcode.medboard.vn` |
| **Tenant Resolution** | Parse subdomain → lookup tenant → set context |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| B2.1 | IIS: Cấu hình wildcard binding + SSL | Infra | M |
| B2.2 | DNS: Setup wildcard record | Infra | S |
| B2.3 | Backend: Subdomain parser middleware | BE | S |
| B2.4 | Backend: Custom domain lookup (bảng `tenant_domains`) | BE | S |
| B2.5 | Frontend: Login page hiển thị tên/logo tenant | FE | S |
| B2.6 | Admin: UI quản lý domain/subdomain cho tenant | FE | S |

#### B3. Quản lý gói dịch vụ (#91)

**Mục đích:** Phân chia Basic / Pro / Enterprise với feature set khác nhau.

| Thành phần | Chi tiết |
|-----------|---------|
| **Bảng DB mới** | `plans` (code, name, features_json, limits_json, price, billing_cycle) |
| **Mapping** | `tenants.plan_id` → plan |
| **Feature Control** | Dùng Access Platform đã có: module_entitlements ở cấp tenant |
| **Plan Features** | Basic: core modules only. Pro: + reports, checklist, notifications. Enterprise: + rule engine, AI, API access |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| B3.1 | Schema `plans` + migration + seed 3 plans | DB | S |
| B3.2 | Backend: Plan resolution (tenant → plan → enabled modules) | BE | M |
| B3.3 | Backend: Tích hợp plan vào Access Resolver (layer 0: plan trước role_template) | BE | M |
| B3.4 | Frontend: Plan Management page (super-admin) | FE | M |
| B3.5 | Frontend: Plan indicator trên tenant dashboard | FE | S |

#### B4. Giới hạn tài nguyên theo gói (#92)

**Mục đích:** Giới hạn số user, khoa, phòng, giường theo plan.

| Thành phần | Chi tiết |
|-----------|---------|
| **Limits Config** | `plans.limits_json`: `{ max_users, max_departments, max_rooms, max_beds, max_patients }` |
| **Enforcement** | Middleware kiểm tra trước khi tạo resource mới |
| **Warning** | Thông báo khi sắp đạt limit (80% threshold) |
| **Upgrade Prompt** | UI hiển thị modal "Nâng cấp gói" khi limit reached |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| B4.1 | Backend: Resource limit checker middleware | BE | M |
| B4.2 | Backend: Usage stats API (current count vs limit) | BE | S |
| B4.3 | Frontend: Usage dashboard widget (admin) | FE | S |
| B4.4 | Frontend: Limit reached modal + upgrade prompt | FE | S |

---

### CỤM C — AI & GỢI Ý THÔNG MINH

#### C1. AI gợi ý xếp giường (#97)

**Mục đích:** Dùng AI phân tích dữ liệu để gợi ý giường tối ưu.

| Thành phần | Chi tiết |
|-----------|---------|
| **Input Features** | Giới tính, tuổi, chẩn đoán, mức độ nặng, yêu cầu đặc biệt, lịch sử phòng |
| **Scoring Model** | Rule-based scoring (v1) → ML model (v2 nếu đủ data) |
| **Output** | Top 3-5 giường gợi ý với điểm + lý do |
| **Fallback** | Nếu AI service down → fallback về rule-based (A2) |
| **Learning** | Ghi nhận user chọn giường nào → cải thiện model |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| C1.1 | Backend: AI scoring service (rule-based v1) | BE | M |
| C1.2 | Backend: Feature extraction (patient context → scoring input) | BE | M |
| C1.3 | Backend: Recommendation API (`/api/beds/recommend?patient_id=X`) | BE | S |
| C1.4 | Backend: Feedback tracking (user chọn giường nào) | BE | S |
| C1.5 | Frontend: "Gợi ý AI" section trong AssignBedModal | FE | M |
| C1.6 | Frontend: Hiển thị điểm + lý do cho mỗi giường gợi ý | FE | S |

---

### CỤM D — BÁO CÁO & GIÁM SÁT NÂNG CAO

#### D1. Báo cáo theo khoa/phòng/bác sĩ (#81)

**Mục đích:** Drill-down báo cáo theo từng dimension.

| Thành phần | Chi tiết |
|-----------|---------|
| **Dimensions** | Khoa, Phòng, Bác sĩ, Khoảng thời gian |
| **Metrics** | Công suất giường, số nhập viện, số ra viện, thời gian nằm TB, hồ sơ thiếu |
| **Charts** | Bar chart so sánh khoa, line chart xu hướng, pie chart phân bổ |
| **Export** | PDF report với header bệnh viện + ngày tạo |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| D1.1 | Backend: Report aggregation API (group by department/room/doctor) | BE | M |
| D1.2 | Backend: PDF generation service (html-pdf hoặc puppeteer) | BE | M |
| D1.3 | Frontend: Report filter panel (chọn khoa, phòng, BS, date range) | FE | M |
| D1.4 | Frontend: Chart components (bar, line, pie) dùng Chart.js/Recharts | FE | M |
| D1.5 | Frontend: PDF export button + preview | FE | S |

#### D2. Theo dõi SLA xử lý hồ sơ (#99)

**Mục đích:** Đo thời gian xử lý từng bước → phát hiện bottleneck.

| Thành phần | Chi tiết |
|-----------|---------|
| **Bảng DB mới** | `sla_definitions` (step, max_duration_hours, warning_threshold_pct) |
| **Bảng DB mới** | `sla_tracking` (admission_id, step, started_at, completed_at, breached) |
| **Steps Tracked** | Tiếp nhận → xếp giường, xếp giường → khám, yêu cầu ra viện → hoàn tất checklist, checklist → xác nhận ra viện |
| **Alert** | Notification khi SLA sắp breach (warning) hoặc đã breach |
| **Dashboard** | SLA compliance rate, avg time per step, breach count |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| D2.1 | Schema `sla_definitions`, `sla_tracking` + migration | DB | S |
| D2.2 | Backend: SLA tracker service (hook vào status changes) | BE | M |
| D2.3 | Backend: SLA breach checker (cron job / background worker) | BE | M |
| D2.4 | Backend: SLA reporting API | BE | S |
| D2.5 | Frontend: SLA Config page (admin định nghĩa bước + thời gian) | FE | M |
| D2.6 | Frontend: SLA Dashboard widget (compliance rate, breaches) | FE | M |

#### D3. Audit nâng cao (#100)

**Mục đích:** Lưu vết thay đổi dữ liệu chi tiết (field-level diff).

| Thành phần | Chi tiết |
|-----------|---------|
| **Bảng DB mới** | `detailed_audit_logs` (entity_type, entity_id, field_name, old_value, new_value, changed_by, changed_at) |
| **Auto-capture** | Middleware tự ghi lại mọi UPDATE/DELETE với diff chi tiết |
| **Retention** | Configurable retention period (mặc định 1 năm, xoá auto) |
| **UI** | Timeline view cho từng entity (bệnh nhân, phòng, giường) |
| **Search** | Full-text search trong audit log |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| D3.1 | Schema `detailed_audit_logs` + index tối ưu | DB | S |
| D3.2 | Backend: Field-level diff middleware (auto-capture before/after) | BE | L |
| D3.3 | Backend: Audit search API (filter by entity, user, date, field) | BE | M |
| D3.4 | Backend: Retention job (cleanup old logs) | BE | S |
| D3.5 | Frontend: Entity timeline view (changes over time) | FE | M |
| D3.6 | Frontend: Advanced audit search page | FE | M |

---

### CỤM E — TÍCH HỢP BÊN NGOÀI

#### E1. Kết nối HIS/EMR (#93)

**Mục đích:** Đồng bộ dữ liệu bệnh nhân với hệ thống HIS/EMR hiện có.

| Thành phần | Chi tiết |
|-----------|---------|
| **Integration Hub** | Abstraction layer → adapter pattern cho từng hệ thống |
| **Protocol Support** | REST API, HL7 FHIR (standard y tế), file-based (CSV import) |
| **Sync Mode** | Real-time webhook hoặc scheduled polling |
| **Data Mapping** | Config mapping field HIS → MedBoard field |
| **Error Handling** | Retry queue, dead letter queue, alert on failure |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| E1.1 | Design: Integration hub architecture + adapter interface | Design | M |
| E1.2 | Schema: `integrations`, `integration_mappings`, `sync_logs` | DB | S |
| E1.3 | Backend: Integration hub core (adapter registry, sync orchestrator) | BE | L |
| E1.4 | Backend: REST adapter (generic webhook receiver/sender) | BE | M |
| E1.5 | Backend: CSV import adapter (upload + mapping + preview + import) | BE | M |
| E1.6 | Backend: Sync conflict resolution (newer wins, manual review queue) | BE | M |
| E1.7 | Frontend: Integration config page (setup adapter, mapping, schedule) | FE | L |
| E1.8 | Frontend: Sync status dashboard + error viewer | FE | M |

#### E2. QR tại phòng/giường (#96)

**Mục đích:** Quét QR để mở nhanh thông tin phòng/giường trên điện thoại.

| Thành phần | Chi tiết |
|-----------|---------|
| **QR Content** | URL: `https://{tenant}.medboard.vn/scan?type=bed&id=123` |
| **QR Generate** | Server-side generate PNG/SVG, batch print A4 sheet |
| **Scan Flow** | Mobile browser → auto-login check → redirect to bed/room detail |
| **Print Layout** | Nhãn QR có tên phòng + mã giường, A4 sheet nhiều nhãn |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| E2.1 | Backend: QR code generation API (qrcode lib) | BE | S |
| E2.2 | Backend: Batch QR generation (all beds in a room/department) | BE | S |
| E2.3 | Frontend: `/scan` route (resolve QR → redirect to bed/room detail) | FE | S |
| E2.4 | Frontend: QR print page (A4 layout with labels) | FE | M |
| E2.5 | Frontend: "In QR" button trên Room Detail page | FE | S |

---

### CỤM F — BẢO MẬT & DASHBOARD CONFIG

#### F1. Quản lý phiên đăng nhập (#76)

**Mục đích:** Kiểm soát đăng nhập đồng thời, bảo mật nâng cao.

| Thành phần | Chi tiết |
|-----------|---------|
| **Bảng DB mới** | `active_sessions` (user_id, token_hash, device_info, ip, created_at, last_active, expires_at) |
| **Single Session** | Config: cho phép 1 hoặc N session đồng thời |
| **Force Logout** | Admin hoặc user tự kick session khác |
| **Session Timeout** | Configurable idle timeout (dùng system_config đã có) |
| **Activity Tracking** | Cập nhật `last_active` mỗi request (throttled 1 phút) |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| F1.1 | Schema `active_sessions` + migration | DB | S |
| F1.2 | Backend: Session tracking middleware (create/update/validate) | BE | M |
| F1.3 | Backend: Session limit enforcement (kick oldest if over limit) | BE | S |
| F1.4 | Backend: Active sessions API (list, force logout) | BE | S |
| F1.5 | Frontend: "Phiên đăng nhập" section trong profile/admin | FE | M |
| F1.6 | Frontend: Force logout button + confirmation | FE | S |

#### F2. Quản lý nội dung hiển thị dashboard (#69)

**Mục đích:** Tùy chọn widget/chỉ số hiển thị cho từng đơn vị.

| Thành phần | Chi tiết |
|-----------|---------|
| **Bảng DB mới** | `dashboard_layouts` (tenant_id, user_id, layout_json) |
| **Widget Registry** | Danh sách widget có sẵn: occupancy, discharge_today, missing_records, sla_status, trend_chart |
| **Drag & Drop** | User kéo thả widget vào grid layout |
| **Default Layout** | Mỗi role có default layout, user có thể customize |

**Danh sách tasks:**

| # | Task | Loại | Ước lượng |
|---|------|------|-----------|
| F2.1 | Schema `dashboard_layouts` + migration | DB | S |
| F2.2 | Backend: Layout CRUD API (save/load per user or tenant) | BE | S |
| F2.3 | Backend: Widget data API (unified endpoint per widget type) | BE | M |
| F2.4 | Frontend: Dashboard grid layout engine (react-grid-layout) | FE | L |
| F2.5 | Frontend: Widget component registry + lazy loading | FE | M |
| F2.6 | Frontend: "Tùy chỉnh Dashboard" edit mode toggle | FE | M |

---

## 4. LỘ TRÌNH TRIỂN KHAI ĐỀ XUẤT

### Phase 3.1 — Nền tảng (tuần 1-6)

| Tuần | Cụm | Nội dung |
|------|-----|---------|
| 1-2 | A1 | Rule Engine core (schema + evaluation engine + event dispatcher) |
| 3 | A1 | Rule Builder UI + seed rules mẫu |
| 4 | A2 | Bed allocation rules + smart suggest trong AssignBedModal |
| 5 | A3 | Workflow gates (chặn ra viện khi chưa đủ checklist) |
| 6 | F1 | Session management + security hardening |

### Phase 3.2 — SaaS & Multi-tenant (tuần 7-12)

| Tuần | Cụm | Nội dung |
|------|-----|---------|
| 7-8 | B1 | Multi-tenant data isolation (migration + middleware + refactor services) |
| 9 | B2 | Subdomain routing + IIS wildcard config |
| 10 | B3 | Plan management + integration vào Access Resolver |
| 11 | B4 | Resource limits + usage dashboard |
| 12 | B1 | Testing tenant isolation + seed demo tenants |

### Phase 3.3 — Báo cáo & Giám sát (tuần 13-16)

| Tuần | Cụm | Nội dung |
|------|-----|---------|
| 13 | D1 | Advanced reports (multi-dimension + charts) |
| 14 | D2 | SLA tracking + breach alerts |
| 15 | D3 | Detailed audit (field-level diff + timeline) |
| 16 | F2 | Configurable dashboard (widget grid) |

### Phase 3.4 — AI & Tích hợp (tuần 17-22)

| Tuần | Cụm | Nội dung |
|------|-----|---------|
| 17-18 | C1 | AI bed recommendation (scoring v1 + UI) |
| 19-20 | E1 | Integration hub (core + REST adapter + CSV import) |
| 21 | E2 | QR code cho phòng/giường |
| 22 | — | Integration testing toàn bộ + performance tuning |

---

## 5. TỔNG HỢP TASKS

### Thống kê

| Cụm | Số tasks | BE | FE | DB | Infra | Test |
|-----|---------|----|----|-----|-------|------|
| A — Rule Engine & Tự động | 20 | 9 | 6 | 4 | 0 | 1 |
| B — Multi-tenant & SaaS | 19 | 9 | 5 | 3 | 2 | 1 |
| C — AI | 6 | 4 | 2 | 0 | 0 | 0 |
| D — Báo cáo & Giám sát | 17 | 8 | 6 | 3 | 0 | 0 |
| E — Tích hợp | 13 | 7 | 4 | 1 | 0 | 0 |
| F — Bảo mật & Dashboard | 12 | 5 | 5 | 2 | 0 | 0 |
| **TỔNG** | **87** | **42** | **28** | **13** | **2** | **2** |

### Ước lượng size

| Size | Ý nghĩa | Số tasks |
|------|---------|---------|
| S | < 1 ngày | 35 |
| M | 1-3 ngày | 38 |
| L | 3-5 ngày | 10 |
| XL | 5-10 ngày | 4 |

---

## 6. DEPENDENCIES & RISKS

### Dependencies (phải làm trước)

```
Rule Engine (A1) ──→ Bed Allocation Rules (A2)
                 ──→ Workflow Gates (A3)
                 ──→ SLA Tracking (D2)

Multi-tenant (B1) ──→ Subdomain (B2)
                  ──→ Plans (B3)
                  ──→ Resource Limits (B4)

Access Platform (đã có) ──→ Plans integration (B3)

Reports basic (đã có) ──→ Advanced Reports (D1)
```

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Multi-tenant refactor phức tạp | Cao | Bắt đầu từ middleware injection, không refactor DB schema |
| HIS/EMR mỗi nơi khác nhau | Cao | Adapter pattern, bắt đầu với REST generic + CSV |
| AI cần data để train | Trung bình | V1 dùng rule-based scoring, ML chỉ khi đủ data |
| Performance với nhiều tenant | Trung bình | Index on tenant_id, connection pool per tenant, Redis cache |
| IIS wildcard SSL | Thấp | Backup plan: path-based routing thay vì subdomain |

---

## 7. TIÊU CHÍ NGHIỆM THU GĐ3

| # | Tiêu chí | Verify |
|---|---------|--------|
| 1 | Admin tạo rule tự động xếp giường + rule chặn ra viện khi chưa đủ checklist | Demo flow |
| 2 | Tạo 3 tenant, mỗi tenant có data riêng biệt, không xem được data tenant khác | Test data isolation |
| 3 | Mỗi tenant truy cập qua subdomain riêng (`.medboard.vn`) | Browser test |
| 4 | Gói Basic/Pro/Enterprise hoạt động: Basic không thấy Reports module | Toggle test |
| 5 | AI gợi ý top 3 giường khi xếp bệnh nhân mới | Demo UI |
| 6 | Báo cáo drill-down theo khoa/BS + xuất PDF | Xuất file |
| 7 | SLA breach tự động gửi notification | Trigger test |
| 8 | Audit nâng cao: xem timeline thay đổi field của bệnh nhân | UI test |
| 9 | QR quét → mở thông tin giường trên điện thoại | Scan test |
| 10 | Session: admin kick phiên đăng nhập của user khác | Admin action |
