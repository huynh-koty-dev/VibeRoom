# M4: 3D Room Viewer

## Mục tiêu
Render phòng 3D từ dimensions đã xác nhận. User có thể xoay, zoom, di chuyển trong không gian. Concept đã chọn áp dụng màu sắc và lighting.

## Điều kiện Done
- [ ] Phòng 3D render đúng tỷ lệ từ width/length/height
- [ ] Orbit controls: xoay, zoom, pan
- [ ] Switching giữa chế độ xem: Perspective (3D) và Top-down (2D floor plan)
- [ ] Concept colors + lighting áp dụng đúng
- [ ] Performance: 60fps trên laptop thông thường

## Phụ thuộc
- M3 hoàn thành (concept selection, ConceptEnvironment config)

---

## Tasks

### Three.js / R3F — Room Scene
- [ ] `RoomScene` component:
  ```
  - Floor: PlaneGeometry(width, length) + material theo concept
  - 4 Walls: BoxGeometry với chiều dày 0.1m + material
  - Ceiling: PlaneGeometry(width, length) + material
  - Grid helper (ẩn/hiện): giúp user ước tính kích thước
  ```
- [ ] `ConceptLighting` component: load ambient + directional light từ ConceptEnvironment
- [ ] Shadows enable (soft shadows, performance-friendly)
- [ ] `<Environment>` từ drei — HDRI preset theo concept

### Camera & Controls
- [ ] `<OrbitControls>` với giới hạn: không xuyên sàn, không ra ngoài phòng
- [ ] Chế độ **Perspective** (mặc định): nhìn từ góc 3/4, có thể xoay tự do
- [ ] Chế độ **Top-down**: camera thẳng đứng, không xoay — như floor plan 2D
- [ ] Nút toggle giữa 2 chế độ
- [ ] Reset camera về góc mặc định

### UI Overlay (trên Canvas)
- [ ] Toolbar bên trái: toggle grid, toggle ceiling visibility, switch view mode
- [ ] Dimensions badge: hiển thị `W × L × H` của phòng
- [ ] Nút "Thêm đồ nội thất" → mở Asset Library (M5)

### Performance
- [ ] `<Suspense>` wrapper với skeleton loading
- [ ] `useFrame` throttle nếu cần
- [ ] Tắt shadows ở mobile nếu detect low-end device

---

## Component Structure
```
StudioPage (Client Component)
  └── <Canvas>
        ├── <ConceptLighting concept={concept} />
        ├── <RoomScene dimensions={dimensions} concept={concept} />
        │     ├── Floor
        │     ├── Walls (x4)
        │     └── Ceiling (toggleable)
        ├── <FurnitureLayer placements={placements} />  ← M6
        └── <OrbitControls ... />
```

---

## Open Questions
- [ ] Hiển thị cửa/cửa sổ trong phòng không? → Phase 1: không, chỉ 4 tường đơn giản
- [ ] Shadow quality vs performance: dùng `SoftShadows` hay basic shadows?
