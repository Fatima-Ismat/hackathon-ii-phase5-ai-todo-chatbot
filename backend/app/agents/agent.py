"""
Phase 5 - TodoAgent (no circular imports)

- Real OpenAI call (Chat Completions via httpx)
- Keeps our history list (passed from runner) intact
"""

from typing import List, Dict, Optional
import os

import httpx
from dotenv import load_dotenv

from app.agents.memory import ConversationMemory

load_dotenv()


class TodoAgent:
    def __init__(self):
        self.base_system_prompt = (
            "You are a helpful AI Todo assistant. Keep replies short and clear."
        )

    async def run(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        mem = ConversationMemory()

        # IMPORTANT: keep same list object so runner persists it
        if history is not None:
            mem.messages = history

        mem.add_user_message(message)

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            reply = "OPENAI_API_KEY missing. Add key to enable real AI."
            mem.add_assistant_message(reply)
            return reply

        model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

        messages = [{"role": "system", "content": self.base_system_prompt}]
        for m in mem.get_history()[-12:]:
            role = m.get("role", "user")
            content = m.get("content", "")
            if role == "assistant":
                messages.append({"role": "assistant", "content": content})
            else:
                messages.append({"role": "user", "content": content})

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "model": model,
                        "messages": messages,
                        "temperature": 0.3,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                reply = (data["choices"][0]["message"]["content"] or "").strip() or "OK."
        except Exception as e:
            reply = f"OpenAI call failed: {type(e).__name__}"
            mem.add_assistant_message(reply)
            return reply

        mem.add_assistant_message(reply)
        return reply
