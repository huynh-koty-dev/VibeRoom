# M5: Asset Library

## Mục tiêu
Thư viện đồ nội thất 3D được filter theo concept và loại. Bao gồm cả assets free ban đầu lẫn sản phẩm từ công ty nội thất.

## Điều kiện Done
- [ ] Có ít nhất 50 GLB assets trong hệ thống
- [ ] Filter theo concept và category hoạt động
- [ ] Mỗi asset có thumbnail, tên, thông tin nguồn gốc
- [ ] Assets từ công ty có badge thương hiệu + nút "Xem thông tin"
- [ ] Click asset → thêm vào phòng 3D (M6)

## Phụ thuộc
- M1 (storage R2), M3 (concept IDs)

---

## Tasks

### NestJS — Assets Module
- [ ] `Asset` schema:
  ```typescript
  {
    companyId?: ObjectId,   // null = free/platform asset
    name: string,
    nameEn?: string,
    category: AssetCategory,
    conceptIds: ConceptId[],
    tags: string[],
    glbUrl: string,         // R2 URL
    thumbnailUrl: string,
    dimensions: { width, depth, height },  // meters
    priceRange?: string,    // "5.000.000 - 8.000.000 VNĐ"
    contactInfo?: string,
    isActive: boolean,
    viewCount: number,
    createdAt: Date
  }
  ```
- [ ] `GET /assets` — filter: `conceptId`, `category`, `companyId`, pagination
- [ ] `GET /assets/:id` — chi tiết asset
- [ ] `POST /assets` — admin/company upload asset (protected)
- [ ] `PATCH /assets/:id/view` — increment viewCount

### Asset Categories
```typescript
enum AssetCategory {
  SOFA = 'sofa',
  BED = 'bed',
  TABLE = 'table',
  CHAIR = 'chair',
  STORAGE = 'storage',       // tủ, kệ, ngăn kéo
  LIGHTING = 'lighting',     // đèn
  DECORATION = 'decoration', // tranh, cây, thảm
  APPLIANCE = 'appliance'    // điện tử, thiết bị
}
```

### Seed Data — 50+ Free Assets
Nguồn GLB miễn phí:
- **poly.pizza** — low-poly furniture, CC0
- **kenney.nl** — game assets, CC0
- **sketchfab.com** — filter CC license, download GLTF

Script seed:
- [ ] `seed/assets.ts` — import metadata + upload GLB lên R2
- [ ] Map từng asset với conceptIds phù hợp theo phong cách

### Next.js — Asset Library UI
- [ ] `AssetLibraryPanel` — slide-in panel bên phải canvas
- [ ] Filter bar: tabs theo category + filter concept (inherit từ space)
- [ ] `AssetGrid` — grid 2 cột, thumbnail + tên
- [ ] `AssetCard`:
  - Thumbnail (lazy load)
  - Tên sản phẩm
  - Badge thương hiệu (nếu có company)
  - Kích thước (W × D × H)
  - Nút "+ Thêm vào phòng"
- [ ] `AssetDetailDrawer` — xem chi tiết, thông tin liên hệ công ty, nút "Liên hệ"
- [ ] Search by name

---

## Lead Tracking (gắn với M8)
Khi user click "Liên hệ" từ AssetDetailDrawer:
- Tạo `Lead` record: `{userId, assetId, companyId, spaceId, contactedAt}`
- Company sẽ thấy lead này trong dashboard của họ (M8)
- Hiển thị thông tin liên hệ: SĐT, email, website, showroom address

---

## Notes
- Phase 1: không có giỏ hàng / checkout — chỉ hiển thị thông tin liên hệ
- Giao dịch xảy ra offline giữa user và công ty
- Tracking lead = giá trị cốt lõi cho B2B revenue
