🚀 Hackathon II – Phase 5 (Production Deployment + AI Agent)
AI-Powered Todo App + Chatbot

(OpenAI Agents SDK + MCP-style Tools + Production Deployment)

This phase focuses on production-ready deployment of the AI-powered Todo App with chatbot, using server-side API proxying, OpenAI Agents SDK, MCP-style tools, and database persistence, fully deployed on Vercel (frontend) and Hugging Face Spaces (backend).

🌐 Live Deployment (Phase 5)

Frontend (Vercel)
👉 https://ismat-taskflow-ai.vercel.app

Backend (Hugging Face Spaces)
👉 https://ismat110-todo-backend-phase5.hf.space

✅ What’s Included (Phase 5)
🔹 Backend (FastAPI – Hugging Face)

FastAPI backend deployed on Hugging Face Spaces

OpenAI Agents SDK integrated

MCP-style task tools:

list

add <task>

complete <id>

delete <id>

stats

Task persistence via database

Tasks remain available after sign-out / sign-in

Health endpoint:

/health

Docker-based deployment (HF Spaces)

🔹 Frontend (Next.js – Vercel)

Next.js App Router frontend

Todo dashboard + floating AI chatbot

Secure frontend-backend communication using Next.js API routes

Browser → /api/...

Server → Hugging Face backend

No CORS issues

No mixed-content (HTTP/HTTPS) issues

Demo authentication using localStorage userId

🔹 AI Chatbot (Agent Behavior)

Natural language todo management

Roman Urdu / English supported

Examples:

list
add buy milk
complete 1
delete 1
stats


Chatbot works directly with backend tools (MCP-style)

🧱 Architecture (Phase 5)
Browser
  ↓
Next.js Frontend (Vercel)
  ↓  (API Proxy Routes)
FastAPI Backend (Hugging Face)
  ↓
Database (Tasks Persistence)
  ↓
OpenAI API (Agents SDK)

📦 Repo Structure
.
├── backend/
│   ├── app/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── api/        # Server-side proxy routes
│   │   └── dashboard/
│   ├── components/
│   ├── lib/
│   └── Dockerfile
└── README.md
``
