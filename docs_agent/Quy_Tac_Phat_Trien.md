# MedBoard — QUY CHẾ NỘI BỘ: AI-ASSISTED SOFTWARE DEVELOPMENT STANDARD

Tài liệu này tổng hợp các yêu cầu công việc và các tiêu chuẩn kỹ thuật hiện tại của dự án MedBoard (SaaS quản lý bệnh nhân – phòng – giường – hồ sơ – ra viện) để đảm bảo code luôn sạch, dễ bảo trì và làm việc nhóm hiệu quả.

---

## 0) Thông tin dự án & Hạ tầng

### 0.1. Tech Stack

| Lớp | Công nghệ |
|---|---|
| **Frontend** | React 19 + TypeScript, Vite, SCSS/BEM, React Router |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | MySQL |
| **ORM** | Prisma hoặc TypeORM (chốt khi setup) |
| **Authentication** | JWT (access token + refresh token) |
| **Testing** | Vitest / Jest, React Testing Library |
| **Linting** | ESLint + Prettier |

### 0.2. Hạ tầng triển khai

| Mục | Chi tiết |
|---|---|
| **VPS** | Windows Server, IP: `160.30.113.26` |
| **Web Server** | IIS (Internet Information Services) |
| **Port ứng dụng** | `3011` (⚠️ **PHẢI HỎI trước khi dùng port khác** — VPS chạy nhiều dịch vụ, tránh xung đột) |
| **Database** | MySQL trên cùng VPS hoặc server riêng |
| **Deployment** | Git-based: dev push code → từ VPS pull code về → build → chạy qua IIS |
| **Reverse Proxy** | IIS reverse proxy trỏ vào Node.js app chạy port `3011` |

### 0.3. Quy trình triển khai

```
Dev local → git push → VPS git pull → npm install → npm run build → IIS restart
```

1. Developer code và test ở local
2. Push code lên Git (nhánh feature hoặc main)
3. Từ VPS, pull code về
4. Cài dependencies: `npm install`
5. Build production: `npm run build`
6. IIS tự chạy Node.js qua iisnode hoặc reverse proxy

### 0.4. Quy tắc port & tài nguyên VPS

- **Port `3011`** đã được phân bổ cho MedBoard
- **TUYỆT ĐỐI KHÔNG** tự ý mở port mới mà chưa xin phép
- Mọi port mới phải được xác nhận trước khi sử dụng
- Khi cần port cho dev server, database, hoặc service phụ → hỏi trước
- Ghi rõ port đang dùng trong `.env` và tài liệu

### 0.5. Phương pháp phát triển

- **Code tính năng nào, test tính năng đó luôn** — không gom lại test sau
- Mỗi feature phải chạy được end-to-end (UI → API → DB) trước khi chuyển feature tiếp
- Feature đầu tiên: **Login** — để test luồng UI + Backend + Database xuyên suốt

---

## 1) Mục đích tài liệu

Tài liệu này quy định cách team sử dụng AI trong phát triển phần mềm để đạt 4 mục tiêu:

- Tăng tốc độ triển khai
- Giữ chất lượng kỹ thuật
- Giảm rủi ro sai nghiệp vụ, sai bảo mật, sai kiến trúc
- Bảo đảm mọi thay đổi vẫn có người chịu trách nhiệm cuối cùng

**Nguyên tắc lõi:** AI là công cụ hỗ trợ kỹ sư, **không phải chủ thể tự quyết nghiệp vụ, bảo mật, kiến trúc hoặc chất lượng phát hành**. Code sinh bởi AI phải luôn được review và test giống hệt code người viết.

---

## 2) Phạm vi áp dụng

Áp dụng cho toàn bộ hoạt động:

- Phân tích yêu cầu kỹ thuật
- Thiết kế cấu trúc code
- Viết code frontend (React + TypeScript, SCSS)
- Viết code backend (Node.js + Express + TypeScript)
- Thiết kế và quản lý database (MySQL)
- Viết test (Vitest/Jest, React Testing Library)
- Review code
- Sửa bug
- Refactor
- Tạo tài liệu kỹ thuật
- Chuẩn bị release và deploy

---

## 3) Vai trò và trách nhiệm

### 3.1. Vai trò của con người

#### Developer
- Chịu trách nhiệm chính cho thay đổi mình tạo ra
- Xác minh code AI sinh ra trước khi commit
- Không được merge code mà bản thân không hiểu
- Phải test các flow chính liên quan (cả FE lẫn BE)

