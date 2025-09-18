from sqlmodel import SQLModel, Field
from typing import Optional

class Attachment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    message_id: int
    type: str
    file_path: str
