from pydantic import BaseModel
from typing import Optional

class AttachmentSchema(BaseModel):
    id: Optional[int]
    message_id: int
    type: str
    file_path: str

    class Config:
        orm_mode = True
