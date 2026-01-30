"""
Phase 5 - Real OpenAI Agents SDK wiring (no tools, no DB yet)

- Uses openai-agents: Agent + Runner
- Still keeps our in-memory history structure
"""

from typing import List, Dict, Optional

from dotenv import load_dotenv
from agents import Agent, Runner

from app.agents.memory import ConversationMemory

# Load env vars if a .env exists (local/dev). In production, env vars come from platform.
load_dotenv()


class TodoAgent:
    def __init__(self):
        self.system_prompt = (
            "You are a helpful AI Todo assistant.\n"
            "You will soon be connected to tools to manage tasks (add/list/complete/delete).\n"
            "For now: reply conversationally and confirm you understand.\n"
            "Keep replies short and clear."
        )

        # Real Agents SDK agent
        self._agent = Agent(
            name="TodoAssistant",
            instructions=self.system_prompt,
        )

    async def run(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """
        Phase-5 Step-10:
        - Build a simple text context from history
        - Call Agents SDK Runner (real model call)
        - Return final_output
        """
        mem = ConversationMemory()
        if history:
            mem.messages = history

        mem.add_user_message(message)

        # Simple context packing (DB + sessions later)
        context_lines = []
        for m in mem.get_history()[-12:]:
            role = m.get("role", "user")
            content = m.get("content", "")
            context_lines.append(f"{role}: {content}")

        prompt = "\n".join(context_lines) if context_lines else message

        # Real agent run (async)
        result = await Runner.run(self._agent, prompt)
        reply = (result.final_output or "").strip() or "OK."

        mem.add_assistant_message(reply)

        # IMPORTANT: because we mutated the same `history` list (if provided),
        # runner/store will keep it updated.
        return reply
