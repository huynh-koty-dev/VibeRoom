# M1: Project Skeleton

## Mục tiêu
Toàn bộ khung dự án chạy được, auth hoạt động, storage setup, CI/CD cơ bản.

## Điều kiện Done
- [ ] Monorepo start được tất cả apps
- [ ] Auth: đăng ký, đăng nhập, JWT + refresh token hoạt động
- [ ] Upload file lên R2 qua presigned URL thành công
- [ ] MongoDB kết nối, basic schema tạo xong
- [ ] Deploy staging hoạt động
- [ ] GitHub Actions: lint + type-check pass

---

## Tasks

### 1. Monorepo Setup
```bash
npx create-turbo@latest spatial-ai-platform
```
- [ ] Cấu trúc: `apps/web`, `apps/api`, `packages/shared-types`
- [ ] Root `package.json` với scripts: `dev`, `build`, `lint`
- [ ] `.env.example` cho từng app
- [ ] `.gitignore` chuẩn (node_modules, .env, .next, dist)

### 2. `packages/shared-types`
- [ ] TypeScript types dùng chung: `User`, `Space`, `Asset`, `Concept`, `Design`, `Company`, `Lead`
- [ ] Enums: `UserRole`, `ConceptId`, `AssetCategory`, `SubscriptionTier`
- [ ] API response wrapper type: `ApiResponse<T>`

### 3. `apps/api` — NestJS Core
```bash
nest new api --package-manager npm
```
- [ ] Kết nối MongoDB (Mongoose, `@nestjs/mongoose`)
- [ ] Config module (`@nestjs/config`, load `.env`)
- [ ] Global validation pipe (`class-validator`)
- [ ] Global HTTP exception filter (response format chuẩn)
- [ ] Request logging interceptor
- [ ] `GET /health` endpoint
- [ ] Swagger setup tại `/docs`

### 4. Authentication (NestJS)
- [ ] `UsersModule`: schema, service, controller
- [ ] `AuthModule`: JWT strategy, Refresh token strategy
- [ ] `POST /auth/register` — tạo user mới
- [ ] `POST /auth/login` — trả access + refresh token
- [ ] `POST /auth/refresh` — đổi refresh token
- [ ] `POST /auth/logout` — invalidate refresh token
- [ ] `JwtAuthGuard`, `@CurrentUser()` decorator
- [ ] Roles guard: `USER`, `DESIGNER`, `COMPANY_ADMIN`, `ADMIN`

### 5. Storage Module (NestJS)
- [ ] `StorageModule` wrapping AWS SDK (R2-compatible)
- [ ] `POST /storage/presign/upload` — trả presigned PUT URL
- [ ] `GET /storage/presign/download?key=...` — trả presigned GET URL
- [ ] Helper function: generate unique file key theo pattern `{folder}/{userId}/{timestamp}-{filename}`

### 6. `apps/web` — Next.js Core
```bash
npx create-next-app@latest web --typescript --tailwind --app
npx shadcn@latest init
```
- [ ] NextAuth v5 setup với Credentials provider (call NestJS `/auth/login`)
- [ ] Session provider trong root layout
- [ ] Middleware bảo vệ routes `/dashboard/*` và `/company/*`
- [ ] Route groups: `(auth)/`, `(dashboard)/`, `(company)/`
- [ ] Base layout: header với nav + user menu
- [ ] Login page, Register page (form + validation)
- [ ] Dashboard home (placeholder — "Không gian của tôi")
- [ ] Axios instance với auto-attach JWT + refresh interceptor

### 7. CI/CD
- [ ] GitHub repository (private)
- [ ] `.github/workflows/ci.yml`:
  - Trigger: push to main, PR
  - Jobs: lint, type-check, build (web + api)
- [ ] Vercel project cho `apps/web` (link GitHub)
- [ ] Railway project cho `apps/api`
- [ ] Environment variables setup trên Vercel + Railway

---

## Lệnh khởi tạo theo thứ tự

```bash
# 1. Monorepo
npx create-turbo@latest spatial-ai-platform
cd spatial-ai-platform

# 2. Xóa apps mặc định của Turbo, tạo lại
cd apps
nest new api --package-manager npm
npx create-next-app@latest web --typescript --tailwind --app
cd ..

# 3. Shared types package
mkdir packages/shared-types
cd packages/shared-types && npm init -y

# 4. Install dependencies api
cd apps/api
npm install @nestjs/mongoose mongoose @nestjs/config @nestjs/jwt @nestjs/passport \
  passport passport-jwt passport-local @nestjs/swagger swagger-ui-express \
  class-validator class-transformer @aws-sdk/client-s3 @aws-sdk/s3-request-presigner \
  bcryptjs @anthropic-ai/sdk
npm install -D @types/passport-jwt @types/passport-local @types/bcryptjs

# 5. Install dependencies web
cd apps/web
npm install next-auth@beta three @react-three/fiber @react-three/drei \
  zustand @tanstack/react-query axios react-hook-form zod @hookform/resolvers
npx shadcn@latest init
```

---

## Environment Variables

### apps/api `.env`
```env
NODE_ENV=development
PORT=3001

# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=spatial-ai-vn
R2_PUBLIC_URL=https://...

# Anthropic
ANTHROPIC_API_KEY=
```

### apps/web `.env.local`
```env
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Notes
- Không setup Bull Queue ở M1 — thêm sau nếu cần
- Python `ai-services` chưa cần — thêm ở Phase 2
- M1 xong → bắt đầu M2 (Room Analysis) ngay, không chờ optimize M1