#### Tech Lead / Reviewer
- Kiểm tra kiến trúc, boundary, naming, maintainability
- Kiểm tra tính đúng nghiệp vụ
- Chặn merge nếu code chỉ "chạy được" nhưng rủi ro cao

### 3.2. Vai trò của AI

AI chỉ được xem là trợ lý. AI **không** được xem là người quyết nghiệp vụ, chốt kiến trúc cuối cùng, review cuối cùng, xác nhận bảo mật, hoặc tự động merge/release.

---

## 4) Nguyên tắc bất di bất dịch

### 4.1. Ưu tiên quyết định

1. Đúng nghiệp vụ
2. Đúng dữ liệu và trạng thái
3. Dễ bảo trì
4. Dễ test
5. Rõ cấu trúc
6. Trải nghiệm người dùng
7. Tốc độ code

### 4.2. Các nguyên tắc cứng

- Không merge code mà người phụ trách không hiểu
- Không để AI tự bịa business rule
- Không hardcode logic nghiệp vụ trong UI nếu đó là rule hệ thống
- Mọi code AI sinh ra phải được review giống như code người viết
- Mọi thay đổi có ảnh hưởng dữ liệu, quyền hạn, approval, báo cáo phải có reviewer con người

---

## 5) Chính sách dùng AI trong dự án

### 5.1. Được phép dùng AI cho

- Scaffold file mới theo pattern có sẵn
- Tạo component UI theo design system (SCSS/BEM)
- Tạo form cơ bản, CRUD API
- Tạo custom hooks, services, middleware
- Tạo migration database, model/entity
- Tạo test skeleton
- Refactor, viết docs, phân tích lỗi

### 5.2. Không được dùng AI một mình cho

- Thay đổi schema database quan trọng mà không có người review
- Thay đổi permission/role logic (auth middleware, guard routes)
- Sinh code bảo mật, auth, encryption mà không review sâu
- Tự sửa hàng loạt toàn repo mà không kiểm soát diff
- Merge PR, deploy production

---

## 6) Quy trình chuẩn: Code → Test → Push → Deploy

### Bước 1 — Lập kế hoạch feature
Nêu rõ: sửa/thêm file nào, data flow, ảnh hưởng gì.

### Bước 2 — Viết code (cả FE + BE cho feature đó)
- Đúng domain, đúng pattern, đúng naming, đúng cấu trúc folder
- Có loading/empty/error state (FE)
- Có validate input (cả FE lẫn BE)
- Có error handling chuẩn (BE)

### Bước 3 — Test ngay feature vừa code
- Chạy local, test thủ công luồng chính
- Chạy unit/integration test nếu có
- Fix bug ngay trước khi chuyển feature mới

### Bước 4 — Push Git
- Commit message rõ ràng theo convention
- Push lên nhánh feature hoặc main

### Bước 5 — Deploy trên VPS
- SSH/RDP vào VPS → `git pull` → `npm install` → `npm run build`
- IIS tự phục vụ, kiểm tra trên browser

---

## 7) Kiến Trúc Dự Án (Monorepo hoặc tách folder)

### 7.1. Cấu trúc tổng quan

