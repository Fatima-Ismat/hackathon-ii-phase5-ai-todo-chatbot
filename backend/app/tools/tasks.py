from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional, Literal, TypedDict, Union

ISODate = Union[str, datetime]


class Task(TypedDict):
    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    due_date: Optional[str]  # store as ISO string for simplicity


_TASKS: Dict[str, List[Task]] = {}
_NEXT_ID: int = 1


def _ensure_user(user_id: str) -> List[Task]:
    return _TASKS.setdefault(user_id, [])


def _to_iso(dt: Optional[ISODate]) -> Optional[str]:
    if dt is None:
        return None
    if isinstance(dt, datetime):
        return dt.isoformat()
    s = str(dt).strip()
    return s or None


def add_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    due_date: Optional[ISODate] = None,
) -> Task:
    global _NEXT_ID
    tasks = _ensure_user(user_id)

    task: Task = {
        "id": _NEXT_ID,
        "user_id": user_id,
        "title": title.strip(),
        "description": (description.strip() if isinstance(description, str) else None),
        "completed": False,
        "due_date": _to_iso(due_date),
    }
    _NEXT_ID += 1
    tasks.insert(0, task)
    return task


def list_tasks(user_id: str, status: Literal["all", "pending", "completed"] = "all") -> List[Task]:
    tasks = list(_ensure_user(user_id))

    if status == "pending":
        return [t for t in tasks if not t["completed"]]
    if status == "completed":
        return [t for t in tasks if t["completed"]]
    return tasks


def update_task(
    user_id: str,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    due_date: Optional[ISODate] = None,
) -> Optional[Task]:
    tasks = _ensure_user(user_id)
    for t in tasks:
        if t["id"] == task_id:
            if title is not None:
                t["title"] = title.strip()
            if description is not None:
                t["description"] = description.strip() if isinstance(description, str) else None
            if due_date is not None:
                t["due_date"] = _to_iso(due_date)
            return t
    return None


def complete_task(user_id: str, task_id: int, completed: Optional[bool] = None) -> Optional[Task]:
    tasks = _ensure_user(user_id)
    for t in tasks:
        if t["id"] == task_id:
            if completed is None:
                t["completed"] = not t["completed"]
            else:
                t["completed"] = bool(completed)
            return t
    return None


def delete_task(user_id: str, task_id: int) -> Optional[Task]:
    tasks = _ensure_user(user_id)
    for i, t in enumerate(tasks):
        if t["id"] == task_id:
            return tasks.pop(i)
    return None
