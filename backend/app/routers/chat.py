from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.agent_runner import run_todo_agent

router = APIRouter(prefix="/api/{user_id}", tags=["chat"])


class ChatPayload(BaseModel):
    message: str


@router.post("/chat")
async def chat(user_id: str, payload: ChatPayload):
    reply = await run_todo_agent(user_id=user_id, message=payload.message)
    return {"reply": reply}
