# M6: Furniture Placement

## Mục tiêu
User kéo thả đồ nội thất vào phòng 3D, di chuyển và xoay tự do. Lưu layout để quay lại sau.

## Điều kiện Done
- [ ] Click asset → xuất hiện trong phòng tại vị trí trung tâm
- [ ] Chọn đồ nội thất trong phòng → drag để di chuyển trên sàn
- [ ] Xoay đồ nội thất (snap 45°)
- [ ] Xóa đồ nội thất khỏi phòng
- [ ] Auto-save layout sau mỗi thay đổi
- [ ] Load lại layout khi mở lại studio

## Phụ thuộc
- M4 (3D Viewer), M5 (Asset Library)

---

## Tasks

### Three.js — Placement System
- [ ] `PlacementManager` — quản lý danh sách furniture đã đặt trong scene
- [ ] `FurnitureObject` component:
  - Load GLB từ signed URL (cache với `useGLTF`)
  - Click để select (highlight outline)
  - Drag trên mặt sàn (raycasting với floor plane)
  - Không cho phép kéo ra ngoài tường
- [ ] Xoay: khi selected, nút xoay +90° / -90° hoặc phím R
- [ ] Selection indicator: outline hoặc bounding box highlight
- [ ] Multi-select: shift+click (nice to have)

### Zustand — Scene Store
```typescript
interface SceneStore {
  placements: FurniturePlacement[]
  selectedId: string | null
  addFurniture: (assetId: string, position: Vector3) => void
  moveFurniture: (id: string, position: Vector3) => void
  rotateFurniture: (id: string, rotation: number) => void
  removeFurniture: (id: string) => void
  selectFurniture: (id: string | null) => void
}

interface FurniturePlacement {
  id: string
  assetId: string
  position: { x: number, y: number, z: number }
  rotation: number  // degrees, Y axis
}
```

### NestJS — Designs Module
- [ ] `Design` schema: `spaceId, userId, conceptId, placements[], savedAt, name`
- [ ] `PUT /designs/:spaceId` — upsert design (auto-save)
- [ ] `GET /designs/:spaceId` — load design hiện tại của space

### Next.js — Placement UI
- [ ] Toolbar khi select furniture:
  - Rotate left / Rotate right
  - Delete (icon thùng rác)
  - Asset name + dimensions
- [ ] "Đang lưu..." indicator khi auto-save
- [ ] Undo/Redo cơ bản (last 10 actions, in-memory)
- [ ] Nút "Xuất thiết kế" → screenshot canvas (Phase 1 đơn giản)

---

## Technical Notes

**Drag system với R3F:**
```typescript
// Dùng @use-gesture/react + raycasting với floor plane
const bind = useDrag(({ xy: [x, y] }) => {
  const point = raycaster.intersectObject(floorPlane)
  if (point[0]) moveFurniture(id, point[0].point)
})
```

**GLB Loading & Caching:**
```typescript
// useGLTF cache tự động theo URL — không load lại nếu đã có
const { scene } = useGLTF(signedUrl)
const cloned = useMemo(() => scene.clone(), [scene])
// Clone để đặt nhiều instance của cùng 1 model
```

**Auto-save debounce:**
- Sau mỗi thay đổi placement → debounce 2s → gọi PUT /designs/:spaceId
- Không save khi đang drag (chỉ save khi drop)
