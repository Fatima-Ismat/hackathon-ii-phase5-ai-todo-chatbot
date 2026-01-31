"""
DB-backed Task Service (same source as Dashboard)

This file gives the agent a clean way to use the SAME database tasks
that your /api/{user_id}/tasks endpoints use.
"""

from __future__ import annotations

from typing import List, Optional

# ---- DB session import (try common project patterns) ----
SessionLocal = None

try:
    from app.db import SessionLocal  # most common in our project
except Exception:
    try:
        from app.database import SessionLocal  # fallback
    except Exception:
        SessionLocal = None

if SessionLocal is None:
    raise ImportError("SessionLocal not found. Check app/db.py or app/database.py")

# ---- Task model import (try common project patterns) ----
Task = None

try:
    from app.models import Task  # if app/models.py defines Task
except Exception:
    try:
        from app.models.task import Task  # if split module
    except Exception:
        Task = None

if Task is None:
    raise ImportError("Task model not found. Check app/models.py")


def create_task(user_id: str, title: str) -> dict:
    title = (title or "").strip()
    if not title:
        raise ValueError("Title is required")

    db = SessionLocal()
    try:
        t = Task(user_id=user_id, title=title, completed=False)
        db.add(t)
        db.commit()
        db.refresh(t)
        return {"id": t.id, "user_id": t.user_id, "title": t.title, "completed": bool(t.completed)}
    finally:
        db.close()


def get_tasks(user_id: str, status: str = "all") -> List[dict]:
    status = (status or "all").lower().strip()

    db = SessionLocal()
    try:
        q = db.query(Task).filter(Task.user_id == user_id).order_by(Task.id.desc())

        if status == "pending":
            q = q.filter(Task.completed == False)  # noqa: E712
        elif status == "completed":
            q = q.filter(Task.completed == True)  # noqa: E712

        rows = q.all()
        return [
            {"id": t.id, "user_id": t.user_id, "title": t.title, "completed": bool(t.completed)}
            for t in rows
        ]
    finally:
        db.close()


def toggle_task_complete(user_id: str, task_id: int) -> Optional[dict]:
    db = SessionLocal()
    try:
        t = db.query(Task).filter(Task.user_id == user_id, Task.id == task_id).first()
        if not t:
            return None

        t.completed = not bool(t.completed)
        db.add(t)
        db.commit()
        db.refresh(t)
        return {"id": t.id, "user_id": t.user_id, "title": t.title, "completed": bool(t.completed)}
    finally:
        db.close()


def remove_task(user_id: str, task_id: int) -> bool:
    db = SessionLocal()
    try:
        t = db.query(Task).filter(Task.user_id == user_id, Task.id == task_id).first()
        if not t:
            return False
        db.delete(t)
        db.commit()
        return True
    finally:
        db.close()