```text
medboard/
  ├── client/                   # Frontend (React + TypeScript + Vite)
  │   ├── src/
  │   │   ├── components/       # Component dùng chung
  │   │   │   └── [ComponentName]/
  │   │   │       ├── ComponentName.tsx
  │   │   │       └── ComponentName.module.scss
  │   │   ├── features/         # Logic theo domain
  │   │   │   ├── auth/
  │   │   │   ├── patients/
  │   │   │   ├── beds/
  │   │   │   ├── rooms/
  │   │   │   ├── discharge/
  │   │   │   └── dashboard/
  │   │   ├── pages/            # Page composition
  │   │   ├── hooks/            # Custom hooks dùng chung
  │   │   ├── contexts/         # React Context (Auth, Toast...)
  │   │   ├── services/         # API client layer
  │   │   │   ├── httpClient.ts
  │   │   │   └── api/
  │   │   ├── types/            # TypeScript interfaces/types dùng chung
  │   │   ├── utils/            # Helper functions
  │   │   ├── styles/           # SCSS tokens, mixins, base
  │   │   │   ├── abstracts/
  │   │   │   ├── base/
  │   │   │   └── themes/
  │   │   ├── App.tsx
  │   │   ├── Router.tsx
  │   │   └── main.tsx
  │   ├── public/
  │   ├── index.html
  │   ├── vite.config.ts
  │   ├── tsconfig.json
  │   └── package.json
  │
  ├── server/                   # Backend (Node.js + Express + TypeScript)
  │   ├── src/
  │   │   ├── config/           # Database config, env config
  │   │   ├── middleware/       # Auth, error handler, validation
  │   │   ├── modules/          # Feature modules
  │   │   │   ├── auth/
  │   │   │   │   ├── auth.controller.ts
  │   │   │   │   ├── auth.service.ts
  │   │   │   │   ├── auth.routes.ts
  │   │   │   │   ├── auth.validator.ts
  │   │   │   │   └── auth.types.ts
  │   │   │   ├── patients/
  │   │   │   ├── beds/
  │   │   │   ├── rooms/
  │   │   │   └── discharge/
  │   │   ├── shared/           # Shared utilities, constants
  │   │   ├── database/         # Migrations, seeds
  │   │   └── app.ts            # Express app entry
  │   ├── tsconfig.json
  │   └── package.json
  │
  ├── shared/                   # Types/interfaces dùng chung FE + BE
  │   └── types/
  │       ├── patient.ts
  │       ├── bed.ts
  │       ├── room.ts
  │       └── auth.ts
  │
  ├── .env.example
  ├── .gitignore
  └── README.md
```

### 7.2. Quy tắc từng lớp

- **`client/`** — Frontend React + TypeScript. Chỉ lo UI, gọi API, không chứa business logic nặng.
- **`server/`** — Backend Express + TypeScript. Lo business logic, auth, validation, database.
- **`shared/`** — TypeScript types/interfaces dùng chung giữa FE và BE. Đảm bảo contract nhất quán.

---

## 8) Chuẩn TypeScript

### 8.1. Luật bắt buộc

- **Strict mode ON:** `tsconfig.json` phải có `"strict": true`
- **Không dùng `any`** trừ khi có lý do rõ ràng và ghi comment giải thích
- **Interface cho mọi entity:** Patient, Bed, Room, Admission... phải có interface rõ ràng
- **Props phải typed:** Mọi component React phải khai báo kiểu props rõ ràng
- **API response phải typed:** Mọi response từ backend phải có interface
- **Enum hoặc const object cho status:** Không hardcode string status rải rác

### 8.2. Ví dụ

```typescript
// ✅ Đúng
export enum BedStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
  LOCKED = 'locked',
}

export interface Bed {
  id: number;
  code: string;
  roomId: number;
  status: BedStatus;
  currentPatientId?: number;
  createdAt: string;
  updatedAt: string;
}

interface BedCardProps {
  bed: Bed;
  onSelect: (bedId: number) => void;
  isHighlighted?: boolean;
}

// ❌ Sai
const bed: any = fetchBed();
if (bed.status === 'avail') { ... }
```

---

## 9) Chuẩn Backend (Node.js + Express + TypeScript)

### 9.1. Module pattern

Mỗi module (auth, patients, beds, rooms, discharge...) phải có:

```text
modules/[feature]/
  [feature].controller.ts    # Nhận request, gọi service, trả response
  [feature].service.ts       # Business logic, gọi database
  [feature].routes.ts        # Đăng ký routes
  [feature].validator.ts     # Validate input (Zod / Joi / class-validator)
  [feature].types.ts         # Types riêng của module (nếu cần)
```

### 9.2. Luật backend

- **Controller** chỉ lo nhận request và trả response. KHÔNG chứa business logic.
- **Service** chứa business logic. KHÔNG biết về `req`, `res`.
- **Validator** chạy trước controller. Input không hợp lệ → trả 400/422 ngay.
- **Middleware auth** bảo vệ route. Không để route quan trọng không có guard.
- **Error handler** tập trung: mọi error phải đi qua middleware error handler chung.

### 9.3. Luật database (MySQL)

- **Dùng migrations** để quản lý schema — KHÔNG sửa database bằng tay
- **Schema phải review** trước khi apply lên production
- Mọi bảng phải có: `id`, `created_at`, `updated_at`
- Bảng có workflow phải có `status`
- **Foreign key** phải khai báo rõ ràng
- **Index** cho các cột hay query (status, room_id, patient_id...)
- Đặt tên bảng: snake_case, số nhiều (ví dụ: `patients`, `beds`, `rooms`)
- Đặt tên cột: snake_case (ví dụ: `patient_id`, `created_at`)

