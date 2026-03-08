# Agent: Debug & Flow Review

## Vai trò
Review luồng hoạt động từ đầu đến cuối, xác định điểm lỗi, phân tích nguyên nhân gốc rễ và đề xuất fix cụ thể.

## Khi nào dùng
- Bug không rõ nguyên nhân
- Feature mới vừa build xong cần review toàn luồng
- Lỗi xảy ra ở đâu đó trong chuỗi Frontend → API → DB/Service không biết ở bước nào
- Hành vi bất ngờ không khớp với thiết kế

---

## Quy trình Review Luồng

### Bước 1 — Xác định luồng cần review
Mô tả luồng theo format:
```
[User action] → [Component] → [API call] → [Service] → [DB/External] → [Response] → [UI update]
```

Ví dụ:
```
User upload ảnh → SpaceCreateModal → POST /storage/upload/photos → StorageController → R2 → keys[] → POST /spaces/:id/photos → AiService (background) → MongoDB
```

### Bước 2 — Checklist từng layer

**Frontend:**
- [ ] Component có đúng state management không?
- [ ] API call có đúng endpoint, method, headers không?
- [ ] Error handling có catch được lỗi và hiển thị đúng không?
- [ ] Loading state có hoạt động không?
- [ ] Data từ API có được render đúng không?

**NestJS API:**
- [ ] Route đúng với `@Controller` prefix và `@Get/@Post` decorator không?
- [ ] Guard (`JwtAuthGuard`) có được apply không?
- [ ] DTO validation có đúng không? (`class-validator`)
- [ ] Service method có throw đúng exception không?
- [ ] Response interceptor có wrap data đúng format `{success, data}` không?

**Database / External:**
- [ ] Mongoose schema có đúng với data đang lưu không?
- [ ] Query có filter đúng userId không? (authorization)
- [ ] R2/External service có nhận đúng credentials không?
- [ ] Async operation (background jobs) có error handling không?

### Bước 3 — Debug theo tầng

```
Nếu lỗi ở FRONTEND:
  → Mở DevTools → Network tab → xem request/response
  → Console tab → xem JavaScript error
  → Kiểm tra state với React DevTools

Nếu lỗi ở API:
  → Xem NestJS terminal logs
  → Test trực tiếp với curl hoặc Swagger /docs
  → Kiểm tra .env có đủ biến không

Nếu lỗi ở DATABASE:
  → Kiểm tra MongoDB Atlas → Collections
  → Xem Mongoose validation error trong logs

Nếu lỗi ở EXTERNAL SERVICE (R2, Claude API):
  → Kiểm tra credentials trong .env
  → Xem error message cụ thể (thường có code và message rõ)
  → Test credentials riêng lẻ
```

---

## Prompt Template — Review Luồng

```
Hãy review luồng sau của dự án Spatial AI Platform và xác định vấn đề:

**Luồng:**
[Mô tả luồng từ user action đến kết quả]

**Triệu chứng:**
[Mô tả hành vi sai — ví dụ: "không hiển thị ảnh", "upload thất bại", "không có response"]

**Error logs (nếu có):**
```
[Paste error từ browser console hoặc NestJS terminal]
```

**Các file liên quan:**
- Frontend: [component/hook path]
- Backend: [controller/service path]

Yêu cầu:
1. Xác định bước nào trong luồng đang fail
2. Phân tích nguyên nhân gốc rễ
3. Đề xuất fix cụ thể với code
4. Chỉ ra cách verify fix đã đúng
```

---

## Prompt Template — Debug Nhanh

```
Bug: [Mô tả ngắn]

Error:
[Error message / stack trace]

Layer: [frontend / nestjs-api / python-service / database / external]

File: [path đến file nghi ngờ]

Hãy:
1. Giải thích tại sao lỗi này xảy ra
2. Fix ngắn gọn nhất có thể
3. Có side effect nào không?
```

---

## Các lỗi thường gặp trong dự án này

| Lỗi | Nguyên nhân thường gặp | Fix |
|-----|----------------------|-----|
| `401 Unauthorized` | Token hết hạn hoặc không đính kèm header | Kiểm tra `Authorization: Bearer <token>` trong request |
| `Cannot read property of undefined` | Data từ API chưa load xong mà đã render | Thêm optional chaining `?.` hoặc kiểm tra loading state |
| `EADDRINUSE :3001` | Process cũ chưa tắt | `powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force"` |
| Upload ảnh thất bại | CORS (direct R2) hoặc multer không có memoryStorage | Upload qua NestJS, thêm `storage: memoryStorage()` |
| Ảnh không hiển thị | R2 key không thể dùng trực tiếp trong `<img>` | Dùng `/api/photo?key=...` proxy route để lấy presigned URL |
| Claude API lỗi auth | `ANTHROPIC_API_KEY` chưa set trong `.env` | Thêm key vào `apps/api/.env` và restart API |
| MongoDB auth failed | Sai credentials hoặc IP chưa whitelist | Kiểm tra URI và Network Access trên Atlas |
| `status: analyzing` mãi không đổi | Background job lỗi silent | Xem NestJS logs, kiểm tra `analyzeInBackground` catch block |
