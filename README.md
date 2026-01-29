✅ README.md (Phase 4) — Full Replace
# Hackathon II – Phase 4 (Kubernetes + Helm)

AI-Powered Todo App + Chatbot (Agent + MCP Tools) deployed on **Kubernetes (Minikube)** using **Docker images + Helm charts**.

This phase focuses on containerization + Kubernetes deployment (backend + frontend), and making the app runnable for judges locally via Minikube.

---

## ✅ What’s Included (Phase 4)

### Backend
- FastAPI backend
- OpenAI Agents SDK + MCP tools integration
- Database support (Neon Postgres via `DATABASE_URL`)
- Dockerized backend image
- Helm chart to deploy on Kubernetes

### Frontend
- Next.js App Router frontend (Todo dashboard + floating chatbot)
- Uses Next.js API routes as **proxy** to avoid CORS (frontend calls `/api/...`)
- Dockerized frontend image
- Helm chart to deploy on Kubernetes

### Kubernetes / Helm
- Helm chart for backend: `helm/todo-backend`
- Helm chart for frontend: `helm/todo-frontend`
- Services deployed inside cluster
- Frontend connects to backend via cluster DNS: `http://todo-backend:8000`

---

## 🧱 Architecture (Phase 4)

Browser → Frontend (Next.js on K8s)  
Frontend → (Proxy Routes) → Backend (FastAPI on K8s)  
Backend → Neon Postgres (optional)  
Backend → OpenAI API (requires key)

---

## 📦 Repo Structure



.
├── backend/
│ ├── app/
│ ├── Dockerfile
│ └── requirements.txt
├── frontend/
│ ├── app/
│ ├── components/
│ ├── lib/
│ └── Dockerfile
├── helm/
│ ├── todo-backend/
│ └── todo-frontend/
└── README.md


---

## 🔐 Environment Variables (NO secrets in repo)

### Backend Helm Values
Set these during install/upgrade (recommended via `--set`):

- `env.OPENAI_API_KEY`
- `env.DATABASE_URL`

Example (PowerShell):

```powershell
helm upgrade --install todo-backend .\helm\todo-backend `
  --set env.OPENAI_API_KEY="YOUR_KEY_HERE" `
  --set env.DATABASE_URL="YOUR_DATABASE_URL_HERE"


Frontend does NOT need OpenAI key.

🚀 Run Locally for Judges (Minikube + Helm)
1) Start Minikube
minikube start

2) Build + Load Backend Image
docker build -t todo-backend:local .\backend
minikube image load todo-backend:local

3) Deploy Backend via Helm
helm upgrade --install todo-backend .\helm\todo-backend `
  --set image.repository="todo-backend" `
  --set image.tag="local" `
  --set env.OPENAI_API_KEY="YOUR_KEY_HERE" `
  --set env.DATABASE_URL="YOUR_DATABASE_URL_HERE"

4) Build + Load Frontend Image
docker build -t todo-frontend:local .\frontend
minikube image load todo-frontend:local

5) Deploy Frontend via Helm
helm upgrade --install todo-frontend .\helm\todo-frontend `
  --set image.repository="todo-frontend" `
  --set image.tag="local"

6) Open the App
minikube service todo-frontend

✅ Quick Verification Commands
Check pods
kubectl get pods

Check services
kubectl get svc

Backend health (from inside cluster)
kubectl run curlpod --rm -it --image=curlimages/curl --restart=Never -- `
  curl -s http://todo-backend:8000/health

🧑‍⚖️ Judges Demo (What to show)

kubectl get pods → backend + frontend running

kubectl get svc → services exist

Open app via minikube service todo-frontend

Sign in (demo auth via localStorage userId)

Create todo tasks

Open chatbot widget → try:

list

add buy milk

complete 1

delete 1

stats

Show backend logs if needed:

kubectl logs deploy/todo-backend --tail=100

📝 Notes

This Phase-4 repo is intended for Kubernetes deployment (Minikube).

No secrets are committed to GitHub (push protection safe).

If CORS errors appear, frontend proxy routes handle it via /api/....

✅ Phase 4 Complete

Kubernetes + Helm deployment setup is implemented for both backend and frontend.


---

## ✅ Judges Demo Steps (Short Script)

1) `minikube start`  
2) Build/load backend image → deploy backend helm (with OPENAI key + DB URL)  
3) Build/load frontend image → deploy frontend helm  
4) `minikube service todo-frontend` open in browser  
5) Show todo add/list/complete/delete  
6) Show chatbot commands: `list / add milk / complete 1 / delete 1 / stats`  
7) Show `kubectl get pods` and `kubectl get svc`