### 9.4. Luật bảo mật

- Cấm hardcode secret, token, password trong code
- Mọi config nằm trong `.env`, cập nhật `.env.example`
- Password phải hash (bcrypt)
- JWT secret phải đủ mạnh, lưu trong `.env`
- Validate input ở cả FE lẫn BE — **không tin client**
- SQL injection protection qua ORM/prepared statements

---

## 10) Chuẩn Frontend (React + TypeScript + SCSS)

### 10.1. Luật component

- **Functional Components 100%** với React Hooks
- **Props phải typed** — không dùng `any` cho props
- **Tách biệt Mock Data** — không hardcode data dài trong component
- **ErrorBoundary** ở cấp app
- **Không nhét business logic phức tạp vào component** — tách ra hook hoặc service

### 10.2. Component phải có đầy đủ state

- Default, Loading, Empty, Error
- Long text, Narrow viewport (mobile)

Với form: Pristine, Dirty, Invalid, Submitting, Success/Error response

### 10.3. API layer

- Gọi API chỉ qua `services/api/` hoặc custom hook
- Component KHÔNG được gọi `fetch`/`axios` trực tiếp
- Response phải typed
- Error phải qua parser chung

---

## 11) Chuẩn Domain & Data Model

### 11.1. Entity chính

- `User` — người dùng hệ thống (bác sĩ, điều dưỡng, quản lý, nhân viên hồ sơ, admin)
- `Organization` — đơn vị sử dụng (bệnh viện, cơ sở)
- `Department` — khoa / phòng ban
- `Ward` — khu điều trị
- `Room` — phòng bệnh
- `Bed` — giường bệnh
- `Patient` — bệnh nhân nội trú
- `Admission` — lượt nhập viện (gắn bệnh nhân – phòng – giường)
- `DischargeRecord` — hồ sơ ra viện
- `DischargeChecklist` — checklist kiểm tra hồ sơ trước ra viện
- `BedTransfer` — lịch sử chuyển giường / chuyển phòng
- `AuditLog` — nhật ký hệ thống
- `Report` — báo cáo tổng hợp (công suất, ra viện, hồ sơ thiếu)

### 11.2. Quy tắc domain

- **Admission** khác **Patient** — một bệnh nhân có thể có nhiều lượt nhập viện
- **DischargeRecord** là kết quả quy trình, không phải nơi nhập dữ liệu gốc
- **Report** là tổng hợp, không phải nơi nhập dữ liệu gốc
- **BedTransfer** là sự kiện, cần ngày/giờ/lý do/phòng cũ/phòng mới rõ ràng
- Giường luôn thuộc Phòng, Phòng thuộc Khoa/Khu
- Mọi trạng thái phải rõ ràng, rule chuyển trạng thái phải nhất quán

### 11.3. Business rules phải rõ ràng

- Giường đang có người thì không được xếp trùng?
- Hồ sơ ra viện chưa đủ checklist thì có cho xác nhận ra viện không?
- Ai được quyền xác nhận hoàn tất ra viện?
- Phòng đầy thì cảnh báo gì? Có chặn xếp giường không?

---

## 12) Chuẩn CSS/SCSS (BEM)

- **Không viết inline-style** trừ dynamic style tính toán bởi JS
- **Sử dụng SCSS + BEM** (hoặc CSS Modules `.module.scss`)
- **Mỗi component có SCSS riêng** — đặt cạnh file `.tsx`
- Tránh selector global (`div`, `span`) ghi đè layout
- Ưu tiên `@use` thay vì `@import` cho shared variables/mixins
- SCSS tokens (màu, spacing, radius, shadow) tập trung ở `styles/abstracts/`

---

## 13) Chuẩn Validation

### Frontend
- Validate form trước khi submit (Zod / Yup / manual)
- Disabled submit khi đang submitting
- Map error 422 từ server về field tương ứng

### Backend
- Validate input ở middleware trước khi vào controller
- Trả error 400/422 với message rõ ràng theo field

### Validate bắt buộc cho:

- Đăng nhập (Login)
- Tiếp nhận bệnh nhân (Admission)
- Xếp giường / chuyển giường (BedAssignment / BedTransfer)
- Checklist hồ sơ ra viện (DischargeChecklist)
- Xác nhận ra viện (DischargeRecord)
- Tạo/sửa phòng – giường (Room / Bed)

---

