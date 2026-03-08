# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Spatial AI Platform** — Nền tảng B2B2C tại thị trường Việt Nam: người dùng chụp không gian sống, chọn phong cách thiết kế (concept), thử sản phẩm nội thất thực của các thương hiệu Việt trong phòng 3D của mình, và liên hệ mua trực tiếp với công ty.

**Mô hình kinh doanh:**
- Người dùng cá nhân & nhà thiết kế nội thất: miễn phí
- Công ty nội thất: subscription để đăng sản phẩm + xem leads + analytics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router, TypeScript) |
| 3D Viewer | Three.js + React Three Fiber + @react-three/drei |
| Backend | NestJS (TypeScript) |
| AI | Claude API (Haiku cho classification, Sonnet cho design suggestions) |
| Database | MongoDB (Atlas) |
| Cache | Upstash Redis |
| Asset Storage | Cloudflare R2 (GLB models, photos) |
| Auth | NextAuth v5 (frontend) + JWT (NestJS) |
| Mobile (Phase 3) | React Native |

## Monorepo Structure

```
spatial-ai-platform/
  apps/
    web/          # Next.js frontend
    api/          # NestJS backend
  packages/
    shared-types/ # TypeScript types dùng chung
  .claude/        # Claude management (plans, tasks, skills, agents)
```

> Không có Python services trong Phase 1. NestJS gọi Claude API trực tiếp.

## Commands

### Web (Next.js)
```bash
cd apps/web
npm run dev       # Dev server (port 3000)
npm run build     # Production build
npm run lint      # ESLint
npm run type-check # TypeScript check
```

### API (NestJS)
```bash
cd apps/api
npm run start:dev  # Dev với hot-reload (port 3001)
npm run build      # Production build
npm run test       # Jest unit tests
npm run test:e2e   # E2E tests
```

### Root (Turborepo)
```bash
npm run dev        # Start web + api cùng lúc
npm run build      # Build tất cả
npm run lint       # Lint tất cả
```

## Architecture — User Flow

```
User upload ảnh phòng
  → NestJS nhận, lưu R2, gọi Claude Vision (Haiku)
  → Trả về: room type, ước tính dimensions, mô tả
  → User xác nhận dimensions
  → User chọn Concept (Scandinavian / Japandi / Vietnamese Contemporary / ...)
  → Next.js render Procedural 3D Room (Three.js) với lighting/colors của concept
  → User browse Asset Library (filter theo concept)
  → Kéo thả GLTF furniture vào phòng
  → Nút "Gợi ý AI" → NestJS gọi Claude Sonnet → layout suggestions tiếng Việt
  → User thích sản phẩm → "Liên hệ" → Lead được tạo → Công ty nhận lead
```

## NestJS Module Structure

```
src/
  auth/        # JWT, guards, decorators
  users/       # Profile, roles (USER | DESIGNER | COMPANY_ADMIN | ADMIN)
  spaces/      # Scanned rooms: photos, dimensions, analysisResult
  concepts/    # Design styles: Scandinavian, Japandi, Vietnamese Contemporary...
  assets/      # 3D models: GLB URL, category, conceptIds, companyId
  designs/     # Saved layouts: placements[], conceptId
  companies/   # Company accounts, subscription tier
  leads/       # Lead tracking: user → company contact events
  ai/          # Claude API wrapper: analyzeRoom(), suggestDesign()
  storage/     # R2 presigned URL generation
  common/      # Global filters, interceptors, decorators
```

## Key Conventions

### NestJS
- Response format: `{ success: boolean, data: T, message?: string }`
- Mọi DTO có class-validator decorators
- Mọi Mongoose schema có `timestamps: true`
- File upload: presigned URL (frontend upload thẳng lên R2, không qua API)
- Không có Bull Queue Phase 1 — async/await thường

### Next.js
- Server Components mặc định; `'use client'` khi cần interactivity
- 3D components: bắt buộc `'use client'` + `<Suspense>` wrapper
- Server state: TanStack Query; Global state: Zustand; Form: react-hook-form + zod
- Route groups: `(auth)/`, `(dashboard)/`, `(company)/`

### 3D (Three.js / R3F)
- Format duy nhất: **GLB** (binary GLTF)
- `useGLTF` với signed URL — cache tự động
- Clone scene khi cần nhiều instance: `scene.clone()`
- Procedural room: Floor + 4 Walls + Ceiling từ dimensions

### AI (Claude API)
- `claude-haiku-4-5` — room analysis, concept suggestion (nhanh, rẻ)
- `claude-sonnet-4-6` — design layout suggestions (chất lượng cao)
- Luôn validate và parse JSON response trước khi dùng
- Cache design suggestions 1h trong Redis

## Claude Management

Tất cả file quản lý dự án trong `.claude/`:
- `plans/roadmap.md` — tổng quan 3 phases
- `plans/phase-1/00-technical-analysis.md` — quyết định kỹ thuật
- `plans/phase-1/01-08-*.md` — kế hoạch từng milestone
- `tasks/daily.md` — task tracking hàng ngày
- `skills/` — prompt templates tái sử dụng
- `agents/` — conventions cho từng layer

## Milestone hiện tại
**M1 — Project Skeleton** (chưa bắt đầu)
Xem chi tiết: `.claude/plans/phase-1/01-project-skeleton.md`
