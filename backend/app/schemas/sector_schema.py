from pydantic import BaseModel
from typing import Optional, List

class SectorSchema(BaseModel):
    id: Optional[int]
    name: str
    linked_analysts: Optional[List[int]] = []

    class Config:
        orm_mode = True
