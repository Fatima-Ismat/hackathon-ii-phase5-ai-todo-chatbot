"""
Phase 5 - Agent Runner (FINAL, CLEAN, ASCII-SAFE)

Features:
- Per-user chat history (in-memory)
- Command parsing:
  add <title>
  list [all|pending|completed]
  complete <id>
  delete <id>
- Fallback to AI chat
- ASCII-safe output (no Unicode symbols)
"""

from __future__ import annotations

from typing import Dict, List
import re

from sqlalchemy.orm import Session

from app.agents.agent import TodoAgent
from app.db import SessionLocal
from app.models import Task

# user_id -> chat history
_USER_HISTORY: Dict[str, List[dict]] = {}

_agent = TodoAgent()


def _get_history(user_id: str) -> List[dict]:
    return _USER_HISTORY.setdefault(user_id, [])


def _append(history: List[dict], role: str, content: str) -> None:
    history.append({"role": role, "content": content})


def _format_tasks(tasks: List[dict]) -> str:
    if not tasks:
        return "No tasks."
    lines: List[str] = []
    for t in tasks:
        status = "[x]" if t.get("completed") else "[ ]"
        lines.append(f"{status} ({t.get('id')}) {t.get('title')}")
    return "\n".join(lines)


def _db_session() -> Session:
    return SessionLocal()


# -------------------------
# DB-backed task operations
# -------------------------

def _add_task_db(user_id: str, title: str) -> dict:
    db = _db_session()
    try:
        task = Task(user_id=user_id, title=title, completed=False)
        db.add(task)
        db.commit()
        db.refresh(task)
        return {"id": task.id, "title": task.title, "completed": task.completed}
    finally:
        db.close()


def _list_tasks_db(user_id: str, status: str = "all") -> List[dict]:
    db = _db_session()
    try:
        q = db.query(Task).filter(Task.user_id == user_id)

        status = (status or "all").lower()
        if status == "pending":
            q = q.filter(Task.completed.is_(False))
        elif status == "completed":
            q = q.filter(Task.completed.is_(True))

        rows = q.order_by(Task.id.asc()).all()
        return [{"id": t.id, "title": t.title, "completed": t.completed} for t in rows]
    finally:
        db.close()


def _complete_task_db(user_id: str, task_id: int) -> dict | None:
    db = _db_session()
    try:
        task = (
            db.query(Task)
            .filter(Task.user_id == user_id, Task.id == task_id)
            .first()
        )
        if not task:
            return None

        task.completed = True
        db.commit()
        return {"id": task.id, "title": task.title, "completed": task.completed}
    finally:
        db.close()


def _delete_task_db(user_id: str, task_id: int) -> bool:
    db = _db_session()
    try:
        task = (
            db.query(Task)
            .filter(Task.user_id == user_id, Task.id == task_id)
            .first()
        )
        if not task:
            return False

        db.delete(task)
        db.commit()
        return True
    finally:
        db.close()


# -------------------------
# Chat runner
# -------------------------

async def run_user_chat(user_id: str, message: str) -> str:
    history = _get_history(user_id)
    _append(history, "user", message)

    text = message.strip()

    # ---- ADD TASK ----
    m = re.match(r"^add\s+(.+)$", text, re.I)
    if m:
        task = _add_task_db(user_id, m.group(1))
        reply = f"Added task ({task['id']}): {task['title']}"
        _append(history, "assistant", reply)
        return reply

    # ---- LIST TASKS ----
    m = re.match(r"^list(?:\s+(all|pending|completed))?$", text, re.I)
    if m:
        status = (m.group(1) or "all").lower()
        tasks = _list_tasks_db(user_id, status)
        reply = _format_tasks(tasks)
        _append(history, "assistant", reply)
        return reply

    # ---- COMPLETE TASK ----
    m = re.match(r"^complete\s+(\d+)$", text, re.I)
    if m:
        t = _complete_task_db(user_id, int(m.group(1)))
        reply = f"Completed task ({t['id']})." if t else "Task not found."
        _append(history, "assistant", reply)
        return reply

    # ---- DELETE TASK ----
    m = re.match(r"^delete\s+(\d+)$", text, re.I)
    if m:
        ok = _delete_task_db(user_id, int(m.group(1)))
        reply = "Task deleted." if ok else "Task not found."
        _append(history, "assistant", reply)
        return reply

    # ---- FALLBACK: AI CHAT ----
    reply = await _agent.run(text, history=history)
    _append(history, "assistant", reply)
    return reply
