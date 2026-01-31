from __future__ import annotations

from typing import Dict, List, Optional, Literal, TypedDict


class Task(TypedDict):
    id: int
    user_id: str
    title: str
    completed: bool


# In-memory store: user_id -> tasks
_TASKS: Dict[str, List[Task]] = {}
_NEXT_ID: int = 1


def _ensure_user(user_id: str) -> List[Task]:
    return _TASKS.setdefault(user_id, [])


def add_task(user_id: str, title: str) -> Task:
    global _NEXT_ID
    tasks = _ensure_user(user_id)

    task: Task = {
        "id": _NEXT_ID,
        "user_id": user_id,
        "title": title.strip(),
        "completed": False,
    }
    _NEXT_ID += 1
    tasks.insert(0, task)
    return task


def list_tasks(
    user_id: str, status: Literal["all", "pending", "completed"] = "all"
) -> List[Task]:
    tasks = list(_ensure_user(user_id))

    if status == "pending":
        return [t for t in tasks if not t["completed"]]
    if status == "completed":
        return [t for t in tasks if t["completed"]]
    return tasks


def complete_task(
    user_id: str, task_id: int, completed: Optional[bool] = None
) -> Optional[Task]:
    tasks = _ensure_user(user_id)
    for t in tasks:
        if t["id"] == task_id:
            # completed=None => toggle, warna given bool set
            if completed is None:
                t["completed"] = not t["completed"]
            else:
                t["completed"] = bool(completed)
            return t
    return None


def delete_task(user_id: str, task_id: int) -> bool:
    tasks = _ensure_user(user_id)
    before = len(tasks)
    _TASKS[user_id] = [t for t in tasks if t["id"] != task_id]
    return len(_TASKS[user_id]) != before
