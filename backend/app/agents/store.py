"""
Phase 5 - In-memory conversation store (per user)
No DB yet.
"""

from typing import Dict, List

# user_id -> list of messages [{role, content}]
USER_HISTORY: Dict[str, List[dict]] = {}


def get_history(user_id: str) -> List[dict]:
    return USER_HISTORY.get(user_id, [])


def set_history(user_id: str, history: List[dict]) -> None:
    USER_HISTORY[user_id] = history