## 14) Chuẩn Test

- **Code tính năng nào, test tính năng đó luôn**
- Test luồng chính end-to-end trước khi push
- Unit test cho: helper, mapper, validator, business logic thuần
- Integration test cho: form submit, API endpoint, auth flow
- E2E (nếu áp dụng): Đăng nhập, xếp giường, ra viện, dashboard

---

## 15) Quản Lý Biến Môi Trường

```env
# .env.example

# Server
PORT=3011
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medboard
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Frontend
VITE_API_URL=http://localhost:3011/api
```

- Mọi config thay đổi theo môi trường phải nằm trong `.env`
- Cập nhật `.env.example` khi thêm biến mới
- **Cấm hardcode URL, token, secret trong source code**

---

## 16) Chuẩn Branch, Commit, Deploy

### 16.1. Branch naming

```txt
feat/ten-tinh-nang       # Tính năng mới
fix/ten-loi              # Sửa bug
refactor/ten-module      # Refactor
chore/ten-viec           # Config, dependencies
```

### 16.2. Commit naming

```txt
feat(auth): thêm login API và UI
feat(bed-map): thêm sơ đồ trực quan phòng–giường
fix(discharge): sửa logic kiểm tra checklist
refactor(components): tách DataTable thành sub-components
chore(deps): cập nhật vite
```

### 16.3. Deploy flow

```
git push origin main → VPS: git pull → npm install → npm run build → IIS restart
```

---

## 17) Chuẩn API Design

### 17.1. RESTful conventions

```
GET    /api/patients          # Danh sách bệnh nhân
GET    /api/patients/:id      # Chi tiết bệnh nhân
POST   /api/patients          # Tạo mới
PUT    /api/patients/:id      # Cập nhật
DELETE /api/patients/:id      # Xóa

POST   /api/auth/login        # Đăng nhập
POST   /api/auth/logout       # Đăng xuất
GET    /api/auth/me            # Thông tin user hiện tại
```

### 17.2. Response format chuẩn

```typescript
// Thành công
{
  "success": true,
  "data": { ... },
  "message": "Thao tác thành công"
}

// Lỗi
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [
      { "field": "email", "message": "Email không đúng định dạng" }
    ]
  }
}
```

### 17.3. HTTP Status codes

| Code | Ý nghĩa |
|---|---|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Bad request (input sai) |
| 401 | Unauthorized (chưa đăng nhập) |
| 403 | Forbidden (không có quyền) |
| 404 | Không tìm thấy |
| 422 | Validation error |
| 500 | Server error |

---

## 18) Naming conventions

| Thành phần | Quy tắc | Ví dụ |
|---|---|---|
| Component file | PascalCase `.tsx` | `PatientTable.tsx`, `BedCard.tsx` |
| Component name | PascalCase | `PatientTable`, `BedCard` |
| Hook | camelCase `use` prefix | `usePatients`, `useBedStatus` |
| SCSS file | Cạnh component `.module.scss` | `PatientTable.module.scss` |
| Service/API | camelCase | `patientService.ts`, `fetchPatients` |
| Backend controller | camelCase | `patient.controller.ts` |
| Database table | snake_case, số nhiều | `patients`, `bed_transfers` |
| Database column | snake_case | `patient_id`, `created_at` |
| Enum/Constants | UPPER_SNAKE_CASE | `BED_STATUS`, `PATIENT_STATUS` |
| TypeScript interface | PascalCase, prefix `I` optional | `Patient`, `BedStatus` |

---

## 19) Điều cấm tuyệt đối

- Không dùng `any` tràn lan
- Không hardcode secret / token / API key
- Không viết inline-style (trừ dynamic style)
- Không fetch lung tung ở nhiều component
- Không nhét toàn bộ logic vào page/component lớn
- Không bỏ qua loading/empty/error state
- Không thêm thư viện mới nếu chưa có lý do rõ ràng
- Không ship code "demo được" nhưng không bảo trì được
- Không để business rule quan trọng chỉ nằm ở UI mà không có backend validate
- Không tin AI-generated code là an toàn mặc định
- Không tự ý dùng port mới mà chưa xin phép
- Không sửa database schema bằng tay — phải dùng migration
- Không để `console.log()` rác, biến thừa, import thừa

---

## 20) Bộ chỉ thị cho AI đọc trước khi code

