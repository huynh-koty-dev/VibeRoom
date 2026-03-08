# M2: Room Analysis

## Mục tiêu
User upload ảnh phòng → Claude Vision phân tích → user xác nhận dimensions → lưu kết quả vào Space.

## Điều kiện Done
- [ ] Upload 1–4 ảnh phòng lên R2 thành công
- [ ] Claude Vision phân tích và trả về structured JSON
- [ ] UI cho user xem kết quả phân tích và chỉnh sửa dimensions
- [ ] Space được lưu vào MongoDB với đầy đủ thông tin
- [ ] User thấy được danh sách spaces đã tạo

## Phụ thuộc
- M1 hoàn thành (auth, storage, MongoDB)

---

## Tasks

### NestJS — Spaces Module
- [ ] `Space` schema: `userId, name, photos[], dimensions{width,length,height}, analysisResult, conceptId, status`
- [ ] `POST /spaces` — tạo space mới (chỉ lưu name)
- [ ] `POST /spaces/:id/photos` — trigger analysis sau khi upload ảnh
- [ ] `PATCH /spaces/:id/dimensions` — user confirm/update dimensions
- [ ] `GET /spaces` — danh sách spaces của user
- [ ] `GET /spaces/:id` — chi tiết space

### NestJS — AI Module (Room Analysis)
- [ ] `ai.service.ts` — wrap Anthropic SDK
- [ ] `analyzeRoom(photoUrls: string[])` — gọi Claude Vision
- [ ] Prompt engineering: yêu cầu output JSON chuẩn, tiếng Việt cho descriptions
- [ ] Validation: parse và validate JSON response trước khi lưu
- [ ] Error handling: nếu Claude không parse được → trả partial result, user tự nhập

### Next.js — Upload Flow
- [ ] `SpaceCreateModal` — nhập tên space, chọn ảnh (1–4 files)
- [ ] Upload ảnh trực tiếp lên R2 qua presigned URL
- [ ] Progress indicator trong lúc upload
- [ ] Trigger analysis khi upload xong
- [ ] Loading state "AI đang phân tích không gian..." (3–10s)

### Next.js — Analysis Result UI
- [ ] Hiển thị kết quả: room type, detected items, suggested dimensions
- [ ] Form chỉnh sửa dimensions (width/length/height) có số gợi ý từ AI
- [ ] Preview: tóm tắt mô tả phòng bằng tiếng Việt
- [ ] Nút "Xác nhận và tiếp tục" → chuyển sang M3 (chọn concept)
- [ ] `SpaceCard` component cho dashboard list

---

## Claude Prompt Design

```
Bạn là chuyên gia phân tích không gian nội thất. Phân tích ảnh phòng sau và trả về JSON.

Yêu cầu output (JSON duy nhất, không có text khác):
{
  "roomType": "living_room|bedroom|kitchen|dining_room|bathroom|office|other",
  "estimatedDimensions": {
    "width": <số thực, đơn vị mét>,
    "length": <số thực, đơn vị mét>,
    "height": <số thực, đơn vị mét>
  },
  "existingFurniture": ["<tên đồ vật bằng tiếng Việt>"],
  "lightingDirection": "north|south|east|west|unknown",
  "currentStyle": "<mô tả ngắn phong cách hiện tại>",
  "colorPalette": ["<màu chủ đạo>"],
  "description": "<1-2 câu mô tả không gian bằng tiếng Việt>",
  "confidence": <0.0 đến 1.0>
}

Lưu ý: Kích thước chỉ là ước tính dựa trên tỷ lệ nhìn thấy, user sẽ xác nhận lại.
```

---

## Open Questions
- [ ] Dùng `claude-haiku` hay `claude-sonnet` cho room analysis? → haiku đủ, rẻ hơn 5x
- [ ] Nếu user upload nhiều ảnh → gọi Claude 1 lần với nhiều ảnh, hay nhiều lần?
  → 1 lần với tất cả ảnh (Claude Vision support multiple images)
