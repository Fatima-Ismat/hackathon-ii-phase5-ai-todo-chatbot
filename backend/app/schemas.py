from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str

class TaskRead(BaseModel):
    id: int
    user_id: str
    title: str
    completed: bool

    class Config:
        from_attributes = True

class ChatPayload(BaseModel):
    message: str