```txt
Bạn là kỹ sư phần mềm làm việc trong dự án MedBoard — SaaS quản lý y tế nội trú.
Stack: React 19 + TypeScript (Vite), Node.js + Express + TypeScript, MySQL, SCSS/BEM.
Deploy: Windows VPS (IIS), port 3011. Git-based deployment.

Nguyên tắc bắt buộc:
1. Ưu tiên: đúng nghiệp vụ > đúng dữ liệu > dễ bảo trì > dễ test > rõ cấu trúc > UI đẹp.
2. Không tự bịa nghiệp vụ. Nếu chưa rõ, ghi TODO rõ ràng.
3. Đọc và bám đúng pattern code hiện tại trước khi sửa.
4. TypeScript strict mode — không dùng `any` trừ khi có lý do rõ ràng.
5. Frontend: React + TS, SCSS/BEM, component typed props, service layer cho API.
6. Backend: Express + TS, controller-service pattern, validate input, error handler chung.
7. Database: MySQL, dùng migrations, foreign keys, index chuẩn.
8. Mọi form phải có validation cả FE lẫn BE.
9. Mọi page phải có loading, empty, error state rõ ràng.
10. Code tính năng nào, test tính năng đó luôn.
11. Port 3011 — KHÔNG được tự ý dùng port khác mà chưa hỏi.
12. Khi trả lời, nêu: sẽ sửa/thêm gì, file nào, thay đổi chính, TODO còn lại.

Quy tắc domain MedBoard:
- Organization > Department > Ward > Room > Bed
- Patient > Admission > DischargeRecord
- BedTransfer là sự kiện, cần ngày/giờ/phòng cũ/phòng mới/lý do
- Report là tổng hợp, không phải nơi nhập dữ liệu gốc
- AuditLog là lịch sử hệ thống, không được sửa/xóa
```

---

## 21) Template prompt giao việc cho AI

```txt
Bối cảnh dự án:
MedBoard — SaaS quản lý y tế nội trú.
Frontend: React 19 + TypeScript + Vite + SCSS/BEM.
Backend: Node.js + Express + TypeScript + MySQL.
Deploy: Windows VPS, IIS, port 3011.

Feature/domain liên quan:
[ví dụ: Auth / BedMap / Patient / Discharge / Report]

Yêu cầu lần này:
[mô tả cụ thể]

Phạm vi:
[file hoặc màn hình hoặc flow cụ thể]

Không được đụng vào:
[liệt kê]

Entity liên quan:
[Patient, Room, Bed, Admission, DischargeRecord...]

Kỳ vọng:
- Đúng pattern code hiện tại
- TypeScript strict, không any
- Có loading/empty/error state (FE)
- Có validate cả FE lẫn BE
- CSS dùng SCSS/BEM hoặc CSS Modules
- Có test nếu phù hợp
- Port 3011, không tự mở port mới

Cách trả lời:
1. Nêu kế hoạch sửa.
2. Chỉ rõ file bị ảnh hưởng (cả FE + BE).
3. Viết code.
4. Giải thích thay đổi chính.
5. Nêu rủi ro hoặc TODO.
```

---

## 22) Áp dụng riêng cho dự án MedBoard

### 22.1. Entity boundaries
Organization, Department, Room, Bed, Patient, Admission, DischargeRecord, DischargeChecklist, BedTransfer phải là các entity/module riêng biệt, rõ ranh giới.

### 22.2. Audit trail
Mọi thay đổi liên quan dữ liệu bệnh nhân / phòng–giường phải có: ngày/thời gian, vị trí (phòng/giường), trạng thái, audit trail (AuditLog).

### 22.3. Dashboard
Dashboard chỉ để overview. Nơi xử lý chính vẫn là list/table/form/detail panel.

### 22.4. Edge cases
Giường bệnh phải xử lý: giường trống, giường có bệnh nhân, giường chờ vệ sinh, giường khóa/bảo trì.

---

## 23) Tóm Lược Checklist Trước Khi Push

- [ ] TypeScript không lỗi (`tsc --noEmit`)
- [ ] Lint pass, không warning
- [ ] F12 Console sạch
- [ ] Feature đã test end-to-end (UI → API → DB)
- [ ] Loading/empty/error state đã có (FE)
- [ ] Input validation có cả FE lẫn BE
- [ ] Không có `console.log()` rác, `any` không cần thiết
- [ ] Commit message theo convention
- [ ] `.env.example` đã cập nhật nếu có biến mới
- [ ] Không tự dùng port mới mà chưa xin phép
