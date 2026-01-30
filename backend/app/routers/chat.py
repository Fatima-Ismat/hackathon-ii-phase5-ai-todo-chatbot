from __future__ import annotations

from typing import Optional, List, Dict

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Conversation, Message
from ..agent_runner import run_todo_agent

router = APIRouter(prefix="/api/{user_id}", tags=["chat"])


class ChatPayload(BaseModel):
    message: str
    conversation_id: Optional[int] = None


@router.post("/chat")
async def chat(
    user_id: str,
    payload: ChatPayload,
    db: Session = Depends(get_db),
):
    # 1) validate input
    text = (payload.message or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="message is required")

    # 2) find or create conversation
    conversation: Optional[Conversation] = None

    if payload.conversation_id:
        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == payload.conversation_id,
                Conversation.user_id == user_id,
            )
            .first()
        )

    if conversation is None:
        conversation = Conversation(user_id=user_id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    conversation_id = conversation.id

    # 3) save USER message
    db.add(
        Message(
            conversation_id=conversation_id,
            role="user",
            content=text,
        )
    )
    db.commit()

    # 4) load history
    HISTORY_LIMIT = 20
    rows: List[Message] = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.id.asc())
        .limit(HISTORY_LIMIT)
        .all()
    )

    history: List[Dict[str, str]] = [
        {"role": r.role, "content": r.content} for r in rows
    ]

    # 5) run agent
    result = await run_todo_agent(
        user_id=user_id,
        message=text,
        conversation_id=conversation_id,
        history=history,
    )

    reply_text = (result.get("response") or "").strip() or "OK"

    # 6) save ASSISTANT message
    db.add(
        Message(
            conversation_id=conversation_id,
            role="assistant",
            content=reply_text,
        )
    )
    db.commit()

    return {
        "conversation_id": conversation_id,
        "response": reply_text,
        "tool_calls": result.get("tool_calls", []),
    }
