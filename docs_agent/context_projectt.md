# MedBoard -- Context Project

## Tong quan
He thong quan ly y te noi tru (SaaS). Ho tro theo doi benh nhan, phong giuong, quy trinh ra vien, kiem tra ho so.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + SCSS (BEM)
- **Backend**: Node.js + Express + TypeScript
- **Database**: MySQL 8.0 (utf8mb4)
- **Deploy**: IIS (reverse proxy port 3030) + PM2 (port 3011)
- **VPS**: Windows Server, IP 160.30.113.26

## Cau truc thu muc
```
thanh/
  client/           # React frontend
    src/
      assets/icons/ # Tabler Icons (outline + filled)
      components/
        Layout/     # AppLayout, Sidebar, Header
        ProtectedRoute/
      contexts/     # AuthContext
      pages/
        Login/      # LoginPage
        Dashboard/  # DashboardPage (live API stats)
        Rooms/      # RoomListPage
        Patients/   # PatientListPage
        Discharge/  # DischargeListPage (checklist panel)
      services/
        api/        # httpClient, authApi, medboardApi
      styles/
        abstracts/  # _variables.scss, _mixins.scss
        base/       # _reset.scss, _components.scss
  server/           # Express backend
    src/
      config/       # database, env config
      database/     # 001_users, 002_core_tables (7 tables)
      middleware/   # auth guard, error handler
      modules/
        auth/       # login, getMe
        rooms/      # CRUD, departments
        beds/       # CRUD, assign/release (transactions)
        patients/   # CRUD, discharge, checklists
        dashboard/  # stats aggregate
  shared/           # TypeScript types
    types/
      auth.ts       # LoginRequest, UserInfo, ApiResponse
```

## API Endpoints
| Method | Endpoint | Chuc nang |
|---|---|---|
| POST | /api/auth/login | Dang nhap |
| GET | /api/auth/me | User hien tai |
| GET | /api/rooms | Danh sach phong (filter: dept, status, search) |
| GET | /api/rooms/departments | Danh sach khoa |
| POST | /api/rooms | Tao phong |
| PUT | /api/rooms/:id | Cap nhat phong |
| GET | /api/beds/room/:roomId | Giuong theo phong |
| POST | /api/beds | Tao giuong |
| POST | /api/beds/:id/assign | Xep giuong (transaction) |
| POST | /api/beds/:id/release | Tra giuong (transaction) |
| GET | /api/patients | Danh sach benh nhan (filter: status, search) |
| POST | /api/patients | Tao benh nhan |
| PUT | /api/patients/:id | Cap nhat benh nhan |
| POST | /api/patients/:id/discharge | Ra vien (transaction) |
| GET | /api/patients/discharge-list | Du kien ra vien |
| GET | /api/patients/:id/checklists | Checklist ho so |
| POST | /api/patients/:id/checklists/toggle | Toggle checklist item |
| GET | /api/dashboard/stats | Thong ke tong hop |

## Trang thai
- Sprint 1-6: DONE (35+ files)
- Sprint 7 (Admin): Placeholder
- Chuyen SQL migration: Can chay `002_create_core_tables.sql` tren MySQL

## Quy tac thiet ke
- Cong vu, vuong vuc, khong gradient, khong emoji
- Brand: #1A56DB, sidebar dark #1F2937
- Radius: 4px, spacing: 4px system, font: Inter
- Icons: Tabler outline SVG

## Repo
https://github.com/KhoaMinhPMK/quan_ly_benh_vien
