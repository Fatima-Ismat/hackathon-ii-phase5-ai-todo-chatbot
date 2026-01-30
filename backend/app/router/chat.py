from fastapi import APIRouter
from pydantic import BaseModel

# IMPORTANT: use the runner that stores history per user
from app.agent_runner import run_user_chat

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/{user_id}/chat")
async def chat(user_id: str, req: ChatRequest):
    reply = await run_user_chat(user_id, req.message)
    return {"reply": reply}
