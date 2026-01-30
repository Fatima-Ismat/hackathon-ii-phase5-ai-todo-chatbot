from __future__ import annotations

from datetime import datetime
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..db import SessionLocal
from ..models import Task

router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    title: str


class TaskRead(BaseModel):
    id: int
    user_id: str
    title: str
    completed: bool

    class Config:
        from_attributes = True


@router.get("/", response_model=List[TaskRead])
def list_tasks(user_id: str):
    db = SessionLocal()
    try:
        tasks = (
            db.query(Task)
            .filter(Task.user_id == user_id)
            .order_by(Task.id.desc())
            .all()
        )
        return tasks
    finally:
        db.close()


@router.post("/", response_model=TaskRead)
def add_task(user_id: str, payload: TaskCreate):
    title = (payload.title or "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="title is required")

    db = SessionLocal()
    try:
        now = datetime.utcnow()
        task = Task(
            user_id=user_id,
            title=title,
            completed=False,
            created_at=now,
            updated_at=now,
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task
    finally:
        db.close()


@router.patch("/{task_id}/complete/", response_model=TaskRead)
def toggle_complete(user_id: str, task_id: int):
    db = SessionLocal()
    try:
        task = (
            db.query(Task)
            .filter(Task.user_id == user_id, Task.id == task_id)
            .first()
        )
        if not task:
            raise HTTPException(status_code=404, detail="task not found")

        task.completed = not bool(task.completed)
        task.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(task)
        return task
    finally:
        db.close()


@router.delete("/{task_id}")
def delete_task(user_id: str, task_id: int):
    db = SessionLocal()
    try:
        task = (
            db.query(Task)
            .filter(Task.user_id == user_id, Task.id == task_id)
            .first()
        )
        if not task:
            raise HTTPException(status_code=404, detail="task not found")

        db.delete(task)
        db.commit()
        return {"ok": True}
    finally:
        db.close()
