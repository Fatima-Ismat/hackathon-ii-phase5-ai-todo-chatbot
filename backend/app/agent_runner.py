"""
Phase 5 - Agent Runner (STABLE)

Fixes:
- No AI fallback (prevents 500 crash from broken ConversationMemory)
- Commands supported:
  add <title>
  list [all|pending|completed]
  complete <id|title>
  delete <id|title>
  stats
  help
- Per-user history (in-memory)
- ASCII-safe replies
"""

from __future__ import annotations

from typing import Dict, List, Optional, Literal
import re

from app.tools.tasks import add_task, list_tasks, complete_task, delete_task

# user_id -> chat history (simple in-memory transcript)
_USER_HISTORY: Dict[str, List[dict]] = {}


def _get_history(user_id: str) -> List[dict]:
    return _USER_HISTORY.setdefault(user_id, [])


def _append(history: List[dict], role: str, content: str) -> None:
    history.append({"role": role, "content": content})


def _format_tasks(tasks: List[dict]) -> str:
    if not tasks:
        return "No tasks."
    lines: List[str] = []
    for t in tasks:
        status = "[x]" if bool(t.get("completed")) else "[ ]"
        lines.append(f"{status} ({t.get('id')}) {t.get('title')}")
    return "\n".join(lines)


def _find_task_id_by_title(user_id: str, title: str) -> Optional[int]:
    title_norm = title.strip().lower()
    if not title_norm:
        return None
    tasks = list_tasks(user_id, "all")  # type: ignore[arg-type]
    for t in tasks:
        if str(t.get("title", "")).strip().lower() == title_norm:
            return int(t.get("id"))
    return None


def _parse_id_or_title(user_id: str, raw: str) -> Optional[int]:
    raw = raw.strip()
    if not raw:
        return None
    if raw.isdigit():
        return int(raw)
    return _find_task_id_by_title(user_id, raw)


def _help_text() -> str:
    return (
        "Commands:\n"
        "  add <title>\n"
        "  list [all|pending|completed]\n"
        "  complete <id|title>\n"
        "  delete <id|title>\n"
        "  stats\n"
        "Examples:\n"
        "  add milk\n"
        "  list\n"
        "  complete 1\n"
        "  complete milk\n"
        "  delete 1\n"
    )


async def run_user_chat(user_id: str, message: str) -> str:
    history = _get_history(user_id)
    _append(history, "user", message)

    text = (message or "").strip()

    # ---- HELP ----
    if re.match(r"^(help|\?)$", text, re.I):
        reply = _help_text()
        _append(history, "assistant", reply)
        return reply

    # ---- ADD TASK ----
    m = re.match(r"^add\s+(.+)$", text, re.I)
    if m:
        title = m.group(1).strip()
        if not title:
            reply = "Please provide a title. Example: add milk"
            _append(history, "assistant", reply)
            return reply

        task = add_task(user_id, title)
        reply = f"Added task ({task['id']}): {task['title']}"
        _append(history, "assistant", reply)
        return reply

    # ---- LIST TASKS ----
    m = re.match(r"^list(?:\s+(all|pending|completed))?$", text, re.I)
    if m:
        status = (m.group(1) or "all").lower()
        if status not in ("all", "pending", "completed"):
            status = "all"
        tasks = list_tasks(user_id, status)  # type: ignore[arg-type]
        reply = _format_tasks(tasks)
        _append(history, "assistant", reply)
        return reply

    # ---- STATS ----
    if re.match(r"^stats$", text, re.I):
        tasks = list_tasks(user_id, "all")  # type: ignore[arg-type]
        total = len(tasks)
        done = len([t for t in tasks if bool(t.get("completed"))])
        pending = total - done
        reply = f"Total: {total}\nPending: {pending}\nCompleted: {done}"
        _append(history, "assistant", reply)
        return reply

    # ---- COMPLETE TASK (id OR title) ----
    m = re.match(r"^complete\s+(.+)$", text, re.I)
    if m:
        raw = m.group(1).strip()
        tid = _parse_id_or_title(user_id, raw)
        if tid is None:
            reply = "Task not found."
            _append(history, "assistant", reply)
            return reply

        t = complete_task(user_id, tid, True)
        reply = f"Completed task ({tid})." if t else "Task not found."
        _append(history, "assistant", reply)
        return reply

    # ---- DELETE TASK (id OR title) ----
    m = re.match(r"^(delete|remove)\s+(.+)$", text, re.I)
    if m:
        raw = m.group(2).strip()
        tid = _parse_id_or_title(user_id, raw)
        if tid is None:
            reply = "Task not found."
            _append(history, "assistant", reply)
            return reply

        ok = delete_task(user_id, tid)
        reply = "Task deleted." if ok else "Task not found."
        _append(history, "assistant", reply)
        return reply

    # ---- FALLBACK (NO AI) ----
    reply = "I can only run todo commands right now.\n\n" + _help_text()
    _append(history, "assistant", reply)
    return reply


# Backwards-compat alias for routers/chat.py import
async def run_todo_agent(user_id: str, message: str) -> str:
    return await run_user_chat(user_id=user_id, message=message)
