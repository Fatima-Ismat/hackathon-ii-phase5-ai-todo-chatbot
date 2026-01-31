---
title: todo-backend-phase5
emoji: "🤖"
colorFrom: purple
colorTo: indigo
sdk: docker
app_file: backend/Dockerfile
pinned: false
---

# Todo Backend - Phase 5

FastAPI backend for Hackathon II Phase 5 (Docker Space).

## Endpoints
- GET /health
- GET /docs
- POST /api/{user_id}/chat
- GET /api/{user_id}/tasks
- POST /api/{user_id}/tasks
- PATCH /api/{user_id}/tasks/{task_id}/complete
- DELETE /api/{user_id}/tasks/{task_id}
