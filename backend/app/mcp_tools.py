# backend/app/mcp_tools.py
from __future__ import annotations

from typing import List, Optional

from sqlalchemy.orm import Session

from agents import function_tool

from .db import SessionLocal
from .models import Task


def _db() -> Session:
    return SessionLocal()


@function_tool
def list_tasks(user_id: str) -> str:
    """List all tasks for a user."""
    db = _db()
    try:
        tasks: List[Task] = (
            db.query(Task).filter(Task.user_id == user_id).order_by(Task.id.asc()).all()
        )
        if not tasks:
            return "No tasks found."
        lines = []
        for t in tasks:
            status = "✅" if t.completed else "⏳"
            lines.append(f"{status} {t.title} (id={t.id})")
        return "\n".join(lines)
    finally:
        db.close()


@function_tool
def add_task(user_id: str, title: str, description: Optional[str] = None) -> str:
    """Add a new task for a user."""
    title = (title or "").strip()
    if not title:
        return "Task title is required."

    db = _db()
    try:
        t = Task(user_id=user_id, title=title, description=description, completed=False)
        db.add(t)
        db.commit()
        db.refresh(t)
        return f"Added: {t.title} (id={t.id})"
    finally:
        db.close()


@function_tool
def complete_task(user_id: str, title: str) -> str:
    """Mark first matching task as completed."""
    title = (title or "").strip()
    if not title:
        return "Task title is required."

    db = _db()
    try:
        t: Optional[Task] = (
            db.query(Task)
            .filter(Task.user_id == user_id, Task.title.ilike(f"%{title}%"))
            .order_by(Task.id.asc())
            .first()
        )
        if not t:
            return f"No task matched: {title}"
        t.completed = True
        db.commit()
        return f"Completed: {t.title} (id={t.id})"
    finally:
        db.close()


@function_tool
def delete_task(user_id: str, title: str) -> str:
    """Delete first matching task."""
    title = (title or "").strip()
    if not title:
        return "Task title is required."

    db = _db()
    try:
        t: Optional[Task] = (
            db.query(Task)
            .filter(Task.user_id == user_id, Task.title.ilike(f"%{title}%"))
            .order_by(Task.id.asc())
            .first()
        )
        if not t:
            return f"No task matched: {title}"
        db.delete(t)
        db.commit()
        return f"Deleted: {t.title} (id={t.id})"
    finally:
        db.close()


# IMPORTANT: Agent ko Tool objects chahiye (functions nahi)
tools = [list_tasks, add_task, complete_task, delete_task]
