from __future__ import annotations

from typing import List, Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.tools.tasks import add_task, list_tasks, complete_task, delete_task

router = APIRouter()


class TaskCreate(BaseModel):
    title: str


class TaskRead(BaseModel):
    id: int
    user_id: str
    title: str
    completed: bool


@router.get("/api/{user_id}/tasks/", response_model=List[TaskRead])
def get_tasks(user_id: str, status: Literal["all", "pending", "completed"] = "all"):
    return list_tasks(user_id, status)


@router.post("/api/{user_id}/tasks/", response_model=TaskRead)
def create_task(user_id: str, payload: TaskCreate):
    title = (payload.title or "").strip()
    if not title:
        raise HTTPException(status_code=422, detail="title is required")
    return add_task(user_id, title)


@router.patch("/api/{user_id}/tasks/{task_id}/complete", response_model=TaskRead)
def toggle_complete(user_id: str, task_id: int):
    t = complete_task(user_id, task_id, completed=None)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    return t


@router.delete("/api/{user_id}/tasks/{task_id}")
def remove_task(user_id: str, task_id: int):
    ok = delete_task(user_id, task_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True}
