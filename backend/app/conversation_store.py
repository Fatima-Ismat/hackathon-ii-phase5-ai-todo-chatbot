from sqlalchemy.orm import Session
from .models import Conversation, Message

def get_or_create_conversation(db: Session, user_id: str) -> Conversation:
    convo = (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.created_at.desc())
        .first()
    )
    if not convo:
        convo = Conversation(user_id=user_id)
        db.add(convo)
        db.commit()
        db.refresh(convo)
    return convo

def save_message(db: Session, conversation_id: int, role: str, content: str):
    msg = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
    )
    db.add(msg)
    db.commit()

def load_history(db: Session, conversation_id: int, limit: int = 20):
    msgs = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
        .all()
    )
    return [{"role": m.role, "content": m.content} for m in msgs]
