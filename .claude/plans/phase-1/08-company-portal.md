# M8: Company Portal

## Mục tiêu
Công ty nội thất có tài khoản riêng để upload sản phẩm, xem leads (người dùng đã liên hệ), và theo dõi analytics.

## Điều kiện Done
- [ ] Đăng ký tài khoản công ty (admin approve hoặc tự động)
- [ ] Upload sản phẩm: tên, ảnh thumbnail, file GLB, thông tin liên hệ, category, concept tags
- [ ] Dashboard: số lượt xem, số leads, sản phẩm nổi bật
- [ ] Danh sách leads với thông tin user và space snapshot
- [ ] Quản lý sản phẩm: edit, deactivate

## Phụ thuộc
- M5 (Asset Library), M6 (Lead tracking)

---

## Tasks

### NestJS — Companies Module
- [ ] `Company` schema: `name, email, phone, website, address, logoUrl, description, subscriptionTier, isActive, createdAt`
- [ ] `POST /companies/register` — đăng ký công ty mới
- [ ] `GET /companies/:id` — public profile
- [ ] `PATCH /companies/:id` — update info (COMPANY_ADMIN role)
- [ ] Middleware: chỉ COMPANY_ADMIN mới access `/company/*` routes

### NestJS — Company Asset Management
- [ ] `POST /assets` — upload asset (COMPANY_ADMIN)
  - Validate GLB file
  - Generate thumbnail từ ảnh upload (không tự render 3D)
  - Lưu metadata vào MongoDB
- [ ] `PATCH /assets/:id` — edit asset
- [ ] `DELETE /assets/:id` — deactivate (không xóa thật)

### NestJS — Analytics
- [ ] `GET /analytics/company/:id/overview` — tổng: views, leads, top assets
- [ ] `GET /analytics/company/:id/leads` — danh sách leads với thông tin
- [ ] Lead record: `{userId, assetId, companyId, spaceId, contactedAt, userEmail, userName}`
  - Chú ý GDPR/privacy: chỉ expose email/name nếu user đồng ý khi click "Liên hệ"

### Next.js — Company Portal (`/company/*`)
- [ ] `/company/dashboard` — overview stats
  - Cards: Tổng lượt xem / Leads tháng này / Sản phẩm đang active
  - Chart: Leads theo tuần (recharts)
- [ ] `/company/products` — danh sách sản phẩm, filter, search
- [ ] `/company/products/new` — form upload sản phẩm mới
  - Upload thumbnail (ảnh thường)
  - Upload GLB file (3D model)
  - Chọn category + concepts
  - Nhập dimensions, price range, contact info
- [ ] `/company/leads` — danh sách leads
  - Tên user, thời gian, sản phẩm quan tâm
  - Ảnh chụp màn hình không gian của user (nếu có)
  - Thông tin liên hệ
- [ ] `/company/settings` — thông tin công ty, logo

---

## Subscription Tiers (Phase 1 đơn giản)

| Tier | Giới hạn | Giá |
|------|---------|-----|
| **Free** (onboarding) | 10 sản phẩm, không có analytics chi tiết | $0 |
| **Starter** | 50 sản phẩm, leads, basic analytics | TBD |
| **Pro** | Không giới hạn, featured placement, full analytics | TBD |

> Giá sẽ xác định sau khi có feedback từ partner đầu tiên.

---

## Onboarding Flow cho Công ty Đầu Tiên
Vì partner đầu tiên chưa có GLB files:
1. Họ cung cấp ảnh sản phẩm + thông tin
2. Chúng ta tạo GLB model thủ công (outsource hoặc tự làm với Blender)
3. Upload lên hệ thống thay họ
4. Họ chỉ cần manage thông tin liên hệ và xem leads

→ Đây là "white glove onboarding" cho 5 công ty đầu tiên.
