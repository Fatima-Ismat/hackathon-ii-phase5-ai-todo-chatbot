# Phase-3 Todo Chatbot Overview

Goal:
Todo app ko AI chatbot banana jo natural language se tasks manage kare.

Stack:
- Frontend: OpenAI ChatKit (dashboard ke andar)
- Backend: FastAPI
- AI: OpenAI Agents SDK
- MCP: Official MCP SDK
- DB: Neon Postgres

Core Rules:
- Backend stateless hoga
- Conversation history DB me store hogi
- Single chat endpoint: POST /api/{user_id}/chat
- Task operations MCP tools se hongi
