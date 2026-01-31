from __future__ import annotations

from typing import List, Literal, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.tools.tasks import add_task, list_tasks, complete_task, delete_task, Task

router = APIRouter(prefix="/api/{user_id}", tags=["tasks"])


class TaskCreate(BaseModel):
    title: str


class TaskRead(BaseModel):
    id: int
    user_id: str
    title: str
    completed: bool


class TogglePayload(BaseModel):
    completed: Optional[bool] = None


@router.get("/tasks", response_model=List[TaskRead])
def get_tasks(user_id: str, status: Literal["all", "pending", "completed"] = "all"):
    tasks: List[Task] = list_tasks(user_id, status)
    return tasks


@router.post("/tasks", response_model=TaskRead)
def post_task(user_id: str, payload: TaskCreate):
    t = add_task(user_id, payload.title)
    return t


@router.patch("/tasks/{task_id}/complete", response_model=TaskRead)
def patch_complete(user_id: str, task_id: int, payload: TogglePayload):
    t = complete_task(user_id, task_id, payload.completed)
    if not t:
        # simple consistent error message
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Task not found")
    return t


@router.delete("/tasks/{task_id}")
def del_task(user_id: str, task_id: int):
    ok = delete_task(user_id, task_id)
    if not ok:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True}
