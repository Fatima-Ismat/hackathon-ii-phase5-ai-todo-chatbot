# backend/app/chat_history.py
from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session

from .db import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    messages: Mapped[List["Message"]] = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan"
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    conversation_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("conversations.id", ondelete="CASCADE"), index=True, nullable=False
    )
    role: Mapped[str] = mapped_column(String(32), nullable=False)  # "user" | "assistant"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")


def get_or_create_conversation(session: Session, user_id: str, conversation_id: Optional[int]) -> Conversation:
    if conversation_id:
        conv = session.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conv and conv.user_id == user_id:
            return conv

    conv = Conversation(user_id=user_id)
    session.add(conv)
    session.commit()
    session.refresh(conv)
    return conv


def add_message(session: Session, conversation_id: int, role: str, content: str) -> None:
    msg = Message(conversation_id=conversation_id, role=role, content=content)
    session.add(msg)
    session.commit()


def get_last_messages(session: Session, conversation_id: int, limit: int = 20) -> List[Tuple[str, str]]:
    rows = (
        session.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.id.desc())
        .limit(limit)
        .all()
    )
    rows.reverse()
    return [(r.role, r.content) for r in rows]
