"""
Phase 5 - Chat runner
Connects:
- user_id -> stored history
- agent -> uses history
- updates store with new history

No DB yet, no tools yet.
"""

from app.agents.agent import TodoAgent
from app.agents.store import get_history, set_history

agent = TodoAgent()


async def run_user_chat(user_id: str, message: str) -> str:
    history = get_history(user_id)
    reply = await agent.run(message, history=history)

    # Agent returns reply, and we want to keep updated history.
    # Agent currently returns only reply, so we rebuild expected history shape:
    # The history list is the same object agent used (mem.messages) if provided.
    # Since we passed 'history' (a list), it gets appended in agent.
    set_history(user_id, history)

    return reply
