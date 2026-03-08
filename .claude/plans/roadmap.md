# Roadmap — Spatial AI Platform

## Vision
Nền tảng B2B2C cho phép người dùng Việt Nam chụp không gian sống, chọn phong cách thiết kế, thử sản phẩm nội thất thực của các thương hiệu Việt trong không gian của chính họ — và liên hệ mua trực tiếp.

## Mô hình kinh doanh
- **Người dùng cá nhân & nhà thiết kế**: Miễn phí
- **Công ty nội thất**: Subscription để đăng sản phẩm + analytics + lead tracking
- **Dịch vụ 3D modeling** (giai đoạn đầu): Thu phí một lần để tạo model 3D cho sản phẩm của công ty

## User Flow cốt lõi
```
[Người dùng]
Chụp/upload ảnh phòng
  → Chọn concept (Scandinavian, Japandi, Vietnamese Contemporary...)
  → AI phân tích phòng + gợi ý sản phẩm phù hợp concept
  → Thử sản phẩm trong phòng 3D của mình
  → Thích → Xem thông tin thương hiệu → Liên hệ mua

[Công ty nội thất]
Đăng ký → Upload sản phẩm + thông tin → Sản phẩm xuất hiện trong hệ thống
  → Nhận leads từ người dùng đã thử sản phẩm trong phòng thực của họ
```

---

## Phase 1 — Core Platform (Hiện tại)
**Mục tiêu:** Hệ thống hoạt động đầu đến cuối, đủ để onboard 5–10 công ty nội thất đầu tiên

### Milestones

| # | Milestone | Điều kiện Done |
|---|-----------|----------------|
| M1 | **Project Skeleton** | Monorepo, auth, storage, CI/CD |
| M2 | **Room Analysis** | Upload ảnh → Claude Vision phân tích → user xác nhận dimensions |
| M3 | **Concept Selection** | Chọn phong cách → AI filter sản phẩm phù hợp → mood board |
| M4 | **3D Room Viewer** | Render procedural room từ dimensions, điều hướng cơ bản |
| M5 | **Asset Library** | Upload GLTF, categorize theo concept/loại đồ, preview |
| M6 | **Furniture Placement** | Kéo thả đồ nội thất vào phòng 3D, xem từ nhiều góc |
| M7 | **AI Design Suggestions** | Gợi ý layout cụ thể, lý do chọn từng món dựa trên không gian thực |
| M8 | **Company Portal** | Dashboard cho công ty: upload sản phẩm, xem leads, analytics |
| **MVP** | **Hoàn chỉnh** | User thử → liên hệ mua; Company thấy lead |

### Rủi ro Phase 1
- **Friction onboarding công ty**: Họ không có file 3D → Giải pháp: cung cấp dịch vụ tạo 3D model
- **Chất lượng AI analysis**: Claude Vision ước tính dimensions sai → Giải pháp: user luôn xác nhận trước khi render

---

## Phase 2 — Marketplace & Scale
**Mục tiêu:** Tự động hóa onboarding, mở rộng số lượng thương hiệu, tăng trải nghiệm

### Tính năng chính
- Self-service portal cho công ty (không cần hỗ trợ thủ công)
- AI generate 3D model từ ảnh sản phẩm (giảm friction onboarding)
- Tính năng chia sẻ thiết kế (user chia sẻ phòng đã design)
- Interior designer portal: quản lý nhiều dự án khách hàng
- Review & rating sản phẩm
- Featured placement, quảng cáo cho thương hiệu

### Điều kiện bắt đầu Phase 2
- [ ] Phase 1 MVP ổn định, không có critical bugs
- [ ] Ít nhất 5 công ty nội thất đang dùng thực tế
- [ ] Có feedback thực từ người dùng về UX

---

## Phase 3 — Mobile App
**Mục tiêu:** Native AR experience

### Tính năng chính
- React Native app
- ARKit (iOS) / ARCore (Android) cho scanning chính xác
- Real-time AR đặt đồ nội thất
- Camera scan trực tiếp thay vì upload ảnh

### Điều kiện bắt đầu Phase 3
- [ ] Phase 2 có traction rõ ràng (số users, revenue)
- [ ] Đã validate product-market fit

---

## Open Questions Chiến lược
- [ ] Giá subscription cho công ty nội thất: bao nhiêu là hợp lý với thị trường VN?
- [ ] Onboard công ty đầu tiên: tiếp cận trực tiếp hay qua network?
- [ ] Concepts nào cần ưu tiên nhất cho thị trường VN? (cần research)
