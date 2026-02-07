from __future__ import annotations

from typing import List, Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.tools.tasks import add_task, list_tasks, complete_task, delete_task, Task

router = APIRouter(prefix="/api/{user_id}", tags=["tasks"])


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None  # ISO string / YYYY-MM-DD ok


class TaskRead(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str] = None
    completed: bool
    due_date: Optional[str] = None


class TogglePayload(BaseModel):
    completed: Optional[bool] = None


@router.get("/tasks", response_model=List[TaskRead])
def get_tasks(user_id: str, status: Literal["all", "pending", "completed"] = "all"):
    tasks: List[Task] = list_tasks(user_id, status)
    return tasks


@router.post("/tasks", response_model=TaskRead)
def post_task(user_id: str, payload: TaskCreate):
    t = add_task(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
    )
    return t


# ✅ IMPORTANT: frontend calls:
# PATCH /api/{userId}/tasks/{taskId}
@router.patch("/tasks/{task_id}", response_model=TaskRead)
def patch_task(user_id: str, task_id: int, payload: TogglePayload):
    # completed None => toggle, completed True/False => set
    t = complete_task(user_id, task_id, payload.completed)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    return t


@router.delete("/tasks/{task_id}")
def del_task(user_id: str, task_id: int):
    removed = delete_task(user_id, task_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True}
