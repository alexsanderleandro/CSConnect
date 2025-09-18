from pydantic import BaseModel
from typing import Optional

class AttendanceSchema(BaseModel):
    id: Optional[int]
    client_id: int
    sector_id: int
    status: str
    assigned_analyst: Optional[int]

    class Config:
        orm_mode = True
