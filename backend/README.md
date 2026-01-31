---
title: Todo Backend Phase 5
emoji: 🧠
colorFrom: purple
colorTo: indigo
sdk: docker
app_file: Dockerfile
pinned: false
---

# Todo Backend - Phase 5

This is the FastAPI backend for Hackathon II Phase 5.

## Features
- Task CRUD API
- Natural language chatbot
- MCP-style task tools
- In-memory task store
- Designed for Hugging Face Spaces

## Health Check
- `/health`

## Chat Endpoint
- `POST /api/{user_id}/chat`

## Tasks
- `GET /api/{user_id}/tasks`
- `POST /api/{user_id}/tasks`
- `PATCH /api/{user_id}/tasks/{task_id}/complete`
- `DELETE /api/{user_id}/tasks/{task_id}`
