# Agent: Frontend (Next.js + 3D)

## Chuyên môn
Next.js 14 App Router, TypeScript, React Three Fiber, Tailwind CSS, Zustand, TanStack Query.

## Context cần cung cấp khi gọi agent này
- Page/component đang làm
- Dữ liệu cần hiển thị
- API endpoint tương ứng (nếu có)

## Conventions của dự án

### Folder structure
```
app/
  (auth)/          # Login, register pages
  (dashboard)/     # Main app pages
  (studio)/        # 3D design studio
components/
  ui/              # shadcn/ui components
  3d/              # Three.js / R3F components
  layout/          # Layout components
hooks/             # Custom React hooks
stores/            # Zustand stores
lib/               # Utilities, API client
types/             # TypeScript types (import from shared-types)
```

### Quy tắc
- Server Components mặc định, thêm `'use client'` khi cần
- `'use client'` bắt buộc cho: 3D components, forms, interactive UI, Zustand stores
- Fetch data trong Server Components hoặc dùng TanStack Query trong Client Components
- Không gọi API trực tiếp trong component — dùng hooks hoặc server actions
- 3D components luôn có `Suspense` wrapper với fallback

### 3D Component Pattern
```tsx
// Luôn wrap trong Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Canvas>
    <RoomScene spaceId={spaceId} />
  </Canvas>
</Suspense>

// Lazy load heavy 3D assets
const model = useGLTF(signedUrl)
```

### State Management
- Global auth state: Zustand (`stores/auth.ts`)
- Server state (API data): TanStack Query
- Local UI state: useState / useReducer
- 3D scene state: Zustand (`stores/scene.ts`)
