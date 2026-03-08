# M7: AI Design Suggestions

## Mục tiêu
AI phân tích không gian + concept đã chọn → gợi ý bố trí cụ thể với lý do rõ ràng bằng tiếng Việt. Đây là core value differentiator so với đối thủ.

## Điều kiện Done
- [ ] Nút "Gợi ý AI" trong studio hoạt động
- [ ] AI đề xuất layout cụ thể: tên đồ nội thất, vị trí, lý do
- [ ] User có thể apply gợi ý tự động (đặt đồ vào đúng vị trí gợi ý)
- [ ] AI giải thích bằng tiếng Việt: tại sao chọn đồ này, đặt ở đó
- [ ] Gợi ý sản phẩm cụ thể từ asset library phù hợp concept

## Phụ thuộc
- M5 (Asset Library), M6 (Furniture Placement)

---

## Tasks

### NestJS — AI Design Service
- [ ] `suggestDesign(spaceId, userId)` trong `ai.service.ts`:
  - Fetch: space dimensions, analysisResult, conceptId, available assets (top 30 theo concept)
  - Gọi `claude-sonnet-4-6` với context đầy đủ
  - Return: structured layout + reasoning
- [ ] `POST /ai/suggest-design/:spaceId` endpoint
- [ ] Cache suggestion 1h (Redis) — không gọi lại nếu space chưa thay đổi

### Prompt Design (quan trọng nhất của milestone này)
```
Bạn là nhà thiết kế nội thất chuyên nghiệp tại Việt Nam, chuyên phong cách [CONCEPT_NAME].

THÔNG TIN PHÒNG:
- Loại phòng: [roomType]
- Kích thước: [W]m × [L]m × [H]m
- Ánh sáng tự nhiên từ hướng: [lightingDirection]
- Hiện trạng: [description]

PHONG CÁCH CHỌN: [concept description]

SẢN PHẨM CÓ SẴN TRONG THƯ VIỆN:
[danh sách assets: id, name, category, dimensions]

Hãy đề xuất cách bố trí tối ưu. Trả về JSON:
{
  "summary": "<1-2 câu tổng quan bằng tiếng Việt>",
  "placements": [
    {
      "assetId": "<id từ danh sách trên>",
      "position": { "x": <-width/2 đến width/2>, "z": <-length/2 đến length/2> },
      "rotation": <0, 90, 180, hoặc 270>,
      "reason": "<lý do đặt ở vị trí này, bằng tiếng Việt>"
    }
  ],
  "tips": ["<tip thiết kế bằng tiếng Việt>"],
  "priorityPurchase": ["<assetId nên mua trước>"]
}

Quy tắc vị trí:
- x: từ [-(width/2 - 0.5)] đến [(width/2 - 0.5)] (cách tường 0.5m)
- z: từ [-(length/2 - 0.5)] đến [(length/2 - 0.5)]
- Không để đồ chồng lên nhau (kiểm tra dimensions)
- Sofa thường quay về TV/focal point
- Giường thường đặt đầu sát tường
```

### Next.js — Suggestion UI
- [ ] `AISuggestionPanel` — slide-up từ bottom hoặc sidebar
  - Summary text (2–3 câu)
  - Danh sách đề xuất với lý do từng món
  - Tips section
- [ ] Nút "Áp dụng tất cả" → auto-place theo coordinates
- [ ] Nút "Áp dụng từng cái" → highlight từng món, user confirm
- [ ] Loading state: "AI đang thiết kế cho không gian của bạn..." với animation
- [ ] Nếu đã có đồ trong phòng: hỏi "Xóa hết và áp dụng gợi ý mới?" hoặc "Thêm vào thiết kế hiện tại?"

---

## UX Notes
- **Tone của AI**: Chuyên nghiệp nhưng gần gũi, như nhà thiết kế đang tư vấn trực tiếp
- **Lý do quan trọng hơn kết quả**: User phải hiểu TẠI SAO, không chỉ thấy ĐỒ ĐỢC ĐẶT ĐÂU
- **Gợi ý phải realistic**: Không đặt sofa 3m vào phòng 2.5m × 3m
- Cho phép regenerate (tối đa 3 lần/session để kiểm soát cost)
