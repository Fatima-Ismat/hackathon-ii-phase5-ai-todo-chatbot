"""
Phase 5 - Conversation Memory (DB-ready shape)

- Neutral, portable message schema
- Easy to persist later (SQL/Neon)
"""

from typing import List, Dict
from datetime import datetime


class ConversationMemory:
    def __init__(self, messages: List[Dict] | None = None):
        self.messages: List[Dict] = messages or []

    def add(self, role: str, content: str):
        self.messages.append(
            {
                "role": role,               # "user" | "assistant"
                "content": content,
                "ts": datetime.utcnow().isoformat(),
            }
        )

    def add_user(self, content: str):
        self.add("user", content)

    def add_assistant(self, content: str):
        self.add("assistant", content)

    def get(self) -> List[Dict]:
        return self.messages
