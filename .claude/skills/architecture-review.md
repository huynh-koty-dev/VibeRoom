# Skill: Architecture Review

## Khi nào dùng
Khi cần review một quyết định kiến trúc, thiết kế module mới, hoặc đánh giá trade-off kỹ thuật.

## Prompt Template

```
Hãy review quyết định kiến trúc sau cho dự án Spatial AI Platform:

**Context:**
- Solo developer, NestJS backend, Next.js frontend, Python AI services
- MongoDB, Redis, Cloudflare R2
- Phase hiện tại: [M1/M2/...]

**Quyết định cần review:**
[Mô tả quyết định]

**Các phương án đã xem xét:**
1. [Phương án A]
2. [Phương án B]

**Yêu cầu:**
- Đánh giá pros/cons của từng phương án
- Cân nhắc với constraint: solo developer, cần maintain được
- Đề xuất phương án nào và tại sao
- Chỉ ra rủi ro kỹ thuật nếu có
```

## Checklist khi review architecture
- [ ] Phù hợp với solo developer không? (maintainability)
- [ ] Có tạo coupling không cần thiết không?
- [ ] Scale được khi Phase 2 không?
- [ ] Có điểm failure đơn lẻ không?
- [ ] Testing có khó không?
