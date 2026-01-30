"""
Phase 5 - Tools Skeleton (MCP-ready)

Abhi: in-memory tasks (per user)
Baad me: yahin functions DB (SQLModel/SQLAlchemy/Neon) se connect honge.
"""

from __future__ import annotations
from typing import Dict, List, Literal, TypedDict, Optional
import itertools


class Task(TypedDict):
    id: int
    title: str
    completed: bool


# In-memory store: user_id -> tasks
_TASKS: Dict[str, List[Task]] = {}
_ID_COUNTER = itertools.count(1)


def _get_user_tasks(user_id: str) -> List[Task]:
    return _TASKS.setdefault(user_id, [])


def add_task(user_id: str, title: str) -> Task:
    title = (title or "").strip()
    if not title:
        raise ValueError("title is required")

    task: Task = {"id": next(_ID_COUNTER), "title": title, "completed": False}
    _get_user_tasks(user_id).append(task)
    return task


def list_tasks(
    user_id: str,
    status: Literal["all", "pending", "completed"] = "all",
) -> List[Task]:
    tasks = _get_user_tasks(user_id)
    if status == "pending":
        return [t for t in tasks if not t["completed"]]
    if status == "completed":
        return [t for t in tasks if t["completed"]]
    return tasks


def complete_task(user_id: str, task_id: int) -> Optional[Task]:
    tasks = _get_user_tasks(user_id)
    for t in tasks:
        if t["id"] == task_id:
            t["completed"] = True
            return t
    return None


def delete_task(user_id: str, task_id: int) -> bool:
    tasks = _get_user_tasks(user_id)
    before = len(tasks)
    _TASKS[user_id] = [t for t in tasks if t["id"] != task_id]
    return len(_TASKS[user_id]) != before
