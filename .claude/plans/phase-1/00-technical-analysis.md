# Technical Analysis — Phase 1

## Nguyên tắc thiết kế
- **Đơn giản nhất có thể** — solo developer, không over-engineer
- **Không có Python microservices Phase 1** — NestJS gọi Claude API trực tiếp
- **Photo-based analysis** thay vì 3D reconstruction từ video
- **Procedural 3D room** từ dimensions thay vì mesh phức tạp

---

## 1. Frontend: Next.js 14 (App Router)

**Lý do chọn Next.js:**
- React Three Fiber (R3F) là thư viện 3D tốt nhất trong React ecosystem
- Chuyển sang React Native (Phase 3) dễ hơn — chia sẻ logic và TypeScript types
- Server Components giúp tối ưu performance trang marketing/landing

**Thư viện chính:**
```
three + @react-three/fiber   # 3D engine
@react-three/drei            # Helpers: OrbitControls, useGLTF, Environment
zustand                      # State: scene state, user prefs
@tanstack/react-query        # Server state, API calls
axios                        # HTTP client
react-hook-form + zod        # Forms + validation
tailwindcss + shadcn/ui      # UI
next-auth v5                 # Authentication
```

**Route structure:**
```
app/
  (auth)/login, /register
  (dashboard)/
    spaces/               # Danh sách phòng đã scan
    spaces/[id]/          # Chi tiết phòng
    spaces/[id]/studio/   # 3D design studio ← core feature
  (company)/              # Company portal (B2B)
    products/
    analytics/
    leads/
  (admin)/                # Admin quản lý platform
```

**Quy tắc quan trọng:**
- Server Components mặc định → thêm `'use client'` khi cần
- 3D components bắt buộc `'use client'` + `Suspense` wrapper
- Không gọi API trực tiếp trong component — dùng hooks + TanStack Query

---

## 2. Backend: NestJS

**Module structure:**
```
src/
  auth/           # JWT, NextAuth integration, guards
  users/          # User profile, preferences
  spaces/         # Scanned rooms, dimensions, analysis results
  concepts/       # Design concepts (Scandinavian, Japandi, Vietnamese Contemporary...)
  assets/         # 3D models: metadata, tags, concept mapping
  designs/        # Design sessions, furniture placements, saved layouts
  companies/      # Company accounts, product listings
  leads/          # Lead tracking (user → company contact)
  ai/             # Claude API integration: room analysis, design suggestions
  storage/        # R2 presigned URL generation
  common/         # Guards, interceptors, filters, decorators
```

**Thư viện chính:**
```json
{
  "@nestjs/mongoose": "^10",
  "@nestjs/config": "^3",
  "@nestjs/jwt": "^10",
  "@nestjs/passport": "^10",
  "@nestjs/swagger": "^7",
  "passport-jwt": "^4",
  "class-validator": "^0.14",
  "class-transformer": "^0.5",
  "@aws-sdk/client-s3": "^3",
  "@aws-sdk/s3-request-presigner": "^3",
  "@anthropic-ai/sdk": "^0.27"
}
```

**Không dùng Bull Queue Phase 1** — Claude API response đủ nhanh (~3–10s), dùng async/await thường. Thêm queue ở Phase 2 nếu cần.

---

## 3. AI Integration: Claude API (qua NestJS)

**Không có Python microservices Phase 1.** Toàn bộ AI gọi từ NestJS `ai.service.ts`.

### Room Analysis (Claude Vision)
```typescript
// Input: ảnh phòng (base64 hoặc URL từ R2)
// Output: structured JSON
{
  roomType: "living_room" | "bedroom" | "kitchen" | ...,
  estimatedDimensions: { width: number, length: number, height: number },
  existingFurniture: string[],
  lightingDirection: "north" | "south" | "east" | "west" | "unknown",
  currentStyle: string,
  colorPalette: string[],
  suggestions: string  // mô tả ngắn gọn tiếng Việt
}
```

### Concept Matching & Design Suggestions
```typescript
// Input: room analysis + concept đã chọn + danh sách assets có sẵn
// Output: structured JSON
{
  suggestedLayout: FurniturePlacement[],  // vị trí x,y,z từng món
  reasoning: string,                      // tiếng Việt
  colorRecommendations: string[],
  lightingTips: string,
  priorityItems: string[]   // nên mua trước
}
```

**Model sử dụng:**
- `claude-haiku-4-5` — Room type detection, style classification (nhanh, rẻ)
- `claude-sonnet-4-6` — Design suggestions chi tiết, layout reasoning (chất lượng cao)

---

## 4. Database: MongoDB

