from sqlmodel import SQLModel, Field
from typing import Optional

class AttendanceQueue(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    client_id: int
    sector_id: int
    status: str = Field(default='waiting')
    assigned_analyst: Optional[int] = None
