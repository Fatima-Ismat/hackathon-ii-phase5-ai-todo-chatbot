# Dockerfile (HF-safe)

FROM python:3.11-slim

WORKDIR /app

# deps
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt

# code
COPY backend /app/backend

# ensure "app" package is importable (backend/app)
ENV PYTHONPATH=/app/backend

EXPOSE 7860

# run uvicorn with explicit app-dir (prevents import issues on HF)
CMD ["python", "-m", "uvicorn", "app.main:app", "--app-dir", "/app/backend", "--host", "0.0.0.0", "--port", "7860"]
