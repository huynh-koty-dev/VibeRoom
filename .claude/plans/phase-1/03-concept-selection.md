# M3: Concept Selection

## Mục tiêu
Sau khi phân tích phòng, user chọn phong cách thiết kế (concept). AI filter sản phẩm phù hợp và chuẩn bị môi trường 3D theo concept đó.

## Điều kiện Done
- [ ] UI hiển thị các concept với mood board hấp dẫn
- [ ] AI gợi ý concept phù hợp nhất dựa trên ảnh phòng hiện tại
- [ ] Chọn concept → room 3D đổi màu sắc / lighting tương ứng
- [ ] Concept được lưu vào Space
- [ ] Asset library được filter theo concept đã chọn

## Phụ thuộc
- M2 hoàn thành (room analysis, dimensions)

---

## Concepts Phase 1

| ID | Tên VN | Tên EN | Màu chủ đạo | Ánh sáng |
|----|--------|--------|-------------|---------|
| `scandinavian` | Bắc Âu | Scandinavian | Trắng, gỗ sáng, xám nhạt | Sáng, tự nhiên |
| `japandi` | Nhật-Bắc Âu | Japandi | Be, nâu đất, xanh rêu | Ấm, mềm |
| `industrial` | Công nghiệp | Industrial | Xám, đen, nâu đậm | Tối, điểm nhấn |
| `tropical-modern` | Nhiệt Đới | Tropical Modern | Xanh lá, gỗ tối, trắng | Sáng, nhiều cây |
| `vietnamese-contemporary` | Việt Nam Đương Đại | Vietnamese Contemporary | Gỗ ấm, trắng ngà, xanh nhạt | Ấm, tự nhiên |
| `luxury-classic` | Sang Trọng Cổ Điển | Luxury Classic | Vàng, kem, nâu đậm | Ấm, drama |
| `minimalist` | Tối Giản | Minimalist | Trắng, đen, xám | Trắng, đều |

---

## Tasks

### NestJS — Concepts Module
- [ ] `Concept` schema: `id, nameVi, nameEn, description, tags[], coverImageUrl, moodBoardUrls[], colorPalette[], lightingConfig{}`
- [ ] Seed 7 concepts ban đầu vào database
- [ ] `GET /concepts` — danh sách tất cả concepts
- [ ] `GET /concepts/:id` — chi tiết concept

### NestJS — AI Concept Suggestion
- [ ] `suggestConcept(analysisResult)` trong `ai.service.ts`
- [ ] Dùng `claude-haiku` — input: room analysis JSON → output: top 2–3 concept IDs có lý do
- [ ] Endpoint: `POST /spaces/:id/suggest-concepts`

### Next.js — Concept Selection UI
- [ ] `ConceptGallery` — grid hiển thị tất cả concepts
  - Cover image lớn, tên VN + EN
  - Badge "Gợi ý cho bạn" cho concepts AI recommend
  - Hover effect: xem mood board
- [ ] `ConceptCard` — click để xem chi tiết
  - Mood board ảnh (3–4 ảnh reference)
  - Mô tả phong cách
  - Màu palette
- [ ] Chọn concept → save vào Space + navigate sang M4 (3D Viewer)
- [ ] Có thể đổi concept sau từ studio

### Three.js — Concept Environment
- [ ] Mỗi concept có config:
  ```typescript
  interface ConceptEnvironment {
    wallColor: string
    floorTexture: string
    ceilingColor: string
    ambientLightIntensity: number
    ambientLightColor: string
    directionalLightIntensity: number
    fogColor?: string
  }
  ```
- [ ] Room materials thay đổi khi switch concept (smooth transition)
- [ ] Lighting preset load theo concept

---

## UX Notes
- Concept selection là **khoảnh khắc cảm xúc** — UI cần đẹp, ảnh chất lượng cao
- User phải cảm thấy "đây là phong cách của mình" → mood board quan trọng hơn description
- AI suggestion chỉ là gợi ý, không force — user luôn có quyền chọn bất kỳ
- Cho phép chọn sau — không block user nếu chưa muốn chọn ngay

---

## Asset Sources cho Mood Board
- Unsplash API (free) — search theo keyword "scandinavian interior", "japandi room", v.v.
- Lưu URLs vào concept config, không tự host
