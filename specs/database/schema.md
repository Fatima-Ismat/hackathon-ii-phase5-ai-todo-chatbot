# Database Schema (Phase-3)

## tasks
- id: int (PK)
- user_id: string (index)
- title: string
- description: text (optional)
- completed: bool (default false)
- created_at: datetime
- updated_at: datetime

## conversations
- id: int (PK)
- user_id: string (index)
- created_at: datetime
- updated_at: datetime

## messages
- id: int (PK)
- user_id: string (index)
- conversation_id: int (FK -> conversations.id)
- role: "user" | "assistant"
- content: text
- created_at: datetime
