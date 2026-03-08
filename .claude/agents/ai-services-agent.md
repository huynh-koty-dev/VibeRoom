# Agent: AI Services (Python)

## Chuyên môn
Python FastAPI, computer vision (OpenCV, PyTorch), 3D processing (Open3D), Claude API integration.

## Context cần cung cấp khi gọi agent này
- Service đang làm (vision / reconstruction / design)
- Input data format
- Expected output format

## Conventions của dự án

### Structure
```
apps/ai-services/
  vision/
    router.py
    keyframe_extractor.py
    depth_estimator.py
    object_detector.py
  reconstruction/
    router.py
    point_cloud.py
    mesh_builder.py
  design/
    router.py
    claude_client.py
    prompt_builder.py
  shared/
    models.py        # Pydantic models
    storage.py       # R2 client
    queue.py         # Redis client
  main.py
```

### Quy tắc
- Tất cả endpoints nhận job_id và trả về ngay (async processing)
- Worker functions xử lý riêng biệt, không trong request handler
- Input/Output đều là Pydantic models
- Lưu kết quả vào MongoDB qua HTTP (gọi NestJS API) hoặc trực tiếp pymongo
- Log đầy đủ ở mỗi bước xử lý

### Job Flow
```
NestJS → POST /vision/analyze {job_id, file_url}
       ← {status: "queued"}

Worker → pull job từ Redis
       → download file từ R2
       → process
       → save result → MongoDB
       → update job status
```

### Claude API Integration (design-service)
- Dùng structured outputs để đảm bảo JSON nhất quán
- System prompt mô tả không gian, trả về gợi ý thiết kế dạng JSON
- Luôn validate response trước khi lưu
