from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.agent_runner import run_todo_agent

router = APIRouter(tags=["chat"])


class ChatPayload(BaseModel):
    message: str


@router.post("/{user_id}/chat")
async def chat(user_id: str, payload: ChatPayload) -> Dict[str, Any]:
    try:
        # agar tumhare agent ko history chahiye to yahan pass kar sakte ho
        history: List[Dict[str, str]] = []

        result = await run_todo_agent(
            user_id=user_id,
            message=payload.message,
            history=history,
        )

        # run_todo_agent kuch bhi return kare (string/dict), normalize:
        if isinstance(result, dict):
            return result
        return {"reply": str(result)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
