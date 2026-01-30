FROM python:3.11-slim

WORKDIR /app

# deps
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt

# code
COPY backend /app/backend

# make `app` importable (backend/app is your package)
ENV PYTHONPATH=/app/backend

EXPOSE 7860

# IMPORTANT: run uvicorn via python module (no PATH issues)
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
