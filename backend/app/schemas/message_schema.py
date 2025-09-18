from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MessageSchema(BaseModel):
    id: Optional[int]
    sender_id: int
    receiver_id: Optional[int]
    group_id: Optional[int]
    content: str
    attachments: Optional[List[str]] = []
    timestamp: Optional[datetime]

    class Config:
        orm_mode = True
