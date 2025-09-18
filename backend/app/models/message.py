from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int
    receiver_id: Optional[int] = None
    group_id: Optional[int] = None
    content: str
    attachments: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