**Collections:**
```javascript
users         // id, email, name, role (user | designer | company_admin)
spaces        // userId, name, photos[], dimensions, analysisResult, conceptId
concepts      // name, nameVi, description, tags[], coverImage, colorPalette[]
assets        // companyId, name, category, conceptIds[], glbUrl, thumbnailUrl,
              // dimensions, priceRange, contactInfo, viewCount, leadCount
designs       // spaceId, userId, conceptId, placements[], savedAt
leads         // userId, assetId, companyId, contactedAt, spaceSnapshot
companies     // name, contactEmail, phone, website, subscriptionTier, active
```

**Index quan trọng:**
- `assets`: compound index trên `conceptIds + category`
- `leads`: index trên `companyId + contactedAt` (cho analytics)
- `spaces`: index trên `userId`

---

## 5. Storage: Cloudflare R2

**Bucket structure:**
```
r2://spatial-ai-vn/
  uploads/{userId}/{spaceId}/photos/    # Ảnh gốc từ user
  assets/{companyId}/{assetId}/         # GLB model + thumbnail
  concepts/{conceptId}/                 # Cover images, mood board
  exports/{userId}/{designId}/          # Exported design previews
```

**Flow upload:**
1. Frontend request presigned URL từ NestJS
2. Frontend upload trực tiếp lên R2 (không qua NestJS)
3. Frontend notify NestJS URL đã upload xong
4. NestJS lưu URL vào MongoDB

---

## 6. 3D: Procedural Room + GLTF Assets

**Room rendering — không cần mesh reconstruction:**
```typescript
// Từ dimensions { width: 4.5, length: 6, height: 2.7 }
// Three.js tạo:
- Floor: PlaneGeometry(width, length)
- Walls: 4x BoxGeometry
- Ceiling: PlaneGeometry(width, length)
- Materials: texture đơn giản, có thể đổi màu theo concept
```

**Furniture assets:**
- Format: GLB (binary GLTF) — chuẩn duy nhất
- Load: `useGLTF` từ @react-three/drei + cache
- Nguồn ban đầu: poly.pizza, kenney.nl (CC license) + tự tạo cho partner đầu tiên

**3D Concepts — mỗi concept có:**
- Color palette cho tường/sàn
- Lighting preset (ambient intensity, directional angle)
- Default material cho room surfaces

---

## 7. Concepts (Design Styles)

Danh sách concepts Phase 1 (nghiên cứu thêm để bổ sung):

| ID | Tên | Đặc điểm |
|----|-----|-----------|
| `scandinavian` | Scandinavian | Trắng, gỗ sáng, tối giản |
| `japandi` | Japandi | Wabi-sabi, trung tính, yên tĩnh |
| `industrial` | Industrial | Kim loại, bê tông, tối |
| `tropical-modern` | Tropical Modern | Xanh, gỗ tối, thoáng |
| `vietnamese-contemporary` | Việt Nam Đương Đại | Ấm, gỗ, kết hợp truyền thống-hiện đại |
| `luxury-classic` | Luxury Classic | Sang trọng, đối xứng, chi tiết |
| `minimalist` | Minimalist | Trắng, thẳng, không nhiễu |

---

## 8. Deployment (Phase 1)

| Service | Platform | Chi phí |
|---------|----------|---------|
| Next.js | Vercel (free tier) | $0 |
| NestJS | Railway Starter | ~$5/tháng |
| MongoDB | Atlas M0 | $0 |
| Redis | Upstash (free) | $0 |
| R2 Storage | Cloudflare (10GB free) | $0 |
| Claude API | Pay per use | ~$10–20/tháng |
| **Total** | | **~$15–25/tháng** |

---

## Quyết định đã chốt

| Quyết định | Lý do |
|-----------|-------|
| Không có Python Phase 1 | Giảm complexity, NestJS + Claude API là đủ |
| Photo upload thay vì video scan | Đơn giản hơn, kết quả ổn định hơn |
| Procedural room thay vì 3D reconstruction | Nhanh hơn 3–4 tháng build time |
| GLB là format duy nhất | Web-native, Three.js support tốt nhất |
| MongoDB thay vì SQL | Schema flexible cho design data phức tạp |
| Cloudflare R2 thay vì AWS S3 | Không có egress fee, quan trọng với 3D assets lớn |

## Open Questions Kỹ Thuật

- [ ] Concept "Vietnamese Contemporary" — cần research thêm đặc điểm cụ thể
- [ ] Khi nào thêm Bull Queue? → Khi Claude API response >15s hoặc có nhiều concurrent users
- [ ] 3D model cho partner đầu tiên — tự tạo hay outsource?
