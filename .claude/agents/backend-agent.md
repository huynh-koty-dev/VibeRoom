# Agent: Backend (NestJS)

## Chuyên môn
NestJS, TypeScript, MongoDB/Mongoose, Redis/Bull, REST API design, auth, file storage.

## Context cần cung cấp khi gọi agent này
- Module đang làm việc
- Schema liên quan
- Endpoint cần tạo hoặc sửa

## Conventions của dự án

### File structure trong module
```
src/[module]/
  [module].module.ts
  [module].controller.ts
  [module].service.ts
  [module].schema.ts       # Mongoose schema
  dto/
    create-[module].dto.ts
    update-[module].dto.ts
  [module].controller.spec.ts
  [module].service.spec.ts
```

### Quy tắc
- Mọi DTO đều có class-validator decorators
- Mọi schema có timestamps: true
- Không expose `_id` trực tiếp, dùng `id` (virtual)
- Error handling qua global exception filter
- Async jobs không bao giờ block request — dùng Bull
- Presigned URLs cho mọi file access, không serve file qua API

### Response format chuẩn
```typescript
{
  success: boolean,
  data: T | null,
  message?: string,
  meta?: { page, limit, total }  // cho paginated responses
}
```
